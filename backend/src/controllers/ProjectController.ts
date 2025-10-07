import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { createProjectService, deleteProjectService, getAllProjectsService, getProjectAnalyticsService, getProjectByIdService, updateProjectService } from "../service/project.service";
import { createProjectControllerSchema, projectIdSchema, updateProjectSchema } from "../validation/projectValidations";
import { workspaceIdSchema } from "../validation/workspaceValidation";
import { getMemberRoleService } from "../service/member.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role";
import { HTTPSTATUS } from "../config/httpConfig";
// Removed unused import 'constants'
import { buildPagination } from "../utils/pagination";
import { UnauthorizedError } from "../utils/appError";


export const createProjectController = asyncHandler(async (req: Request, res: Response) => {
    const body = createProjectControllerSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await createProjectService( userId, workspaceId, body);

    return res.status(HTTPSTATUS.CREATED).json({
        message: "Project created successfully",
        project,
    });
});

export const getAllProjectsController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.VIEW_ONLY]);
    
    const { pageSize, pageNumber, skip, limit } = buildPagination({
        pageNumber: req.query.pageNumber as string | undefined,
        pageSize: req.query.pageSize as string | undefined,
        maxPageSize: 50,
    });
    const { projects, totalCount, totalPages } = await getAllProjectsService(workspaceId, limit, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
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

export const updateProjectController = asyncHandler(async (req: Request, res: Response) => {
    const body = updateProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { project } = await updateProjectService(userId, workspaceId, projectId, body);

    return res.status(HTTPSTATUS.OK).json({
        message: "Project updated successfully",
        project,
    });
});

export const deleteProjectController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.DELETE_PROJECT]);

    await deleteProjectService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Project deleted successfully",
    });
});

export const getProjectByIdController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { project } = await getProjectByIdService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Project fetched successfully",
        project,
    });
});

export const getProjectAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?.id; if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getProjectAnalyticsService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Project analytics fetched successfully",
        analytics,
    });
});

export const projectController = {
    createProject: createProjectController,
    updateProject: updateProjectController,
    deleteProject: deleteProjectController,
    getProjectById: getProjectByIdController,
    getAllProjects: getAllProjectsController,
    getProjectAnalytics: getProjectAnalyticsController
};
    