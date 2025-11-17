"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectService = exports.updateProjectService = exports.getProjectAnalyticsService = exports.getProjectByIdService = exports.getAllProjectsService = exports.createProjectService = void 0;
const projectModel_1 = __importDefault(require("../models/projectModel"));
const appError_1 = require("../utils/appError");
const taskModel_1 = __importDefault(require("../models/taskModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const task_1 = require("../enums/task");
const createProjectService = async (userId, workspaceId, body) => {
    // Implementation for creating a project
    const project = new projectModel_1.default({
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
exports.createProjectService = createProjectService;
const getAllProjectsService = async (workspaceId, pageSize, pageNumber) => {
    // Implementation for fetching all projects with pagination
    const skip = (pageNumber - 1) * pageSize;
    const projects = await projectModel_1.default.find({ workspace: workspaceId })
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .populate("createdBy", "_id name profilePic -password");
    const totalCount = await projectModel_1.default.countDocuments({ workspace: workspaceId });
    const totalPages = Math.ceil(totalCount / pageSize);
    return { projects, totalCount, skip, totalPages };
};
exports.getAllProjectsService = getAllProjectsService;
const getProjectByIdService = async (workspaceId, projectId) => {
    // Implementation for fetching a project by ID
    const project = await projectModel_1.default.findOne({ _id: projectId, workspace: workspaceId })
        .select("_id name description color emoji createdBy");
    if (!project)
        throw new appError_1.NotFoundError("Project not found");
    return { project };
};
exports.getProjectByIdService = getProjectByIdService;
const getProjectAnalyticsService = async (workspaceId, projectId) => {
    const project = await projectModel_1.default.findOne({ _id: projectId });
    if (!project || project.workspace.toString() !== workspaceId.toString())
        throw new appError_1.NotFoundError("Project not found");
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // Using mongoose aggregation to get task analytics
    const taskAnalytics = await taskModel_1.default.aggregate([
        { $match: { project: new mongoose_1.default.Types.ObjectId(projectId), } },
        {
            $group: {
                _id: [{
                        day: { $dayOfMonth: "$tasks.createdAt" },
                        month: { $month: "$tasks.createdAt" },
                        year: { $year: "$tasks.createdAt" }
                    }],
                totalTasks: [{ $count: "count" }],
                overdueTasks: [{
                        $match: {
                            dueDate: { $lt: currentDate },
                            status: { $ne: task_1.TaskStatusEnum.DONE },
                        },
                    },
                    { $count: "count" },
                ],
                completedTasks: [{ $match: { status: task_1.TaskStatusEnum.DONE } }, { $count: "count" }],
            },
        },
    ]);
    const _analytics = taskAnalytics[0];
    // Implementation for fetching project analytics
    const analytics = {
        totalTasks: _analytics.totalTasks[0]?.count || 0,
        completedTasks: _analytics.completedTasks[0]?.count || 0,
        overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    };
    if (!analytics)
        throw new appError_1.NotFoundError("Project analytics not found");
    return { analytics, project };
};
exports.getProjectAnalyticsService = getProjectAnalyticsService;
const updateProjectService = async (userId, workspaceId, projectId, body) => {
    const { emoji, color, name, description } = body;
    // Implementation for updating a project
    const project = await projectModel_1.default.findOneAndUpdate({ _id: projectId, workspace: workspaceId, user: userId }, { emoji, color, name, description }, { new: true });
    if (!project)
        throw new appError_1.NotFoundError("Project not found");
    if (emoji)
        project.emoji = emoji;
    if (color)
        project.color = color;
    if (name)
        project.name = name;
    if (description)
        project.description = description;
    await project.save();
    return { project };
};
exports.updateProjectService = updateProjectService;
const deleteProjectService = async (workspaceId, projectId) => {
    const project = await projectModel_1.default.findOneAndDelete({ _id: projectId, workspace: workspaceId });
    if (!project)
        throw new appError_1.NotFoundError("Project not found");
    await project.deleteOne();
    await taskModel_1.default.deleteMany({ project: project._id });
    return { project };
};
exports.deleteProjectService = deleteProjectService;
