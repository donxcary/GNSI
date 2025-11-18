"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUserController = exports.loginUserController = exports.registerUserController = exports.googleOAuthHandler = void 0;
const appConfig_1 = require("../config/appConfig");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const httpConfig_1 = require("../config/httpConfig");
const authValidation_1 = require("../validation/authValidation");
const auth_service_1 = require("../service/auth.service");
const passport_1 = __importDefault(require("passport"));
const response_1 = require("../utils/response");
exports.googleOAuthHandler = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    // User is authenticated and available in req.user
    const currentWorkspace = req.user?.currentWorkspace;
    if (!currentWorkspace) {
        return res.redirect(`${appConfig_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`);
    }
    return res.redirect(`${appConfig_1.config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`);
    // If you'd rather return JSON instead of redirecting, use the snippet below:
    // return res.status(200).json({
    //   status: "success",
    //   message: "Google OAuth successful",
    //   user: req.user,
    //   currentWorkspace: currentWorkspace,
    // });
});
exports.registerUserController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = authValidation_1.registerSchema.parse(req.body);
    await (0, auth_service_1.registerUserService)(body);
    return (0, response_1.sendSuccess)({
        res,
        status: httpConfig_1.HTTPSTATUS.CREATED,
        message: "User registration successful",
        data: body,
    });
});
exports.loginUserController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res
                .status(httpConfig_1.HTTPSTATUS.UNAUTHORIZED)
                .json({ message: info?.message || "Invalid email or password" });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr)
                return next(loginErr);
            return res.status(httpConfig_1.HTTPSTATUS.OK).json({ message: "Login Successful", user });
        });
    })(req, res, next);
});
exports.logoutUserController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.error("Logout error", err);
            return res
                .status(httpConfig_1.HTTPSTATUS.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to Log Out" });
        }
    });
    req.session = null;
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({ message: "Log Out Successfully" });
});
