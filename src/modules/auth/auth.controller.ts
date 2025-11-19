import { FastifyReply, FastifyRequest } from "fastify";
import { validateUserService } from "./auth.service";
import { LoginInput } from "./auth.schema";
import { isDev } from "../../server";

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

        const token = await reply.jwtSign(payload, { expiresIn, jti });

        // return reply.code(200).send({ token, user });
        return reply
            .setCookie("access_token", token, {
                // domain: "your.domain",
                path: "/",
                secure: !isDev, // send cookie over HTTPS only in production
                httpOnly: true,
                sameSite: true, // alternative CSRF protection
            })
            .code(200)
            .send({ message: "Authenticated" });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ message: "Internal error" });
    }
};

export const logoutHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        reply.clearCookie("access_token", {
            path: "/",
            secure: !isDev,
            httpOnly: true,
            sameSite: true,
        });

        return reply.code(200).send({ message: "Logged out" });
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ message: "Internal error" });
    }
};

// export const loginHandler = async (
//     request: FastifyRequest<{ Body: LoginInput }>,
//     reply: FastifyReply
// ) => {
//     const { username, password } = request.body;

//     try {
//         const user = await validateUserService(username, password);
//         if (!user) {
//             return reply.code(401).send({ message: "Invalid credentials" });
//         }

//         // Create JWT token with the user's id as subject. Use reply.jwtSign
//         // Return token as a string to match the response schema.
//         const payload = {
//             sub: String(user.id),
//             username: user.username,
//         };

//         const jti = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
//         const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

//         const token = await reply.jwtSign(payload, { expiresIn, jti});

//         return reply.code(200).send({ token, user });
//     } catch (err: any) {
//         request.log.error(err);
//         return reply.code(500).send({ message: "Internal error" });
//     }
// };
