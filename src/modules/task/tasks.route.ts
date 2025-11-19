import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
    getTasksHandler,
    createTaskHandler,
    getTaskByIdHandler,
    setTaskDoneHandler,
    softDeleteTaskHandler,
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
                security: [{ CookieAuth: [] }],
                description: "Retrieve a list of tasks",
                response: {
                    200: tasksArrayResponseSchema,
                },
            },
            onRequest: [fastify.authenticate],
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
                security: [{ CookieAuth: [] }],
                description: "Create a new task",
                body: createTaskSchema,
                response: {
                    201: createTaskResponseSchema,
                },
            },
            onRequest: [fastify.authenticate],
            
        },
        createTaskHandler
    );

    // Get task by id
    fastify.get<{ Params: { id: string } }>(
        "/:id",
        { schema: { tags: ["tasks"] } },
        getTaskByIdHandler
    );

    fastify.patch<{
        Body: { id: string; is_done: boolean };
    }>(
        "/set-done",
        {
            schema: {
                tags: ["tasks"],
                security: [{ CookieAuth: [] }],
                description: "Set task as done or not done",
                body: z.object({
                    id: z.string(),
                    is_done: z.boolean(),
                }),
            },
            onRequest: [fastify.authenticate],
        },
        setTaskDoneHandler
    );

    fastify.delete<{ Params: { id: string } }>(
        "/:id",
        {
            schema: {
                tags: ["tasks"],
                security: [{ CookieAuth: [] }],
                description: "Soft delete a task (mark as deleted)",
                params: z.object({
                    id: z.string(),
                }),
                response: {
                    200: z.object({
                        success: z.boolean(),
                    }),
                },
            },
            onRequest: [fastify.authenticate],
        },
        softDeleteTaskHandler
    );
}
