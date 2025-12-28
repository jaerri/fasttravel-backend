import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { userPublicFields } from "../../viewSchemas/users.js";
import type { IParamsId } from "../../viewSchemas/shared.js";
import bcrypt from 'bcrypt';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify
    fastify.get<{ Params: IParamsId }>('/:id',
        {
            schema: {
                response: {
                    200: userPublicFields.TypeBoxSchema
                }
            }
        },
        async (request, reply) => {
            const { id } = request.params;
            if (isNaN(id)) return reply.notFound();

            const [data] = await db
                .select(userPublicFields.DBView)
                .from(usersTable)
                .where(eq(usersTable.id, id))
                .limit(1);
            if (data) {
                return reply.send(data);
            } else return reply.notFound();
        }
    );

    fastify.post('/login',
        {
            schema: {
                body: Type.Object({
                    email: Type.String(),
                    password: Type.String()
                })
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;

            const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
            if (user) {
                if (await bcrypt.compare(password, user.passwordHash)) {
                    const token: string = await reply.jwtSign({ id: user.id }, { expiresIn: "7d" });
                    return reply.send({ token })
                }
            } else return reply.unauthorized("Invalid credentials.");
        }
    );
    fastify.post('/register',
        {
            schema: {
                body: Type.Object({
                    email: Type.String(),
                    password: Type.String(),
                    firstName: Type.String(),
                    lastName: Type.String()
                })
            },
        },
        async (request, reply) => {
            const { email, password, firstName, lastName } = request.body;

            const checkExisting = await db.select().from(usersTable).where(eq(usersTable.email, email));
            if (checkExisting.length > 0) {
                return reply.code(409).send({ message: "Email already exists." });
            }

            const insert = {
                email,
                passwordHash: await bcrypt.hash(password, 10),
                firstName,
                lastName
            }
            const [user] = await db.insert(usersTable).values(insert).returning();

            const token: string = await reply.jwtSign({ id: user!.id }, { expiresIn: "7d" });
            const location = `${fastify.listeningOrigin}/users/${user!.id}`;
            return reply
                .code(200)
                .header("location", location)
                .send({ token });
        }
    );
};

export default plugin; 