"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRolesController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const role_service_1 = require("../service/role.service");
const httpConfig_1 = require("../config/httpConfig");
exports.getAllRolesController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const roles = await (0, role_service_1.getAllRolesService)();
    res.status(httpConfig_1.HTTPSTATUS.OK).json({
        status: "success",
        data: roles,
    });
});
