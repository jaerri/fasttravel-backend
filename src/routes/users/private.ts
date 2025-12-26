import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { userPrivateFields } from "../../viewSchemas/users.js";
import type { onRequestHookHandler } from "fastify";


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify
    fastify.addHook("onRequest", fastify.getDecorator<onRequestHookHandler>("authenticate"));

    fastify.get('/me',
        async (request, reply) => {
            const { id } = request.user;

            const [data] = await db
                .select(userPrivateFields.DBView)
                .from(usersTable)
                .where(eq(usersTable.id, id))
                .limit(1);
            if (data) {
                return reply.send(data);
            } else return reply.notFound();
        }
    );

    const updateUserBody = Type.Partial(
        Type.Object(userPrivateFields.TypeBoxSchema, {additionalProperties: false})
    );
    fastify.put('/me',
        {
            schema: {
                body: updateUserBody,
                response: {
                    200: updateUserBody
                }
            }
        },
        async (request, reply) => {
            const { id } = request.user;
            const update = request.body;

            const [user] = await db
                .update(usersTable)
                .set(update)
                .where(eq(usersTable.id, id)).returning();
            if (user) {
                return reply.send(update);
            }
        }
    )
};
export default plugin; 