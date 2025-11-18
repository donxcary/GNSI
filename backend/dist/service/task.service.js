"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskService = exports.getTaskByIdService = exports.getAllTasksService = exports.updateTaskService = exports.createTaskService = void 0;
const projectModel_1 = __importDefault(require("../models/projectModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const memberModel_1 = __importDefault(require("../models/memberModel"));
const task_1 = require("../enums/task");
const appError_1 = require("../utils/appError");
const createTaskService = async (userId, workspaceId, projectId, data) => {
    const { title, description, dueDate, priority, status, assignedTo } = data;
    const project = await projectModel_1.default.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new appError_1.NotFoundError("Project not found or does not belong to the workspace");
    }
    if (assignedTo) {
        const memberExists = await memberModel_1.default.exists({ userId: assignedTo, workspaceId });
        if (!memberExists) {
            throw new appError_1.BadRequestError("Assigned user is not a member of this workspace");
        }
    }
    const task = await taskModel_1.default.create({
        title,
        description: description ?? null,
        dueDate: dueDate ?? null,
        priority: priority || task_1.TaskPriorityEnum.MEDIUM,
        status: status || task_1.TaskStatusEnum.TODO,
        assignedTo: assignedTo ?? null,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
    });
    if (assignedTo) {
        await memberModel_1.default.updateOne({ userId: assignedTo, workspaceId }, { $addToSet: { tasks: task._id } });
    }
    return { task };
};
exports.createTaskService = createTaskService;
const updateTaskService = async (userId, // reserved for future auditing/permission checks
workspaceId, projectId, taskId, data) => {
    const project = await projectModel_1.default.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new appError_1.NotFoundError("Project not found or does not belong to the workspace");
    }
    const task = await taskModel_1.default.findOne({ _id: taskId, project: projectId, workspace: workspaceId });
    if (!task) {
        throw new appError_1.NotFoundError("Task not found or does not belong to the project");
    }
    // Validate new assignee if provided
    if (data.assignedTo) {
        const memberExists = await memberModel_1.default.exists({ userId: data.assignedTo, workspaceId });
        if (!memberExists) {
            throw new appError_1.BadRequestError("Assigned user is not a member of this workspace");
        }
    }
    const updated = await taskModel_1.default.findByIdAndUpdate(taskId, { $set: { ...data } }, { new: true });
    if (!updated) {
        throw new appError_1.BadRequestError("Task could not be updated");
    }
    return { task: updated };
};
exports.updateTaskService = updateTaskService;
const getAllTasksService = async (workspaceId, filters, pagination) => {
    const query = { workspace: workspaceId };
    if (filters.projectId)
        query.project = filters.projectId;
    const toArray = (v) => (v ? (Array.isArray(v) ? v : [v]) : undefined);
    const statusArr = toArray(filters.status);
    if (statusArr && statusArr.length)
        query.status = { $in: statusArr };
    const priorityArr = toArray(filters.priority);
    if (priorityArr && priorityArr.length)
        query.priority = { $in: priorityArr };
    const assigneesArr = toArray(filters.assignedTo);
    if (assigneesArr && assigneesArr.length)
        query.assignedTo = { $in: assigneesArr };
    if (filters.keyword)
        query.title = { $regex: filters.keyword, $options: "i" };
    if (filters.dueDate)
        query.dueDate = { $eq: new Date(filters.dueDate) };
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;
    const [tasks, total] = await Promise.all([
        taskModel_1.default.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id emoji name"),
        taskModel_1.default.countDocuments(query),
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
exports.getAllTasksService = getAllTasksService;
const getTaskByIdService = async (workspaceId, projectId, taskId) => {
    const project = await projectModel_1.default.findById(projectId);
    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new appError_1.NotFoundError("Project not found or does not belong to the workspace");
    }
    const task = await taskModel_1.default.findOne({
        _id: taskId,
        workspace: workspaceId,
        project: projectId,
    })
        .populate("assignedTo", "_id name profilePicture -password")
        .populate("project", "_id emoji name");
    if (!task) {
        throw new appError_1.NotFoundError("Task not found");
    }
    return { task };
};
exports.getTaskByIdService = getTaskByIdService;
const deleteTaskService = async (workspaceId, taskId) => {
    const task = await taskModel_1.default.findById(taskId);
    if (!task || task.workspace.toString() !== workspaceId.toString()) {
        throw new appError_1.NotFoundError("Task not found or does not belong to the workspace");
    }
    await taskModel_1.default.findByIdAndDelete(taskId);
};
exports.deleteTaskService = deleteTaskService;
