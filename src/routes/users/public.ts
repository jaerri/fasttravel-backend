import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { usersTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { userPublicFields } from "../../viewSchemas/users.js";
import type { IParamsId } from "../../viewSchemas/shared.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify
    fastify.get<{ Params: IParamsId }>('/:id',
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
};
export default plugin; 