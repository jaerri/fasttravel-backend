import 'dotenv/config';
import * as Fastify from "fastify";
import fastifyAutoload from '@fastify/autoload';
import sensible from "@fastify/sensible"
import path from 'node:path';
import auth from './plugins/auth.js';
import drizzledb from './plugins/drizzle.js';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyRateLimit from '@fastify/rate-limit';

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
await fastify.register(fastifySwagger, {
    openapi: {
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    }
});
await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs'
});
fastify.register(sensible);
fastify.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
    cascadeHooks: true,
});
await fastify.register(fastifyRateLimit, {
    max: 30,
    timeWindow: '1 minute'
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
await fastify.ready();
fastify.swagger();
fastify.listen({ port: Number(process.env.PORT) ?? 3000 });
