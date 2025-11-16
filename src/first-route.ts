import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PrismaClient, Task } from '@prisma/client';

const prisma = new PrismaClient();

// Export as a Fastify plugin (route file)
export default async function firstRoute(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
    // Simple GET route with querystring typing
    fastify.get<{ Querystring: { name?: string } }>('/hello', async (request) => {
        const name = request.query.name ?? 'world';
        return { hello: name };
    });

    // List tasks. Optional querystring `userId` to filter by owner.
    fastify.get<{ Querystring: { userId?: string } }>('/tasks', async (request) => {
        const userId = request.query.userId;
        const where: any = { deleted_at: null };
        if (userId) where.userId = userId;

        const tasks: Task[] = await prisma.task.findMany({ where });
        return tasks;
    });

    // Create a task. `userId` is required by the Prisma schema.
    fastify.post<{
        Body: { title: string; description?: string; is_done?: boolean; userId: string };
    }>(
        '/tasks',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['title', 'userId'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        is_done: { type: 'boolean' },
                        userId: { type: 'string' }
                    }
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: ['string', 'null'] },
                            is_done: { type: 'boolean' },
                            deleted_at: { type: ['string', 'null'] },
                            userId: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
            const { title, description, is_done, userId } = request.body;

            const created = await prisma.task.create({
                data: {
                    title,
                    description: description ?? null,
                    is_done: is_done ?? false,
                    userId,
                }
            });

            reply.code(201).send(created);
        }
    );

    // Get a single task by id
    fastify.get<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
        const id = request.params.id;
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task || task.deleted_at) return reply.code(404).send({ message: 'Not found' });
        return task;
    });
}