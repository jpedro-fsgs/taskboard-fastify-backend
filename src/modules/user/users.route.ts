import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getUsersHandler, registerUserHandler } from "./users.controller";
import {
    CreateUserInput,
    createUserResponseSchema,
    createUserSchema,
    usersArrayResponseSchema,
} from "./users.schema";
// import { FastifyTypedInstance } from "../../utils/types";

export default async function usersRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    // Get users
    fastify.get(
        "/",
        {
            schema: {
                tags: ["users"],
                description: "Retrieve a list of all users",
                response: {
                    200: usersArrayResponseSchema,
                },
            },
        },
        getUsersHandler
    );

    // Create user
    fastify.post<{
        Body: CreateUserInput;
    }>(
        "/",
        {
            schema: {
                tags: ["users"],
                description: "Register a new user",
                body: createUserSchema,
                response: {
                    201: createUserResponseSchema,
                },
            },
        },
        registerUserHandler
    );
}
