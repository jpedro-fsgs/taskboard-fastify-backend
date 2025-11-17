// Import the framework and instantiate it
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";

import tasksRoute from "./tasks-route";

const fastify = Fastify({
    logger: true,
});

fastify.register(fastifySwagger, {
    openapi: {
        info: {
            title: "API de Exemplo",
            description: "Documentação da API de exemplo utilizando Fastify",
            version: "1.0.0",
        },
    },
});

fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

fastify.register(tasksRoute, { prefix: "/api" });

fastify.listen({ port: 3000 }) 
    .then(() => {
        fastify.log.info(`Server running`);
    })
    .catch((err) => {
        fastify.log.error(err);
        process.exit(1);
    });
