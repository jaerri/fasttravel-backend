import 'dotenv/config';
import * as Fastify from "fastify";
import fastifyAutoload from '@fastify/autoload';
import sensible from "@fastify/sensible"
import path from 'node:path';
import auth from './plugins/auth.js';
import drizzledb from './plugins/drizzle.js';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const fastify = Fastify.fastify({ 
    logger: true,
    ajv: {
        customOptions: {
            strict: true,
            removeAdditional: false
        }
    }
 }).withTypeProvider<TypeBoxTypeProvider>();

fastify.register(auth);
fastify.register(drizzledb);
fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
    cascadeHooks: true,
});
fastify.setErrorHandler((err: Fastify.FastifyError, request, reply) => {
    fastify.log.error(
        {
            err,
            request: {
                method: request.method,
                url: request.url,
                query: request.query,
                params: request.params
            }
        },
    )

    if (err.statusCode && err.statusCode < 500) {
        throw err;
    }

    return reply.internalServerError();
})
fastify.register(sensible);
fastify.listen({ port: Number(process.env.PORT) ?? 3000 });
