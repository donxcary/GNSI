import mongoose from "mongoose";
import { Roles } from "../enums/role";
import RoleModel from "../models/roleModel";
import UserModel from "../models/userModel";
import { NotFoundError } from "../utils/appError";
import MemberModel from "../models/memberModel";
import WorkspaceModel from "../models/workspaceModel";
import TaskModel from "../models/taskModel";
import { TaskStatusEnum } from "../enums/task";
import ProjectModel from "../models/projectModel";

// CREATING NEW WORKSPACE
// *********************** 
export const createWorkspaceService = async (userId: string, body: { name: string; description?: string }) => {
  const { name, description } = body;
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const officerRole = await RoleModel.findOne({ name: Roles.OFFICER });
  if (!officerRole) throw new NotFoundError("Officer role not found");

  const workspace = await new WorkspaceModel({ name, description, owner: user._id }).save();

  await new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: officerRole._id,
    joinedAt: new Date(),
  }).save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();
  return { workspace };
};

// GETTING WORKSPACES FOR REGISTED(MEMBERSHIP) USERS
// **********************************************
export const userAllWorkspacesService = async (userId: string) => {
    const memberships = await MemberModel.find({ userId }).populate("workspaceId");
    const workspaces = memberships.map(m => (m as any).workspaceId).filter(Boolean);
    return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  const members = await MemberModel.find({ workspaceId }).populate("role");
  return { workspace: { ...workspace.toObject(), members } };
};

// ACCESS ALL MEMBERS IN WORKSPACE
// *******************************
export const getWorkspaceMembersService = async (workspaceId: string) => {
    const members = await MemberModel.find({ workspaceId })
        .populate("userId", "name email profilePicture -password")
        .populate("role", "name");
    const roles = await RoleModel.find({}, { name: 1 }).lean();
    return { members, roles };
};


export const workspaceAnalyticsService = async (workspaceId: string) => {
  const now = new Date();
  const base = { workspace: workspaceId } as any;
  const [totalTasks, overdueTasks, inProgressTasks, completedTasks, archivedTasks] = await Promise.all([
    TaskModel.countDocuments(base),
    TaskModel.countDocuments({ ...base, status: { $ne: TaskStatusEnum.DONE }, dueDate: { $lt: now } }),
    TaskModel.countDocuments({ ...base, status: TaskStatusEnum.IN_PROGRESS }),
    TaskModel.countDocuments({ ...base, status: TaskStatusEnum.DONE }),
    TaskModel.countDocuments({ ...base, status: TaskStatusEnum.ARCHIVED }),
  ]);
  return { analytics: { totalTasks, overdueTasks, inProgressTasks, completedTasks, archivedTasks } };
};

export const changeMemberRoleService = async (workspaceId: string, roleId: string, memberUserId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  const role = await RoleModel.findById(roleId);
  if (!role) throw new NotFoundError("Role not found");
  const member = await MemberModel.findOne({ workspaceId, userId: memberUserId });
  if (!member) throw new NotFoundError("Member not found in this workspace");
  member.role = role;
  await member.save();
  return { member };
};


export const updateWorkspaceService = async (workspaceId: string, body: { name?: string; description?: string }) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundError("Workspace not found");
    if (body.name !== undefined) workspace.name = body.name;
    if (body.description !== undefined) workspace.description = body.description;
    await workspace.save();
    return { workspace };
};

export const deleteWorkspaceService = async (workspaceId: string, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const workspace = await WorkspaceModel.findById(workspaceId).session(session);
        if (!workspace) throw new NotFoundError("Workspace not found");
        if (workspace.owner.toString() !== userId) throw new NotFoundError("Only owner can delete workspace");

        const user = await UserModel.findById(userId).session(session);
        if (!user) throw new NotFoundError("User not found");

        await Promise.all([
            MemberModel.deleteMany({ workspaceId: workspace._id }).session(session),
            ProjectModel.deleteMany({ workspace: workspace._id }).session(session),
            TaskModel.deleteMany({ workspace: workspace._id }).session(session),
        ]);

        if (user.currentWorkspace?.equals(workspaceId)) {
            const otherMembership = await MemberModel.findOne({ userId: user._id, workspaceId: { $ne: workspace._id } }).session(session);
            user.currentWorkspace = otherMembership ? (otherMembership as any).workspaceId : null;
            await user.save({ session });
        }

        await workspace.deleteOne({ session });
        await session.commitTransaction();
        session.endSession();
        return { currentWorkspace: user.currentWorkspace };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};