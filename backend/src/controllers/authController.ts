import exp from "constants";
import { config } from "../config/appConfig";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/httpConfig";
import { registerSchema } from "../validation/authValidation";


export const googleOAuthHandler = asyncHandler(async (req: Request, res: Response) => {
    // User is authenticated and available in req.user
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
        return res.redirect(`${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`);
    }
    return res.redirect(`${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`);
    // If you'd rather return JSON instead of redirecting, use the snippet below:
    // return res.status(200).json({
    //   status: "success",
    //   message: "Google OAuth successful",
    //   user: req.user,
    //   currentWorkspace: currentWorkspace,
    // });
});


export const registerUserController = asyncHandler(async (req: Request, res: Response) => {
    // User is authenticated and available in req.user
    const body = registerSchema.parse({ ... req.body});
    await registerUserService(body);
    return res.status(HTTPSTATUS.CREATED).json({
        status: "success",
        message: "User registration successful",
        data: body,
    });
});