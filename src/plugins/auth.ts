import "dotenv/config";
import type { onRequestHookHandler } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { id: number } // payload type is used for signing and verifying
        user: { id: number } // user type is return type of `request.user` object
    }
}

export default fp(async (fastify) => {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET!,
    });

    fastify.decorate<onRequestHookHandler>('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
            if (!request.user.id) return reply.badRequest();
        } catch (err) {
            return reply.unauthorized();
        }
    });
});
