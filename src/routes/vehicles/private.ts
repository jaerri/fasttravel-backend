import { type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type, type Static } from "@sinclair/typebox";
import { vehiclesTable } from "../../db/schema.js";
import type { onRequestHookHandler } from "fastify";
import type { IParamsId } from "../../viewSchemas/shared.js";
import { and, eq } from "drizzle-orm";
import { vehiclePrivateFields } from "../../viewSchemas/vehicles.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    const { db } = fastify;
    fastify.addHook("onRequest", fastify.getDecorator<onRequestHookHandler>("authenticate"));
    const vehicleUpdateTypeBox = Type.Partial(Type.Object(
        vehiclePrivateFields.TypeBoxSchema,
        { additionalProperties: false }
    ));

    fastify.post('/',
        {
            schema: {
                body: vehicleUpdateTypeBox,
                response: {
                    200: vehicleUpdateTypeBox
                }
            },
        },
        async (request, reply) => {
            const { id } = request.user;
            const insert = {
                ownerId: id,
                ...request.body
            }
            try {
                const [vehicle] = await db.insert(vehiclesTable).values(insert).returning();
                if (vehicle) {
                    return reply
                        .code(200)
                        .header("location", fastify.listeningOrigin + "/vehicles/" + vehicle!.id)
                        .send(vehicle);
                }
            } catch {
                return reply.badRequest();
            }
        }
    );

    fastify.get("/me",
        {
            schema: {
                response: {
                    200: Type.Object({
                        vehicles: Type.Array(
                            Type.Object({ id: Type.Integer(), ...vehiclePrivateFields.TypeBoxSchema })
                        )
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
    fastify.put<{ Params: IParamsId, Body: Static<typeof vehicleUpdateTypeBox> }>("/:id",
        {
            schema: {
                body: vehicleUpdateTypeBox,
                response: {
                    200: vehicleUpdateTypeBox
                }
            },
        },
        async (request, reply) => {
            const vehicleId = request.params.id;
            const ownerId = request.user.id;
            const update = request.body;

            if (isNaN(vehicleId)) return reply.notFound();
            const [updated] = await db.update(vehiclesTable).set(update).where(
                and(
                    eq(vehiclesTable.id, vehicleId),
                    eq(vehiclesTable.ownerId, ownerId)
                )
            ).returning();
            if (updated) {
                return reply.code(200).send(updated);
            } else return reply.notFound();
        }
    );
    fastify.delete<{ Params: IParamsId }>("/:id",
        {
            schema: {
                response: {
                    204: Type.Null({description: "Vehicle deleted"})
                }
            }
        },
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