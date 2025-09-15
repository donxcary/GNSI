import { ErrorCodeEnum } from "../enums/errCode";
import MemberModel from "../models/memberModel";
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