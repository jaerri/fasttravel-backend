import { type FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
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
    fastify.get("/",
        {
            schema: {
                response: {
                    200: Type.Object(vehiclePrivateFields.TypeBoxSchema)
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