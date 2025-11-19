import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    is_done: z.boolean().optional(),
    parent_task_id: z.string().optional(),
});

export const createTaskResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    is_done: z.boolean(),
    deleted_at: z.string().nullable(),
    user_id: z.string(),
    parent_task_id: z.string().nullable(),
});

const baseTask = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    is_done: z.boolean(),
    deleted_at: z.string().nullable(),
    user_id: z.string(),
    parent_task_id: z.string().nullable(),
});

const taskWithSubTasksSchema: z.ZodType<any> = z.lazy(
    () =>
        baseTask.extend({
            sub_tasks: z.array(taskWithSubTasksSchema),
        })
);

export const tasksArrayResponseSchema = z.object({
    items: z.array(taskWithSubTasksSchema),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
