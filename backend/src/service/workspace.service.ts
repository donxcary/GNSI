import { off } from "process";
import { Roles } from "../enums/role";
import RoleModel from "../models/roleModel";
import UserModel from "../models/userModel";
import { NotFoundError } from "../utils/appError";
import { join } from "path";
import MemberModel from "../models/memberModel";
import WorkspaceModel from "../models/workspaceModel";
import mongoose from "mongoose";
import TaskModel from "../models/taskModel";
import { TaskStatusEnum } from "../enums/task";
import { session } from "passport";
import ProjectModel from "../models/projectModel";

// CREATING NEW WORKSPACE
// *********************** 
export const createWorkspaceService = async (userId: string, body: { name: string; description?: string | undefined; }) => {
    // Business logic to create a workspace
    const { name, description } = body;
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const officerRole = await RoleModel.findOne({ name: Roles.OFFICER });
    if (!officerRole) {
        throw new NotFoundError("Officer role not found");
    }

    const workspace = new WorkspaceModel({
        name: name,
        description: description,
        officers: [user._id],
        // Add other necessary fields
    });

    await workspace.save();

    const member = new MemberModel({
        user: user._id,
        workspace: workspace._id,
        role: officerRole._id,
        joinedAt: new Date(),
    });

    await member.save();

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    return { workspace };
};

// GETTING WORKSPACES FOR REGISTED(MEMBERSHIP) USERS
// **********************************************
export const userAllWorkspacesService = async (userId: string) => {
    const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password"
    .exec();

    // Extract workspace details from memberships
    const workspace = memberships.map((membership) => membership.workspaceId
    );
    return { workspace };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    const members = await MemberModel.find({
        workspaceId,
    }).populate("role");

    const workspaceWithMembers = {
        ... workspace.toObject(),
        members,
    };

    return {
        workspace: workspaceWithMembers,
    };
};

// ACCESS ALL MEMBERS IN WORKSPACE
// *******************************
export const getWorkspaceMembersService = async (workspaceId: string) => {
    // Fatch all members of the workspace
    const members = await MemberModel.find({
        workspaceId,
    })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

    const roles = await RoleModel.find({}, { name: 1, _id: 1}).select
    ("-permission").lean();

    return { members, roles };
};


export const workspaceAnalyticsService = async (workspaceId: string) => {
    const currentData = new Date();
    // const pastData = new Date();
    // pastData.setDate(pastData.getDate() - 30);

    const totalTasks = await TaskModel.countDocuments({
        workspaceId,
        // createdAt: { $gte: pastData, $lte: currentData },
    });

    const overdueTasks = await TaskModel.countDocuments({
        workspaceId,
        status: { $ne: TaskStatusEnum.DONE },
        dueDate: { $lt: currentData },
        // createdAt: { $gte: pastData, $lte: currentData },
    });

    const inProgressTasks = await TaskModel.countDocuments({
        workspaceId,
        status: TaskStatusEnum.IN_PROGRESS,
        // createdAt: { $gte: pastData, $lte: currentData },
    });

    const completedTasks = await TaskModel.countDocuments({
        workspaceId,
        status: TaskStatusEnum.COMPLETED,
        // createdAt: { $gte: pastData, $lte: currentData },
    });

    const archivedTasks = await TaskModel.countDocuments({
        workspaceId,
        status: TaskStatusEnum.ARCHIVED,
        // createdAt: { $gte: pastData, $lte: currentData },
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        inProgressTasks,
        completedTasks,
        archivedTasks,
    };

    return {
       // workspaceId,
        analytics,
    };
};

export const changeMemberRoleService = async (workspaceId: string, roleId: string, memberId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }
    
    const role = await RoleModel.findById(roleId);
    if (!role) {
        throw new NotFoundError("Role not found");
    }
    
    const member = await MemberModel.findOne({
        workspaceId: workspaceId,
        userId: memberId,
    });
    if (!member) {
        throw new NotFoundError("Member not found in this workspace");
    }
    member.role = role;    //Alternative if finding member role from mongoDB: roleId as mongoose.Types.ObjectId;
    await member.save();
    return { member };
};


export const updateWorkspaceService = async (workspaceId: string, body: { name: string; description?: string; }) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    workspace.name = body.name ?? workspace.name;
    workspace.description = body.description ?? workspace.description;

    await workspace.save();

    return { workspace };
};

export const deleteWorkspaceService = async (workspaceId: string, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // const result = await deleteWorkspaceTransaction(workspaceId, userId, session); 
        const workspace = await WorkspaceModel.findById(workspaceId).session(session);
    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    // Ensure the user is an officer of the workspace
    if (!workspace.owner.toString().includes(userId)) {
        throw new NotFoundError("Only authorised personnels can delete workspace");
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    // If the user's current workspace is the one being deleted, unset it
    // if (user.currentWorkspace?.toString() === workspaceId) {
       // user.currentWorkspace = undefined;
       // await user.save({ session });
    //}

    // Delete all members associated with the workspace
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(session);
    // Delete all Projects associated with the workspace
    await ProjectModel.deleteMany({ workspace: workspace._id }).session(session);
    // Delete all tasks associated with the workspace
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);

    // Update the currentWorkspace for users who had this workspace as their current one
    if (user?.currentWorkspace?.equals(workspaceId)) {
        const memberWorkspace = await MemberModel.findOne({ user: user._id, workspaceId: { $ne: workspace._id } }).session(session);
        // Update the user's currentWorkspace to another workspace they are a member of, if available
        user.currentWorkspace = memberWorkspace ? memberWorkspace.workspaceId : null;
        await user.save({ session });
    }

    // Finally, delete the workspace itself
    await workspace.deleteOne({ session });
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { currentWorkspace: user.currentWorkspace };
    } catch (error) {
        // If any error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        throw error; // Re-throw the error to be handled by the calling function
    }
};