import { ErrorCodeEnum } from "../enums/errCode";
import { Roles } from "../enums/role";
import MemberModel from "../models/memberModel";
import RoleModel from "../models/roleModel";
import WorkspaceModel from "../models/workspaceModel"
import { NotFoundError, UnauthorizedError } from "../utils/appError";

export const getMemberRoleService = async (userId: string, workspaceId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    const member = await MemberModel.findOne({
        userId,
        workspaceId,
    }).populate("role");

    if (!member) {
        throw new UnauthorizedError("Unauthorised workspace member",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED);
        }

        const roleName = member.role?.name;

        return { role: roleName };
};

export const joinWorkspaceService = async ({ inviteToken, userId }: { inviteToken: string; userId?: string; }) => {
    // Find the workspace by invite token
    const workspace = await WorkspaceModel.findOne({ inviteToken }).exec();
    if (!workspace) {
        throw new NotFoundError("Invalid invite token or workspace not found");
    }

    // Ensure the user is already authenticated
    const existingMember = await MemberModel.findOne({ userId, workspaceId: workspace._id }).exec();
    if (existingMember) {
        throw new UnauthorizedError("User is already a member of this workspace",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }

    // Get the default role for new members
    const role = await RoleModel.findOne({ name: Roles.MEMBER }).exec();
    if (!role) {
        throw new NotFoundError("Default role not found");
    }

    const newMember = await MemberModel.create({
        userId,
        workspaceId: workspace._id,
        role: role._id,
    });
    await newMember.save();

    // Return the workspace ID and assigned role
    return { workspaceId: workspace._id, role: role.name };
};