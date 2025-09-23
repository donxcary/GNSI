import { Request, Response } from 'express';
import { changeMemberRoleSchema, createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from '../validation/workspaceValidation';
import { changeMemberRoleService, createWorkspaceService, deleteWorkspaceService, getWorkspaceByIdService, getWorkspaceMembersService, updateWorkspaceService, userAllWorkspacesService, workspaceAnalyticsService } from '../service/workspace.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/httpConfig';
import exp from 'constants';
import { getMemberRoleService } from '../service/member.service';
import { Permissions } from '../enums/role';
import { roleGuard } from '../utils/roleGuard';

export const createWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse({ ...req.body });
    const userId = req.user?.id;

    const { workspace } = await createWorkspaceService(userId, body);
        return res.status(HTTPSTATUS.CREATED).json({
            message: "Workspace successfully created",
            workspace,
        });
    }
);

// Placeholder for userAllWorkspacesController
// Get all the workspaces which users are part of
export const userAllWorkspacesController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { workspace } = await userAllWorkspacesService(userId);
    // Implement logic to get workspaces for the authenticated user,
    return res.status(HTTPSTATUS.OK).json({
        message: "Get workspaces - to be implemented",
        workspace,
    });
});

// Placeholder for userAllWorkspacesByIdController
// Get all the workspaces which users are part of
export const userAllWorkspacesByIdController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?.id;
        await getMemberRoleService(userId, workspaceId);
        const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Get workspaces - to be implemented",
        workspace,
    });
});

export const membersWorkspacesController = asyncHandler (async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await getMemberRoleService(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY])

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
        members,
        roles,
    });
})

export const workspaceAnalyticsController = asyncHandler (async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    // const { role } = await getMemberRoleService(userId, workspaceId);
    // roleGuard(role, [Permissions.VIEW_ONLY])

    const { analytics } = await workspaceAnalyticsService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Workspace Analytics fetched successfully",
        analytics,
    });
});

export const changeMembersRoleController = asyncHandler (async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await getMemberRoleService(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { roleId, memberId } = changeMemberRoleSchema.parse(req.body);
    await changeMemberRoleService(workspaceId, roleId, memberId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Member role changed successfully",
        member,
    });
});

export const updateWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await getMemberRoleService(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);
    const { name, description } = updateWorkspaceSchema.parse({ ...req.body });

    const { workspace } = await updateWorkspaceService(workspaceId, { name, description });
    return res.status(HTTPSTATUS.OK).json({
        message: "Workspace successfully updated",
        workspace,
    });
});

export const deleteWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await getMemberRoleService(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await deleteWorkspaceService(workspaceId, userId);
    return res.status(HTTPSTATUS.OK).json({
        message: "Workspace successfully deleted",
        workspace: currentWorkspace,
    });
});