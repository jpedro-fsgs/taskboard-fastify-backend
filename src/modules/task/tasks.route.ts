import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    getTasksHandler,
    createTaskHandler,
    getTaskByIdHandler,
} from "./tasks.controller";
import {
    createTaskSchema,
    createTaskResponseSchema,
    tasksArrayResponseSchema,
} from "./tasks.schema";
import z from "zod";

export default async function tasksRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    // List tasks
    fastify.get(
        "/",
        {
            schema: {
                tags: ["tasks"],
                description: "Retrieve a list of tasks (tree structure)",
                response: {
                    200: tasksArrayResponseSchema,
                },
            },
        },
        getTasksHandler
    );

    // Create task
    fastify.post<{
        Body: any;
    }>(
        "/create",
        {
            schema: {
                tags: ["tasks"],
                description: "Create a new task",
                body: createTaskSchema,
                response: {
                    201: createTaskResponseSchema,
                },
            },
        },
        createTaskHandler
    );

    // Get task by id
    fastify.get<{ Params: { id: string } }>(
        "/:id",
        { schema: { tags: ["tasks"] } },
        getTaskByIdHandler
    );
}
