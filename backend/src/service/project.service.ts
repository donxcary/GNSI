import e from "express";
import ProjectModel from "../models/projectModel";
import { NotFoundError } from "../utils/appError";
import TaskModel from "../models/taskModel";
import mongoose from "mongoose";


export const createProjectService = async (userId: string, workspaceId: string, body: {
    emoji?: string;
    color?: string;
    name: string;
    description?: string;
}) => {
    // Implementation for creating a project
    const project = new ProjectModel({
        ...(body.emoji && { emoji: body.emoji }),
        ...(body.color && { color: body.color }),
        name: body.name,
        description: body.description,
        workspace: workspaceId,
        user: userId,
        createdBy: userId,
    });

    await project.save();

    return { project };
};

export const getAllProjectsService = async (workspaceId: string, pageSize: number, pageNumber: number) => {
    // Implementation for fetching all projects with pagination
    const skip = (pageNumber - 1) * pageSize;
    const projects = await ProjectModel.find({ workspace: workspaceId })
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .populate("createdBy", "_id name profilePic -password");
    const totalCount = await ProjectModel.countDocuments({ workspace: workspaceId });
    const totalPages = Math.ceil(totalCount / pageSize);
    return { projects, totalCount, skip, totalPages };
};

export const getProjectByIdService = async (workspaceId: string, projectId: string) => {
    // Implementation for fetching a project by ID
    const project = await ProjectModel.findOne({ _id: projectId, workspace: workspaceId })
        .select("_id name description color emoji createdBy");
    if (!project) throw new NotFoundError("Project not found");
    return { project };
};

export const getProjectAnalyticsService = async (workspaceId: string, projectId: string) => {
    // Implementation for fetching project analytics
    const analytics = await ProjectModel.aggregate([
        { $match: { workspace: workspaceId, _id: projectId } },
        {
            $group: {
                _id: "$_id",
                totalTasks: { $sum: { $size: "$tasks" } },
                completedTasks: { $sum: { $cond: ["$tasks.completed", 1, 0] } },
            },
        },
    ]);

    const project = await ProjectModel.findOne({ _id: projectId });

    if (!project || project.workspace.toString() !== workspaceId.toString())
        throw new NotFoundError("Project not found");

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Using mongoose aggregation to get task analytics
    const taskAnalytics = await TaskModel.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        {
            $unwind: "$tasks"
        },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$tasks.createdAt" },
                    month: { $month: "$tasks.createdAt" },
                    year: { $year: "$tasks.createdAt" }
                },
                totalTasks: { $count: "count" },
                completedTasks: { $sum: { $cond: ["$tasks.completed", 1, 0] } },
                overdueTasks: { $sum: { $cond: [{ $lt: ["$tasks.dueDate", currentDate] }, 1, 0] } },
            },
        },
    ]);

    if (!analytics)
        throw new NotFoundError("Project analytics not found");
    return { analytics, project };
};
