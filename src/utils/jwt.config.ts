import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";

// Module augmentation for fastify/jwt and fastify instance types
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

export default async function jwtConfig(fastify: FastifyInstance) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        fastify.log.error("JWT_SECRET is not set");
        // Fail fast if not set
        process.exit(1);
    }

    await fastify.register(fastifyJwt, {
        secret: jwtSecret,
    });

    fastify.decorate("authenticate", async function (request, reply) {
        const auth = request.headers.authorization;

        if (!auth || !auth.startsWith("Bearer ")) {
            return reply.code(401).send({ message: "Unauthorized" });
        }

        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.code(401).send({ message: "Unauthorized" });
        }
    });
}