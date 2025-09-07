"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthHandler = void 0;
const appConfig_1 = require("../config/appConfig");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
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
