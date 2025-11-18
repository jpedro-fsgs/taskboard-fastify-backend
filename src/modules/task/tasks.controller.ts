import { FastifyReply, FastifyRequest } from "fastify";
import {
    createTaskService,
    getAllTasksService,
    findTaskByIdService,
} from "./tasks.service";
import {
    CreateTaskInput,
} from "./tasks.schema";

export const getTasksHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const userId = (request.query as any)?.userId;
    const tasks = await getAllTasksService(userId);
    return reply.code(200).send({ items: tasks }); // send() must match tasksArrayResponse
};

export const createTaskHandler = async (
    request: FastifyRequest<{ Body: CreateTaskInput }>,
    reply: FastifyReply
) => {
    const body = request.body;

    try {
        const created = await createTaskService(body);
        reply.code(201).send(created);
    } catch (err: any) {
        request.log.error(err);
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