import { config } from "../config/appConfig";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";


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
