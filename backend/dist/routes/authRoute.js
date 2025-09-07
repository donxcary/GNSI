"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appConfig_1 = require("../config/appConfig");
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const auth_service_1 = require("../service/auth.service");
const failedUrl = `${appConfig_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`;
const authRoutes = (0, express_1.Router)();
authRoutes.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
authRoutes.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
// GitHub
authRoutes.get("/github", passport_1.default.authenticate("github", { scope: ["user:email"] }));
authRoutes.get("/github/callback", passport_1.default.authenticate("github", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
// Facebook
authRoutes.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
authRoutes.get("/facebook/callback", passport_1.default.authenticate("facebook", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
exports.default = authRoutes;
// Email registration
authRoutes.post("/email/register", (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    const { user } = await (0, auth_service_1.registerWithEmailService)({ name, email, password });
    res.status(201).json({ status: "success", user: user.omitPassword() });
}));
// Email login
authRoutes.post("/email/login", (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const { user } = await (0, auth_service_1.loginWithEmailService)({ email, password });
    res.status(200).json({ status: "success", user: user.omitPassword() });
}));
