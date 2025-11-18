import bcrypt from "bcryptjs";
import prisma from "../../utils/prisma";
import { CreateUserInput } from "./users.schema";

export const createUserService = async (input: CreateUserInput) => {
    
    const { password, ...rest } = input;
    const hashed_password = bcrypt.hashSync(password, 10);

    const created = await prisma.user.create({
        data: { ...rest, hashed_password },
    });
    return {
        id: created.id,
        username: created.username,
        name: created.name,
    };
};

export const getAllUsersService = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            name: true,
        },
    });
    return users;
};

export const findUserByIdService = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            name: true,
        },
    });
    return user;
};

export const findUserByUsernameService = async (username: string) => {
    // Return the full user record (including hashed_password) for internal auth use
    const user = await prisma.user.findUnique({
        where: { username },
    });
    return user;
};
