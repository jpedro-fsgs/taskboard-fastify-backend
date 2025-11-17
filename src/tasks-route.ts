import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient, Task } from "@prisma/client";
import { buildTree } from "./utils";

const prisma = new PrismaClient();

// Export as a Fastify plugin (route file)
export default async function tasksRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    // Simple GET route with querystring typing
    fastify.get<{ Querystring: { name?: string } }>(
        "/hello",
        async (request) => {
            const name = request.query.name ?? "world";
            return { hello: name };
        }
    );

    // List tasks. Optional querystring `userId` to filter by owner.
    fastify.get<{ Querystring: { userId?: string } }>(
        "/",
        // {
        //     schema: {
        //         response: {
        //             200: {
        //                 type: "object",
        //                 properties: {
        //                     data: {
        //                         type: "array",
        //                         items: {
        //                             type: "object",
        //                             properties: {
        //                                 id: { type: "string" },
        //                                 title: { type: "string" },
        //                                 description: { type: ["string", "null"] },
        //                                 is_done: { type: "boolean" },
        //                                 deleted_at: { type: ["string", "null"] },
        //                                 parent_task_id: { type: ["string", "null"] },
        //                                 user_id: { type: "string" },
        //                                 sub_tasks: {
        //                                     type: "array",
        //                                     items: { $ref: "#" }
        //                                 }
        //                             }
        //                         },
        //                     },
        //                 },
        //             },
        //         },
        //     },
        // },
        async (request) => {
            const userId = request.query.userId;
            const where: any = { deleted_at: null };
            if (userId) where.userId = userId;

            const tasks: Task[] = await prisma.task.findMany({ where });
            console.log("Fetched tasks:", tasks);
            const tasksTree = buildTree(tasks);
            return { data: tasksTree };
        }
    );

    // Create a task. `userId` is required by the Prisma schema.
    fastify.post<{
        Body: {
            title: string;
            description?: string;
            is_done?: boolean;
            parent_task_id: string;
            user_id: string;
        };
    }>(
        "/create",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["title", "user_id"],
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        is_done: { type: "boolean" },
                        parent_task_id: { type: "string" },
                        user_id: { type: "string" },
                    },
                },
                response: {
                    201: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            description: { type: ["string", "null"] },
                            is_done: { type: "boolean" },
                            deleted_at: { type: ["string", "null"] },
                            user_id: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { title, description, is_done, parent_task_id, user_id } =
                request.body;

            const created = await prisma.task.create({
                data: {
                    title,
                    description: description ?? null,
                    is_done: is_done ?? false,
                    parent_task_id: parent_task_id ?? null,
                    user_id,
                },
            });

            reply.code(201).send(created);
        }
    );

    // Get a single task by id
    fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const id = request.params.id;
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task || task.deleted_at)
            return reply.code(404).send({ message: "Not found" });
        return task;
    });
}
