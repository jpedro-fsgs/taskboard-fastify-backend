import bcrypt from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { get } from "http";
import { createUserService, getAllUsersService } from "./users.service";
import { CreateUserInput } from "./users.schema";

export const getUsersHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const users = await getAllUsersService();
    return reply.code(200).send({ data: users });
};

export const registerUserHandler = async (
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
) => {
    const body = request.body;

    try {
        const created = await createUserService(body);

        reply.code(201).send({
            id: created.id,
            username: created.username,
            name: created.name,
        });
    } catch (err: any) {
        // Prisma unique constraint error code
        if (err.code === "P2002") {
            return reply.code(409).send({ message: "Username already exists" });
        }
        request.log.error(err);
        return reply.code(500).send({ message: "Internal error" });
    }
};
