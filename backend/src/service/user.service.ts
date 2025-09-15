import UserModel from "../models/userModel";
import { NotFoundError } from "../utils/appError";



export const getCurrentUserService = async (userId: string) => {
    const user = await UserModel.findById(userId).populate("currentWorkspace").select("-password");
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return { user };
}