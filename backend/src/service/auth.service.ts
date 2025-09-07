import mongoose from "mongoose";
import UserModel from "../models/userModel";
import AccountModel from "../models/accountModel";
import WorkspaceModel from "../models/workspaceModel";
import RoleModel from "../models/roleModel";
import { Roles } from "../enums/role";
import { NotFoundError } from "../utils/appError";
import MemberModel from "../models/memberModel";

export const loginOrCreateAccountService = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string;
    email?: string;
}) => {
    const { providerId, provider, displayName, email, picture } = data;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        console.log("Session Start...");
        let user = await UserModel.findOne({ email }).session(session);

        if (!user) {
            user = new UserModel({
                email,
                name: displayName,
                profilePicture: picture || null,
            });

            await user.save({ session });
            const account = new AccountModel({
                userId: user._id,
                provider: provider as any,
                providerId: providerId,
            });

            await account.save ({ session });
            const workspace = new WorkspaceModel({
                name: `My Workspace`,
                description: `Workspace created for ${user.name}`,
                owner: user._id,
            });

            await workspace.save({ session });
            const ownerRole = await RoleModel.findOne({
                name: Roles.OFFICER,
            }).session(session);

            if (!ownerRole) {
                throw new NotFoundError("Owner's Role Not Found");
            }
            const member = new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            await member.save({ session });

            user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
            await user.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
        console.log("Session End...");
        return { user };
    } catch (error) {
        console.error("Error occurred during login or account creation:", error);
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}