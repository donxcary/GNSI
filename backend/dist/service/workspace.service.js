"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspaceService = exports.updateWorkspaceService = exports.changeMemberRoleService = exports.workspaceAnalyticsService = exports.getWorkspaceMembersService = exports.getWorkspaceByIdService = exports.userAllWorkspacesService = exports.createWorkspaceService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const role_1 = require("../enums/role");
const roleModel_1 = __importDefault(require("../models/roleModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const appError_1 = require("../utils/appError");
const memberModel_1 = __importDefault(require("../models/memberModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const task_1 = require("../enums/task");
const projectModel_1 = __importDefault(require("../models/projectModel"));
// CREATING NEW WORKSPACE
// *********************** 
const createWorkspaceService = async (userId, body) => {
    const { name, description } = body;
    const user = await userModel_1.default.findById(userId);
    if (!user)
        throw new appError_1.NotFoundError("User not found");
    const officerRole = await roleModel_1.default.findOne({ name: role_1.Roles.OFFICER });
    if (!officerRole)
        throw new appError_1.NotFoundError("Officer role not found");
    const workspace = await new workspaceModel_1.default({ name, description, owner: user._id }).save();
    await new memberModel_1.default({
        userId: user._id,
        workspaceId: workspace._id,
        role: officerRole._id,
        joinedAt: new Date(),
    }).save();
    user.currentWorkspace = workspace._id;
    await user.save();
    return { workspace };
};
exports.createWorkspaceService = createWorkspaceService;
// GETTING WORKSPACES FOR REGISTED(MEMBERSHIP) USERS
// **********************************************
const userAllWorkspacesService = async (userId) => {
    const memberships = await memberModel_1.default.find({ userId }).populate("workspaceId");
    const workspaces = memberships.map(m => m.workspaceId).filter(Boolean);
    return { workspaces };
};
exports.userAllWorkspacesService = userAllWorkspacesService;
const getWorkspaceByIdService = async (workspaceId) => {
    const workspace = await workspaceModel_1.default.findById(workspaceId);
    if (!workspace)
        throw new appError_1.NotFoundError("Workspace not found");
    const members = await memberModel_1.default.find({ workspaceId }).populate("role");
    return { workspace: { ...workspace.toObject(), members } };
};
exports.getWorkspaceByIdService = getWorkspaceByIdService;
// ACCESS ALL MEMBERS IN WORKSPACE
// *******************************
const getWorkspaceMembersService = async (workspaceId) => {
    const members = await memberModel_1.default.find({ workspaceId })
        .populate("userId", "name email profilePicture -password")
        .populate("role", "name");
    const roles = await roleModel_1.default.find({}, { name: 1 }).lean();
    return { members, roles };
};
exports.getWorkspaceMembersService = getWorkspaceMembersService;
const workspaceAnalyticsService = async (workspaceId) => {
    const now = new Date();
    const base = { workspace: workspaceId };
    const [totalTasks, overdueTasks, inProgressTasks, completedTasks, archivedTasks] = await Promise.all([
        taskModel_1.default.countDocuments(base),
        taskModel_1.default.countDocuments({ ...base, status: { $ne: task_1.TaskStatusEnum.DONE }, dueDate: { $lt: now } }),
        taskModel_1.default.countDocuments({ ...base, status: task_1.TaskStatusEnum.IN_PROGRESS }),
        taskModel_1.default.countDocuments({ ...base, status: task_1.TaskStatusEnum.DONE }),
        taskModel_1.default.countDocuments({ ...base, status: task_1.TaskStatusEnum.ARCHIVED }),
    ]);
    return { analytics: { totalTasks, overdueTasks, inProgressTasks, completedTasks, archivedTasks } };
};
exports.workspaceAnalyticsService = workspaceAnalyticsService;
const changeMemberRoleService = async (workspaceId, roleId, memberUserId) => {
    const workspace = await workspaceModel_1.default.findById(workspaceId);
    if (!workspace)
        throw new appError_1.NotFoundError("Workspace not found");
    const role = await roleModel_1.default.findById(roleId);
    if (!role)
        throw new appError_1.NotFoundError("Role not found");
    const member = await memberModel_1.default.findOne({ workspaceId, userId: memberUserId });
    if (!member)
        throw new appError_1.NotFoundError("Member not found in this workspace");
    member.role = role;
    await member.save();
    return { member };
};
exports.changeMemberRoleService = changeMemberRoleService;
const updateWorkspaceService = async (workspaceId, body) => {
    const workspace = await workspaceModel_1.default.findById(workspaceId);
    if (!workspace)
        throw new appError_1.NotFoundError("Workspace not found");
    if (body.name !== undefined)
        workspace.name = body.name;
    if (body.description !== undefined)
        workspace.description = body.description;
    await workspace.save();
    return { workspace };
};
exports.updateWorkspaceService = updateWorkspaceService;
const deleteWorkspaceService = async (workspaceId, userId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const workspace = await workspaceModel_1.default.findById(workspaceId).session(session);
        if (!workspace)
            throw new appError_1.NotFoundError("Workspace not found");
        if (workspace.owner.toString() !== userId)
            throw new appError_1.NotFoundError("Only owner can delete workspace");
        const user = await userModel_1.default.findById(userId).session(session);
        if (!user)
            throw new appError_1.NotFoundError("User not found");
        await Promise.all([
            memberModel_1.default.deleteMany({ workspaceId: workspace._id }).session(session),
            projectModel_1.default.deleteMany({ workspace: workspace._id }).session(session),
            taskModel_1.default.deleteMany({ workspace: workspace._id }).session(session),
        ]);
        if (user.currentWorkspace?.equals(workspaceId)) {
            const otherMembership = await memberModel_1.default.findOne({ userId: user._id, workspaceId: { $ne: workspace._id } }).session(session);
            user.currentWorkspace = otherMembership ? otherMembership.workspaceId : null;
            await user.save({ session });
        }
        await workspace.deleteOne({ session });
        await session.commitTransaction();
        session.endSession();
        return { currentWorkspace: user.currentWorkspace };
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};
exports.deleteWorkspaceService = deleteWorkspaceService;
