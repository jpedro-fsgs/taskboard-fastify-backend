import { FastifyReply, FastifyRequest } from "fastify";
import { validateUserService } from "./auth.service";
import { LoginInput } from "./auth.schema";
// Don't import the server instance here — importing the server causes a
// circular dependency (server -> routes -> controller -> server) which
// can make the JWT plugin unavailable at module load time. Instead use
// the `reply` helper methods which are available at request time.

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
        reply.log.info("Trying to sign token");
        const token = await reply.jwtSign({ sub: user.id });
        reply.log.info(token);

        return reply.code(200).send({ token, user });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ message: "Internal error" });
    }
};
