import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { privateUserView } from "../../db/views.js";
import type { onRequestHookHandler } from "fastify";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify
    fastify.addHook("onRequest", fastify.getDecorator<onRequestHookHandler>("authenticate"));

    fastify.get('/me',
        async (request, reply) => {
            const {id} = request.user;

            const [data] = await db
                .select()
                .from(privateUserView)
                .where(eq(usersTable.id, id))
                .limit(1);
            if (data) {
                return reply.send(data);
            } else return reply.notFound();
        }
    );
};
export default plugin; 