import { config } from "../config/appConfig";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { HTTPSTATUS } from "../config/httpConfig";
import { registerSchema } from "../validation/authValidation";
import { registerUserService } from "../service/auth.service";
import passport from "passport";


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
    const body = registerSchema.parse(req.body);
    await registerUserService(body);
    return res.status(HTTPSTATUS.CREATED).json({
        status: "success",
        message: "User registration successful",
        data: body,
    });
});


export const loginUserController = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            "local",
            (
                err: Error | null,
                user: Express.User | false,
                info: { message: string } | undefined
            ) => {
                if (err) return next(err);
                if (!user) {
                    return res
                        .status(HTTPSTATUS.UNAUTHORIZED)
                        .json({ message: info?.message || "Invalid email or password" });
                }
                req.logIn(user, (loginErr) => {
                    if (loginErr) return next(loginErr);
                    return res.status(HTTPSTATUS.OK).json({ message: "Login Successful", user });
                });
            }
        )(req, res, next);
    }
);

export const logoutUserController = asyncHandler(async (req: Request, res: Response) => {
    req.logOut((err) => {
        if (err) {
            console.error("Logout error", err);
            return res
                .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to Log Out" });
        }
    });
    req.session = null;
    return res.status(HTTPSTATUS.OK).json({ message: "Log Out Successfully" });
});