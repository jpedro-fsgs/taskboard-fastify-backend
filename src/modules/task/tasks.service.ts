import prisma from "../../utils/prisma";
import { buildTree } from "../../utils/utils";
import { CreateTaskInput } from "./tasks.schema";

export const getAllTasksService = async (userId?: string) => {
    const where: any = { deleted_at: null };
    if (userId) where.user_id = userId;

    const tasks = await prisma.task.findMany({ where });
    const tasksTree = buildTree(tasks as any);
    return tasksTree;
};

export const createTaskService = async (input: CreateTaskInput) => {
    const { title, description, is_done, parent_task_id, user_id } = input;

    const created = await prisma.task.create({
        data: {
            title,
            description: description ?? null,
            is_done: is_done ?? false,
            parent_task_id: parent_task_id ?? null,
            user_id,
        },
    });

    return created;
};

export const findTaskByIdService = async (id: string) => {
    const task = await prisma.task.findUnique({ where: { id } });
    return task;
};
