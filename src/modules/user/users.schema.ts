import { z } from "zod";


const userCore = z.object({
    username: z.string().min(1, "Username is required"),
    name: z.string().optional(),
});

export const createUserSchema = z.object({
    ...userCore.shape,
    password: z.string().min(1, "Password is required"),
});

export const createUserResponseSchema = z.object({
    ...userCore.shape,
    id: z.string(),
});

export const usersArrayResponseSchema = z.object({
    data: z.array(createUserResponseSchema),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
