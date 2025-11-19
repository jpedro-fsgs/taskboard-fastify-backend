import { FastifyReply, FastifyRequest } from "fastify";
import {
    createTaskService,
    getAllTasksService,
    findTaskByIdService,
} from "./tasks.service";
import { findUserByIdService } from "../user/users.service";
import { CreateTaskInput } from "./tasks.schema";

export const getTasksHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const userId = request.user.sub;
    const tasks = await getAllTasksService(userId);
    return reply.code(200).send({ items: tasks });
};

export const createTaskHandler = async (
    request: FastifyRequest<{ Body: CreateTaskInput }>,
    reply: FastifyReply
) => {
    const body = request.body;

    // Validate authenticated user exists
    const userId = request.user.sub;
    if (!userId) {
        return reply.code(401).send({ message: "Unauthorized" });
    }

    try {
        const user = await findUserByIdService(userId);
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }

        // If parent_task_id was provided, ensure it exists and is not deleted
        const parentId = body.parent_task_id;
        if (parentId) {
            const parentTask = await findTaskByIdService(parentId);
            if (!parentTask || parentTask.deleted_at) {
                return reply
                    .code(404)
                    .send({ message: "Parent task not found" });
            }
            if (parentTask && parentTask.user_id !== userId) {
                return reply
                    .code(403)
                    .send({ message: "Parent task belongs to a different user" });
            }

        }

        const created = await createTaskService(body, userId);
        reply.code(201).send(created);
    } catch (err: any) {
        request.log.error(err);

        // Prisma known request errors may include foreign-key violations; if so, return 400
        const code = err?.code;
        if (code === "P2003") {
            return reply.code(400).send({ message: "Invalid reference data" });
        }

        return reply.code(500).send({ message: "Internal error" });
    }
};

export const getTaskByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    const id = request.params.id;
    const task = await findTaskByIdService(id);
    if (!task || task.deleted_at)
        return reply.code(404).send({ message: "Not found" });
    return reply.code(200).send(task);
};
