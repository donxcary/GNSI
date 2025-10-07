import { Response, Request } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { projectIdSchema } from "../validation/projectValidations";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "../validation/taskValidation";
import { workspaceIdSchema } from "../validation/workspaceValidation";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role";
import { getMemberRoleService } from "../service/member.service";
import { createTaskService, deleteTaskService, getAllTasksService, getTaskByIdService, updateTaskService } from "../service/task.service";
import { HTTPSTATUS } from "../config/httpConfig";
import { UnauthorizedError } from "../utils/appError";
// Removed unused imports




export const createTaskController = asyncHandler(async (req: Request, res: Response) => {
    const body = createTaskSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(userId!, workspaceId, projectId, body);

    return res.status(HTTPSTATUS.CREATED).json({
        message: "Task created successfully",
        task,
    });
});
export const updateTaskController = asyncHandler(async (req: Request, res: Response) => {
    const body = updateTaskSchema.parse(req.body);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { task } = await updateTaskService(userId!, workspaceId, projectId, taskId, body);

    return res.status(HTTPSTATUS.OK).json({
        message: "Task updated successfully",
        task,
    });
});


export const getAllTasksController = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;
    const castParam = (v: unknown): string | string[] | undefined => {
        if (!v) return undefined;
        if (Array.isArray(v)) return v.map(String);
        return String(v);
    };
    const filters = {
        projectId: castParam(req.query.projectId) as string | undefined,
        priority: castParam(req.query.priority),
        status: castParam(req.query.status),
        assignedTo: castParam(req.query.assignedTo),
        keyword: castParam(req.query.keyword) as string | undefined,
        dueDate: castParam(req.query.dueDate) as string | undefined,
    };

    const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 10,
        pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(workspaceId, filters, pagination);
    return res.status(HTTPSTATUS.OK).json({ message: "Tasks retrieved successfully", ...result });
});

export const getTaskByIdController = asyncHandler(async (req: Request, res: Response) => {
    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { task } = await getTaskByIdService(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
        message: "Task retrieved successfully",
        task,
    });
});

export const deleteTaskController = asyncHandler(async (req: Request, res: Response) => {
    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError("Not authenticated");
    const { role } = await getMemberRoleService(userId, workspaceId);
    // Role guard here
    roleGuard(role, [Permissions.DELETE_TASK]);

    await deleteTaskService(workspaceId, taskId);

    return res.status(HTTPSTATUS.NO_CONTENT).json({
        message: "Task deleted successfully",
    });
});
