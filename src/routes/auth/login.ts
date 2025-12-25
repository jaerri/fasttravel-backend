import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from 'bcrypt';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify;
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
};
export default plugin; 