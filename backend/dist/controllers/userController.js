"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserController = void 0;
const httpConfig_1 = require("../config/httpConfig");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const user_service_1 = require("../service/user.service");
exports.getCurrentUserController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { user } = await (0, user_service_1.getCurrentUserService)(userId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Fetch user seccessfully",
        user,
    });
});
