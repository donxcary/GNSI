"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspaceController = exports.updateWorkspaceController = exports.changeMembersRoleController = exports.workspaceAnalyticsController = exports.membersWorkspacesController = exports.userAllWorkspacesByIdController = exports.userAllWorkspacesController = exports.createWorkspaceController = void 0;
const workspaceValidation_1 = require("../validation/workspaceValidation");
const workspace_service_1 = require("../service/workspace.service");
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const httpConfig_1 = require("../config/httpConfig");
const member_service_1 = require("../service/member.service");
const role_1 = require("../enums/role");
const roleGuard_1 = require("../utils/roleGuard");
exports.createWorkspaceController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = workspaceValidation_1.createWorkspaceSchema.parse({ ...req.body });
    const userId = req.user?.id;
    const { workspace } = await (0, workspace_service_1.createWorkspaceService)(userId, body);
    return res.status(httpConfig_1.HTTPSTATUS.CREATED).json({
        message: "Workspace successfully created",
        workspace,
    });
});
// Placeholder for userAllWorkspacesController
// Get all the workspaces which users are part of
exports.userAllWorkspacesController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { workspace } = await (0, workspace_service_1.userAllWorkspacesService)(userId);
    // Implement logic to get workspaces for the authenticated user,
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Get workspaces - to be implemented",
        workspace,
    });
});
// Placeholder for userAllWorkspacesByIdController
// Get all the workspaces which users are part of
exports.userAllWorkspacesByIdController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    const { workspace } = await (0, workspace_service_1.getWorkspaceByIdService)(workspaceId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Get workspaces - to be implemented",
        workspace,
    });
});
exports.membersWorkspacesController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const { members, roles } = await (0, workspace_service_1.getWorkspaceMembersService)(workspaceId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        members,
        roles,
    });
});
exports.workspaceAnalyticsController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    // const { role } = await getMemberRoleService(userId, workspaceId);
    // roleGuard(role, [Permissions.VIEW_ONLY])
    const { analytics } = await (0, workspace_service_1.workspaceAnalyticsService)(workspaceId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Workspace Analytics fetched successfully",
        analytics,
    });
});
exports.changeMembersRoleController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.CHANGE_MEMBER_ROLE]);
    const { roleId, memberId } = workspaceValidation_1.changeMemberRoleSchema.parse(req.body);
    await (0, workspace_service_1.changeMemberRoleService)(workspaceId, roleId, memberId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Member role changed successfully",
        member,
    });
});
exports.updateWorkspaceController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.EDIT_WORKSPACE]);
    const { name, description } = workspaceValidation_1.updateWorkspaceSchema.parse({ ...req.body });
    const { workspace } = await (0, workspace_service_1.updateWorkspaceService)(workspaceId, { name, description });
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Workspace successfully updated",
        workspace,
    });
});
exports.deleteWorkspaceController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.DELETE_WORKSPACE]);
    const { currentWorkspace } = await (0, workspace_service_1.deleteWorkspaceService)(workspaceId, userId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Workspace successfully deleted",
        workspace: currentWorkspace,
    });
});
