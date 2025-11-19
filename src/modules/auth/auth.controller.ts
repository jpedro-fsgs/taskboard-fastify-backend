import { FastifyReply, FastifyRequest } from "fastify";
import { validateUserService } from "./auth.service";
import { LoginInput } from "./auth.schema";

export const loginHandler = async (
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
) => {
    const { username, password } = request.body;

    try {
        const user = await validateUserService(username, password);
        if (!user) {
            return reply.code(401).send({ message: "Invalid credentials" });
        }

        // Create JWT token with the user's id as subject. Use reply.jwtSign
        // Return token as a string to match the response schema.
        const payload = {
            sub: String(user.id),
            username: user.username,
        };

        const jti = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

        const token = await reply.jwtSign(payload, { expiresIn, jti});

        return reply.code(200).send({ token, user });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ message: "Internal error" });
    }
};
