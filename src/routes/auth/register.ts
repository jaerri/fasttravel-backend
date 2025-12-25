import { type FastifyPluginAsyncTypebox, RequiredInstantiate, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify;
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
            if (checkExisting.length>0) {
                return reply.code(409).send({message: "Email already exists."});
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
                .code(201)
                .header("location", location)
                .send({ token });
        }
    );
};
export default plugin; 