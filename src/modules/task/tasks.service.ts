import prisma from "../../utils/prisma";
import { CreateTaskInput } from "./tasks.schema";

export const getAllTasksService = async (userId?: string) => {
    const where: any = { deleted_at: null };
    if (userId) where.user_id = userId;

    const tasks = await prisma.task.findMany({ where });
    return tasks;
};

export const createTaskService = async (input: CreateTaskInput, userId: string) => {
    const { title, description, is_done, parent_task_id } = input;

    const created = await prisma.task.create({
        data: {
            title,
            description: description ?? null,
            is_done: is_done ?? false,
            parent_task_id: parent_task_id ?? null,
            user_id: userId,
        },
    });

    return created;
};

export const findTaskByIdService = async (id: string) => {
    const task = await prisma.task.findUnique({ where: { id } });
    return task;
};


export const setTaskDoneService = async (id: string, userId:string, isDone: boolean) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error("Task not found");
    if (task.user_id !== userId) throw new Error("Unauthorized: cannot modify another user's task");
    if (task.deleted_at) throw new Error("Cannot modify a deleted task");
    
    const updated = await prisma.task.update({
        where: { id },
        data: { is_done: isDone },
    });
    return updated;
}

export const softDeleteTaskService = async (id: string) => {
    const deleted = await prisma.task.update({
        where: { id },
        data: { deleted_at: new Date() },
    });
    const children = await prisma.task.findMany({
        where: { parent_task_id: id, deleted_at: null },
    });

    for (const child of children) {
        await softDeleteTaskService(child.id);
    }
    
    return deleted;
};  