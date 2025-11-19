import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { loginHandler, logoutHandler } from "./auth.controller";
import { loginSchema, loginResponseSchema, LoginInput } from "./auth.schema";

export default async function authRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    fastify.post<{ Body: LoginInput }>(
        "/login",
        {
            schema: {
                tags: ["auth"],
                description: "Authenticate a user and set access token cookie",
                body: loginSchema,
                response: {
                    200: loginResponseSchema,
                },
            },
        },
        loginHandler
    );

    fastify.post(
        "/logout",
        {
            schema: {
                tags: ["auth"],
                description: "Logout a user by clearing the access token cookie",
            },
        },
        logoutHandler
    );
}
