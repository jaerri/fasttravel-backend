import "dotenv/config";
import { drizzle } from 'drizzle-orm/node-postgres';
import type { FastifyInstance } from 'fastify';
import fp from "fastify-plugin"

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle>;
  }
}
export default fp(async (fastify: FastifyInstance) => {
	const db = drizzle({
		connection: {
			connectionString: process.env.DATABASE_URL!,
		},
		casing: "snake_case"
	});
	fastify.decorate("db", db);
});