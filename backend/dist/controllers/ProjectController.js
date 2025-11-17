"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.getProjectAnalyticsController = exports.getProjectByIdController = exports.deleteProjectController = exports.updateProjectController = exports.getAllProjectsController = exports.createProjectController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const project_service_1 = require("../service/project.service");
const projectValidations_1 = require("../validation/projectValidations");
const workspaceValidation_1 = require("../validation/workspaceValidation");
const member_service_1 = require("../service/member.service");
const roleGuard_1 = require("../utils/roleGuard");
const role_1 = require("../enums/role");
const httpConfig_1 = require("../config/httpConfig");
// Removed unused import 'constants'
const pagination_1 = require("../utils/pagination");
const appError_1 = require("../utils/appError");
exports.createProjectController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = projectValidations_1.createProjectControllerSchema.parse(req.body);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.CREATE_PROJECT]);
    const { project } = await (0, project_service_1.createProjectService)(userId, workspaceId, body);
    return res.status(httpConfig_1.HTTPSTATUS.CREATED).json({
        message: "Project created successfully",
        project,
    });
});
exports.getAllProjectsController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const { pageSize, pageNumber, skip, limit } = (0, pagination_1.buildPagination)({
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        maxPageSize: 50,
    });
    const { projects, totalCount, totalPages } = await (0, project_service_1.getAllProjectsService)(workspaceId, limit, pageNumber);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Projects fetched successfully",
        projects,
        pagination: {
            totalCount,
            skip,
            totalPages,
            currentPage: pageNumber,
            pageSize,
            //  hasNextPage: pageNumber < totalPages,
            //  hasPrevPage: pageNumber > 1,
            //  nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
            //  prevPage: pageNumber > 1 ? pageNumber - 1 : null,
            //  isFirstPage: pageNumber === 1,
            //  isLastPage: pageNumber === totalPages,
            limit,
            //  offset: skip,
            //  total: totalCount,
            //  pages: totalPages,
            // page: pageNumber,
            //perPage: pageSize,
            // from: skip + 1,
            // to: Math.min(skip + pageSize, totalCount),
            // firstPage: 1,
            // lastPage: totalPages
        }
    });
});
exports.updateProjectController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const body = projectValidations_1.updateProjectSchema.parse(req.body);
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.EDIT_PROJECT]);
    const { project } = await (0, project_service_1.updateProjectService)(userId, workspaceId, projectId, body);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Project updated successfully",
        project,
    });
});
exports.deleteProjectController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.DELETE_PROJECT]);
    await (0, project_service_1.deleteProjectService)(workspaceId, projectId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Project deleted successfully",
    });
});
exports.getProjectByIdController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const { project } = await (0, project_service_1.getProjectByIdService)(workspaceId, projectId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Project fetched successfully",
        project,
    });
});
exports.getProjectAnalyticsController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const workspaceId = workspaceValidation_1.workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectValidations_1.projectIdSchema.parse(req.params.id);
    const userId = req.user?.id;
    if (!userId)
        throw new appError_1.UnauthorizedError("Not authenticated");
    const { role } = await (0, member_service_1.getMemberRoleService)(userId, workspaceId);
    // Role guard here
    (0, roleGuard_1.roleGuard)(role, [role_1.Permissions.VIEW_ONLY]);
    const { analytics } = await (0, project_service_1.getProjectAnalyticsService)(workspaceId, projectId);
    return res.status(httpConfig_1.HTTPSTATUS.OK).json({
        message: "Project analytics fetched successfully",
        analytics,
    });
});
exports.projectController = {
    createProject: exports.createProjectController,
    updateProject: exports.updateProjectController,
    deleteProject: exports.deleteProjectController,
    getProjectById: exports.getProjectByIdController,
    getAllProjects: exports.getAllProjectsController,
    getProjectAnalytics: exports.getProjectAnalyticsController
};
