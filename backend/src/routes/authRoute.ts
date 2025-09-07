import { config } from "../config/appConfig";
import { Router } from "express";
import passport from "passport";
import { googleOAuthHandler } from "../controllers/authController";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { registerWithEmailService, loginWithEmailService } from "../service/auth.service";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`;
const authRoutes = Router();

authRoutes.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: failedUrl }),
    googleOAuthHandler
);

// GitHub
if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET && config.GITHUB_CALLBACK_URL) {
    authRoutes.get(
        "/github",
        passport.authenticate("github", { scope: ["user:email"] })
    );
    authRoutes.get(
        "/github/callback",
        passport.authenticate("github", { failureRedirect: failedUrl }),
        googleOAuthHandler
    );
}

// Facebook
if (config.FACEBOOK_CLIENT_ID && config.FACEBOOK_CLIENT_SECRET && config.FACEBOOK_CALLBACK_URL) {
    authRoutes.get(
        "/facebook",
        passport.authenticate("facebook", { scope: ["email"] })
    );
    authRoutes.get(
        "/facebook/callback",
        passport.authenticate("facebook", { failureRedirect: failedUrl }),
        googleOAuthHandler
    );
}

export default authRoutes;

// Email registration
authRoutes.post(
    "/email/register",
    asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        const { user } = await registerWithEmailService({ name, email, password });
        res.status(201).json({ status: "success", user: user.omitPassword() });
    })
);

// Email login
authRoutes.post(
    "/email/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const { user } = await loginWithEmailService({ email, password });
        res.status(200).json({ status: "success", user: user.omitPassword() });
    })
);