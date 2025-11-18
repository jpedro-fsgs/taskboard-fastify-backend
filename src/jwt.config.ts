import "@fastify/jwt";
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: { sub: string };
    }
}

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}

export async function jwtConfig(fastify: FastifyInstance) {
    if (!process.env.JWT_SECRET) {
        fastify.log.error("JWT_SECRET is not defined in environment variables");
        process.exit(1);
    }
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET,
    });

    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: "Unauthorized" });
        }
    });
}
