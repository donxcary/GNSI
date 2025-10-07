import exp from "constants";
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
    data: z.infer<typeof createTaskSchema>,
    body: {
        title: string;
        description?: string;
        dueDate?: Date;
        priority: string;
        status: string;
        assignedTo?: string | null;
    }
) => {
    // Implementation here
    const { title, description, dueDate, priority, status, assignedTo } = body;
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new Error("Project not found or does not belong to the workspace");
    }

    if (assignedTo) {
        const isAssignedToUserMember = await MemberModel.exists({
            userId: assignedTo,
            workspaceId,
        });

        if (!isAssignedToUserMember) {
            throw new Error("Assigned user is not a member of this project");
        }
    }

    const task = await TaskModel.create({
        title,
        description,
        dueDate,
        priority: priority || TaskPriorityEnum.MEDIUM,
        status: status || TaskStatusEnum.TODO,
        assignedTo,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
    });

    // await project.updateOne({ $push: { tasks: task._id } });
    //if (assignedTo) {
        await MemberModel.updateOne(
            { userId: assignedTo, workspaceId },
            { $push: { tasks: task._id } }
        );
    //}

    await task.save();

    return { task };
};


export const updateTaskService = async (
    userId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    data: z.infer<typeof updateTaskSchema>
    body: {
        title: string;
        description?: string;
        dueDate?: Date;
        priority: string;
        status: string;
        assignedTo?: string | null;
    }
) => {
    // Implementation here
    // const { title, description, dueDate, priority, status, assignedTo } = body;
    const project = await ProjectModel.findById(projectId);
    const task = await TaskModel.findById(taskId);
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, { ... body }, { new: true });

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Project not found or does not belong to the workspace");
    }

    if (!task || task.project.toString() !== projectId.toString()) {
        throw new NotFoundError("Task not found or does not belong to the project");
    }

    if (!updatedTask) {
        throw new BadRequestError("Task not found or could not be updated");
    }

    return { task: updatedTask };
};

export const getAllTasksService = async (
    workspaceId: string,
    filters: { projectId?: string; status?: string[]; priority?: string[]; assignedTo?: string[]; keyword?: string; dueDate?: string },
    pagination: { pageSize: number; pageNumber: number }
) => {
    // Implementation here
    const query: Record<string, any> = { workspace: workspaceId }; 
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, totalTasks] = await Promise.all([
        TaskModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id emoji name"),
        TaskModel.countDocuments(query)
    ]);

    if (filters.projectId) {
        query.projectId = filters.projectId;
    }

    if (filters.status && filters.status?.length > 0) {
        query.status = { $in: filters.status };
    }

    if (filters.priority && filters.priority?.length > 0) {
        query.priority = { $in: filters.priority };
    }

    if (filters.assignedTo && filters.assignedTo?.length > 0) {
        query.assignedTo = { $in: filters.assignedTo };
    }

    if (filters.keyword && filters.keyword !== undefined) {
        query.title = { $regex: filters.keyword, $options: "i" };
    }

    if (filters.dueDate) {
        query.dueDate = { $eq: new Date(filters.dueDate) };
    }

    return {
        tasks,
        totalPages: Math.ceil(totalTasks / pageSize),
        pagination: {
            pageNumber,
            pageSize,
            totalItems: totalTasks,
            skip,
        }
    };
};


export const getTaskByIdService = async (workspaceId: string, projectId: string, taskId: string) => {
    const project = await ProjectModel.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundError("Project not found or does not belong to the workspace");
    }

    const task = await TaskModel.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId
    }).populate("assignedTo", "_id name profilePicture -password")
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