import { Type, type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { vehiclesTable } from "../../db/schema.js";
import { VehicleUpdateTypeBox } from "../../validation_schemas/vehicles.js";
import type { onRequestHookHandler } from "fastify";
import type { IParamsId } from "../../validation_schemas/shared.js";
import { and, eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify;
    fastify.addHook("onRequest", fastify.getDecorator<onRequestHookHandler>("authenticate"));
    fastify.post('/',
        {
            schema: {
                body: Type.Omit(VehicleUpdateTypeBox, ['ownerId'])
            },
        },
        async (request, reply) => {
            const { id } = request.user;
            const insert: typeof vehiclesTable.$inferInsert = {
                ownerId: id,
                ...request.body
            }
            try {
                const [vehicle] = await db.insert(vehiclesTable).values(insert).returning();
                return reply
                    .code(201)
                    .header("location", fastify.listeningOrigin + "/vehicles/" + vehicle!.id)
                    .send({ vehicle_id: vehicle!.id });
            } catch {
                return reply.badRequest();
            }
        }
    );
    fastify.get("/",
        {
            schema: {
                response: {
                    200: Type.Object({
                        vehicles: Type.Array(createSelectSchema(vehiclesTable))
                    })
                }
            }
        },
        async (request, reply) => {
            const ownerId = request.user.id;
            const vehicles = await db.select()
                .from(vehiclesTable)
                .where(eq(vehiclesTable.ownerId, ownerId))
            return reply.send({ vehicles: vehicles });
        }
    );
    fastify.delete<{ Params: IParamsId }>("/:id",
        async (request, reply) => {
            const vehicleId = request.params.id;
            const ownerId = request.user.id;

            if (isNaN(vehicleId)) return reply.notFound();

            const [deleted] = await db.delete(vehiclesTable).where(
                and(
                    eq(vehiclesTable.id, vehicleId),
                    eq(vehiclesTable.ownerId, ownerId)
                )
            ).returning();
            if (deleted) {
                return reply.code(204).send();
            } else return reply.notFound();
        }
    );
};
export default plugin; 