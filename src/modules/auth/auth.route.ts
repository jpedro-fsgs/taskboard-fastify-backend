import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { loginHandler } from "./auth.controller";
import { loginSchema, loginResponseSchema } from "./auth.schema";

export default async function authRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    fastify.post<{ Body: import("./auth.schema").LoginInput }>(
        "/login",
        {
            schema: {
                tags: ["auth"],
                description: "Authenticate a user and return a JWT",
                body: loginSchema,
                response: {
                    200: loginResponseSchema,
                },
            },
        },
        loginHandler
    );
}
