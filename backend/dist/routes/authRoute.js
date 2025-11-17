"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appConfig_1 = require("../config/appConfig");
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
// import { registerWithEmailService, loginWithEmailService } from "../service/auth.service";
const failedUrl = `${appConfig_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`;
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", authController_1.registerUserController);
authRoutes.post("/login", authController_1.loginUserController);
authRoutes.post("/logout", authController_1.logoutUserController);
authRoutes.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
authRoutes.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
// GitHub
if (appConfig_1.config.GITHUB_CLIENT_ID && appConfig_1.config.GITHUB_CLIENT_SECRET && appConfig_1.config.GITHUB_CALLBACK_URL) {
    authRoutes.get("/github", passport_1.default.authenticate("github", { scope: ["user:email"] }));
    authRoutes.get("/github/callback", passport_1.default.authenticate("github", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
}
// Facebook
if (appConfig_1.config.FACEBOOK_CLIENT_ID && appConfig_1.config.FACEBOOK_CLIENT_SECRET && appConfig_1.config.FACEBOOK_CALLBACK_URL) {
    authRoutes.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
    authRoutes.get("/facebook/callback", passport_1.default.authenticate("facebook", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
}
exports.default = authRoutes;
// Email registration
/* {authRoutes.post(
    "/email/register",
    asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;
        const { user } = await registerWithEmailService({ name, email, password });
        res.status(201).json({ status: "success", user: user.omitPassword() });
    })
); } */
// Email login
/* {authRoutes.post(
    "/email/login",
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const { user } = await loginWithEmailService({ email, password });
        res.status(200).json({ status: "success", user: user.omitPassword() });
    })
); } */
