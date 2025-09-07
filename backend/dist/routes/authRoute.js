"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appConfig_1 = require("../config/appConfig");
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const failedUrl = `${appConfig_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`;
const authRoutes = (0, express_1.Router)();
authRoutes.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
authRoutes.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: failedUrl }), authController_1.googleOAuthHandler);
exports.default = authRoutes;
