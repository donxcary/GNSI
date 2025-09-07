import { config } from "../config/appConfig";
import { Router } from "express";
import passport from "passport";
import { googleOAuthHandler } from "../controllers/authController";

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

export default authRoutes;