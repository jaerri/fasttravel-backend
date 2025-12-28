import { type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { vehiclesTable } from "../../db/schema.js";
import type { IParamsId } from "../../viewSchemas/shared.js";
import { eq } from "drizzle-orm";
import { vehiclePublicFields } from "../../viewSchemas/vehicles.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify;
    fastify.get<{ Params: IParamsId }>("/:id",
        {
            schema: {
                response: {
                    200: vehiclePublicFields.TypeBoxSchema
                }
            },
        },
        async (request, reply) => {
            const vehicleId = request.params.id;

            if (isNaN(vehicleId)) return reply.notFound();

            const [vehicle] = await db.select(vehiclePublicFields.DBView)
                .from(vehiclesTable)
                .where(eq(vehiclesTable.id, vehicleId))
            return reply.send(vehicle);
        }
    );
}
export default plugin; 