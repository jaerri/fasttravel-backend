import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import type { onRequestHookHandler } from "fastify";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/',
        {
            schema: {
                response: {
                    200: {
                        hello: Type.String()
                    }
                }
            },
            // onRequest: fastify.getDecorator<onRequestHookHandler>("authenticate")
        },
        async (request, reply) => {
            return {hello: "world"};
        }
    );
};
export default plugin; 