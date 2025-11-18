import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const loginResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        username: z.string(),
        name: z.string().optional(),
    }),
});

export type LoginInput = z.infer<typeof loginSchema>;
