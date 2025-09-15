import { off } from "process";
import { Roles } from "../enums/role";
import RoleModel from "../models/roleModel";
import UserModel from "../models/userModel";
import { NotFoundError } from "../utils/appError";
import { join } from "path";
import MemberModel from "../models/memberModel";
import WorkspaceModel from "../models/workspaceModel";
import mongoose from "mongoose";

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


