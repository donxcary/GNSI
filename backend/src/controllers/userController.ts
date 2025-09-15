import { HTTPSTATUS } from "../config/httpConfig";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { getCurrentUserService } from "../service/user.service";

export const getCurrentUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const { user } =await getCurrentUserService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Fetch user seccessfully",
            user,
        });
    }
);