"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWorkspaceController = void 0;
const zod_1 = require("zod");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const httpConfig_1 = require("../config/httpConfig");
const member_service_1 = require("../service/member.service");
exports.joinWorkspaceController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const inviteToken = zod_1.z.string().parse(req.params.inviteToken);
    const userId = req.user?._id;
    const { workspaceId, role } = await (0, member_service_1.joinWorkspaceService)({ inviteToken, userId });
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        status: "success",
        message: `Successfully joined the workspace as ${role}`,
        data: { workspaceId, role },
    });
});
