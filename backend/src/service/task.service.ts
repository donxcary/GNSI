import { createTaskSchema, updateTaskSchema } from "../validation/taskValidation";
import ProjectModel from "../models/projectModel";
import TaskModel from "../models/taskModel";
import MemberModel from "../models/memberModel";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task";
import { z } from "zod";
import { BadRequestError, NotFoundError } from "../utils/appError";


export const createTaskService = async (
    userId: string,
    workspaceId: string,
    projectId: string,
    data: z.infer<typeof createTaskSchema>
) => {
    const { title, description, dueDate, priority, status, assignedTo } = data;

    const project = await ProjectModel.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Project not found or does not belong to the workspace");
    }

    if (assignedTo) {
        const memberExists = await MemberModel.exists({ userId: assignedTo, workspaceId });
        if (!memberExists) {
            throw new BadRequestError("Assigned user is not a member of this workspace");
        }
    }

    const task = await TaskModel.create({
        title,
        description: description ?? null,
        dueDate: dueDate ?? null,
        priority: priority || TaskPriorityEnum.MEDIUM,
        status: status || TaskStatusEnum.TODO,
        assignedTo: assignedTo ?? null,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
    });

    if (assignedTo) {
        await MemberModel.updateOne(
            { userId: assignedTo, workspaceId },
            { $addToSet: { tasks: task._id } }
        );
    }

    return { task };
};


export const updateTaskService = async (
    userId: string, // reserved for future auditing/permission checks
    workspaceId: string,
    projectId: string,
    taskId: string,
    data: z.infer<typeof updateTaskSchema>
) => {
    const project = await ProjectModel.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Project not found or does not belong to the workspace");
    }

    const task = await TaskModel.findOne({ _id: taskId, project: projectId, workspace: workspaceId });
    if (!task) {
        throw new NotFoundError("Task not found or does not belong to the project");
    }

    // Validate new assignee if provided
    if (data.assignedTo) {
        const memberExists = await MemberModel.exists({ userId: data.assignedTo, workspaceId });
        if (!memberExists) {
            throw new BadRequestError("Assigned user is not a member of this workspace");
        }
    }

    const updated = await TaskModel.findByIdAndUpdate(
        taskId,
        { $set: { ...data } },
        { new: true }
    );

    if (!updated) {
        throw new BadRequestError("Task could not be updated");
    }

    return { task: updated };
};

export const getAllTasksService = async (
    workspaceId: string,
    filters: {
        projectId?: string;
        status?: string | string[];
        priority?: string | string[];
        assignedTo?: string | string[];
        keyword?: string;
        dueDate?: string;
    },
    pagination: { pageSize: number; pageNumber: number }
) => {
    const query: Record<string, any> = { workspace: workspaceId };

    if (filters.projectId) query.project = filters.projectId;

    const toArray = (v?: string | string[]) => (v ? (Array.isArray(v) ? v : [v]) : undefined);

    const statusArr = toArray(filters.status);
    if (statusArr && statusArr.length) query.status = { $in: statusArr };

    const priorityArr = toArray(filters.priority);
    if (priorityArr && priorityArr.length) query.priority = { $in: priorityArr };

    const assigneesArr = toArray(filters.assignedTo);
    if (assigneesArr && assigneesArr.length) query.assignedTo = { $in: assigneesArr };

    if (filters.keyword) query.title = { $regex: filters.keyword, $options: "i" };
    if (filters.dueDate) query.dueDate = { $eq: new Date(filters.dueDate) };

    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, total] = await Promise.all([
        TaskModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id emoji name"),
        TaskModel.countDocuments(query),
    ]);

    return {
        tasks,
        totalPages: Math.ceil(total / pageSize),
        pagination: {
            pageNumber,
            pageSize,
            totalItems: total,
            skip,
        },
    };
};


export const getTaskByIdService = async (
    workspaceId: string,
    projectId: string,
    taskId: string
) => {
    const project = await ProjectModel.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Project not found or does not belong to the workspace");
    }

    const task = await TaskModel.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    })
        .populate("assignedTo", "_id name profilePicture -password")
        .populate("project", "_id emoji name");

    if (!task) {
        throw new NotFoundError("Task not found");
    }

    return { task };
};


export const deleteTaskService = async (workspaceId: string, taskId: string) => {
    const task = await TaskModel.findById(taskId);
    if (!task || task.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Task not found or does not belong to the workspace");
    }
    await TaskModel.findByIdAndDelete(taskId);
};