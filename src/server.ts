import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
    validatorCompiler,
    serializerCompiler,
    ZodTypeProvider,
    jsonSchemaTransform,
} from "fastify-type-provider-zod";

import tasksRoute from "./modules/task/tasks.route";
import usersRoute from "./modules/user/users.route";
import authRoute from "./modules/auth/auth.route";
import fastifyJwt from "@fastify/jwt";

// Determine environment
const isDev = process.env.NODE_ENV === "development";
// Instantiate Fastify with proper logging configuration on development and production
const fastify = Fastify({
    logger: isDev
        ? {
              transport: {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: true,
                  },
              },
              level: "debug",
          }
        : {
              level: "info",
          },
}).withTypeProvider<ZodTypeProvider>();

fastify.log.info(`Environment: ${process.env.NODE_ENV}`);


const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    fastify.log.error("JWT_SECRET is not set");
    process.exit(1);
}

fastify.register(fastifyJwt, {
    secret: jwtSecret,
});


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

fastify.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ message: "Unauthorized" });
    }
});

// --- Set up Zod as validator and serializer ---
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// --- Register Swagger ---
fastify.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Taskboard API",
            description: "Documentação da API do Taskboard",
            version: "1.0.0",
        },
    },
    transform: jsonSchemaTransform,
});

fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

fastify.register(tasksRoute, { prefix: "/api/tasks" });
fastify.register(usersRoute, { prefix: "/api/users" });
fastify.register(authRoute, { prefix: "/api/auth" });

fastify
    .listen({ port: 3333, host: "0.0.0.0" })
    .then(() => {
        fastify.log.info(`This was a triumph.`);
        fastify.log.info(`I'm making a note here: HUGE SUCCESS.`);
        fastify.log.info(`It's hard to overstate my satisfaction.`);
    })
    .catch((err) => {
        fastify.log.error(err);
        process.exit(1);
    });
