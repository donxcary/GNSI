"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskController = exports.getTaskByIdController = exports.getAllTasksController = exports.updateTaskController = exports.createTaskController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const projectValidations_1 = require("../validation/projectValidations");
const taskValidation_1 = require("../validation/taskValidation");
const workspaceValidation_1 = require("../validation/workspaceValidation");
const roleGuard_1 = require("../utils/roleGuard");
const role_1 = require("../enums/role");
const member_service_1 = require("../service/member.service");
const task_service_1 = require("../service/task.service");
const httpConfig_1 = require("../config/httpConfig");
const appError_1 = require("../utils/appError");
// Removed unused imports
exports.createTaskController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = taskValidation_1.createTaskSchema.parse(req.body);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.CREATE_TASK]);
    const { task } = await (0, task_service_1.createTaskService)(userId, workspaceId, projectId, body);
    return res.status(httpConfig_1.HTTPSTATUS.CREATED).json({
        message: "Task created successfully",
        task,
    });
});
exports.updateTaskController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = taskValidation_1.updateTaskSchema.parse(req.body);
    const taskId = taskValidation_1.taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.EDIT_TASK]);
    const { task } = await (0, task_service_1.updateTaskService)(userId, workspaceId, projectId, taskId, body);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Task updated successfully",
        task,
    });
});
exports.getAllTasksController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;
    const castParam = (v) => {
        if (!v)
            return undefined;
        if (Array.isArray(v))
            return v.map(String);
        return String(v);
    };
    const filters = {
        projectId: castParam(req.query.projectId),
        priority: castParam(req.query.priority),
        status: castParam(req.query.status),
        assignedTo: castParam(req.query.assignedTo),
        keyword: castParam(req.query.keyword),
        dueDate: castParam(req.query.dueDate),
    };
    const pagination = {
        pageSize: parseInt(req.query.pageSize) || 10,
        pageNumber: parseInt(req.query.pageNumber) || 1,
    };
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const result = await (0, task_service_1.getAllTasksService)(workspaceId, filters, pagination);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({ message: "Tasks retrieved successfully", ...result });
});
exports.getTaskByIdController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const taskId = taskValidation_1.taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const { task } = await (0, task_service_1.getTaskByIdService)(workspaceId, projectId, taskId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Task retrieved successfully",
        task,
    });
});
exports.deleteTaskController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const taskId = taskValidation_1.taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.DELETE_TASK]);
    await (0, task_service_1.deleteTaskService)(workspaceId, taskId);
    return res.status(httpConfig_1.HTTPSTATUS.NO_CONTENT).json({
        message: "Task deleted successfully",
    });
});
