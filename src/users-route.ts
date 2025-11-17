import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function usersRoute(
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions
) {

    // Get users
    fastify.get("/", {
        schema: {
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    username: { type: "string" },
                                    name: { type: ["string", "null"] }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            });
            return reply.code(200).send({ data: users });
        }
    });

    // Create user
    fastify.post<{
        Body: { username: string; password: string; name?: string };
    }>(
        "/create",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                        username: { type: "string" },
                        password: { type: "string" },
                        name: { type: "string" },
                    },
                },
                response: {
                    201: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            username: { type: "string" },
                            name: { type: ["string", "null"] },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { username, password, name } = request.body;

            const hashed = bcrypt.hashSync(password, 10);

            try {
                const created = await prisma.user.create({
                    data: {
                        username,
                        name: name ?? null,
                        hashed_password: hashed,
                    },
                });

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
        }
    );
}
