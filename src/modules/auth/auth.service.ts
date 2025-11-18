import bcrypt from "bcryptjs";
import { findUserByUsernameService } from "../user/users.service";

export const validateUserService = async (username: string, password: string) => {
    const user = await findUserByUsernameService(username);
    if (!user) return null;
    
    // Compare provided password with stored hash
    const isValid = bcrypt.compareSync(password, user.hashed_password || "");
    if (!isValid) return null;
    
    // Return sanitized user object
    return {
        id: user.id,
        username: user.username,
        name: user.name,
    };
};
