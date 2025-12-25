import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { publicUserView } from "../../db/views.js";
import type { IParamsId } from "../../validation_schemas/shared.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify
    fastify.get<{ Params: IParamsId }>('/:id',
        async (request, reply) => {
            const { id } = request.params;
            if (isNaN(id)) return reply.notFound();

            const [data] = await db
                .select()
                .from(publicUserView)
                .where(eq(usersTable.id, id))
                .limit(1);
            if (data) {
                return reply.send(data);
            } else return reply.notFound();
        }
    );
};
export default plugin; 