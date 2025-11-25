import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
    await prisma.$connect();
} catch (err: unknown) {
    await prisma.$disconnect().catch(() => {});
    throw new Error(
        `Database connection failed: ${err instanceof Error ? err.message : String(err)}`
    );
}

export default prisma;