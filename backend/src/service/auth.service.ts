import mongoose from "mongoose";
import UserModel from "../models/userModel";
import AccountModel from "../models/accountModel";
import WorkspaceModel from "../models/workspaceModel";
import RoleModel from "../models/roleModel";
import { Roles } from "../enums/role";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../utils/appError";
import MemberModel from "../models/memberModel";
import { ProviderEnum } from "../enums/accProvider";

export const loginOrCreateAccountService = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string;
    email?: string;
}) => {
    const { providerId, provider, displayName, email, picture } = data;
    const useTransactions = process.env.NODE_ENV !== "development";
    const session = useTransactions ? await mongoose.startSession() : null;
    try {
        if (session) session.startTransaction();

        // 1. Existing account?
        const existingAccountQuery = AccountModel.findOne({ provider: provider as any, providerId });
        const existingAccount = session ? await existingAccountQuery.session(session) : await existingAccountQuery;
        if (existingAccount) {
            const userQ = UserModel.findById(existingAccount.userId);
            const user = session ? await userQ.session(session) : await userQ;
            if (!user) throw new NotFoundError("User for account not found");
            if (session) {
                await session.commitTransaction();
                session.endSession();
            }
            return { user };
        }

        // 2. Email already tied to another provider? Block mismatched login.
        if (email) {
            const existingUserQ = UserModel.findOne({ email });
            const existingUser = session ? await existingUserQ.session(session) : await existingUserQ;
            if (existingUser) {
            const accountsQ = AccountModel.find({ userId: existingUser._id }).select("provider");
            const accounts = session ? await accountsQ.session(session) : await accountsQ;
                const providers = accounts.map(a => a.provider).join(", ");
                throw new UnauthorizedError(
                    providers
                        ? `This email is registered with: ${providers}. Please use the same provider.`
                        : `This email is already registered.`
                );
            }
        }

        // 3. Create new user + account + workspace + membership
            const user = await new UserModel({
            email,
            name: displayName,
            profilePicture: picture || null,
            }).save({ session: session || undefined });

            await new AccountModel({
            userId: user._id,
            provider: provider as any,
            providerId,
            }).save({ session: session || undefined });

            const workspace = await new WorkspaceModel({
            name: `My Workspace`,
            description: `Workspace created for ${user.name}`,
            owner: user._id,
            }).save({ session: session || undefined });

        const ownerRoleQ = RoleModel.findOne({ name: Roles.OFFICER });
        const ownerRole = session ? await ownerRoleQ.session(session) : await ownerRoleQ;
        if (!ownerRole) throw new NotFoundError("Officer role not found");

        await new MemberModel({
            userId: user._id,
            workspaceId: workspace._id,
            role: ownerRole._id,
            joinedAt: new Date(),
        }).save({ session: session || undefined });

        user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
        await user.save({ session: session || undefined });

        if (session) {
            await session.commitTransaction();
            session.endSession();
        }
        return { user };
    } catch (err) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw err;
    }
};

// Email registration flow (no transactions in development)
/* {export const registerWithEmailService = async (data: {
    name?: string;
    email: string;
    password: string;
}) => {
    const { name, email, password } = data;

    // Check if user exists
    let existing = await UserModel.findOne({ email });
    if (existing) {
        // Check providers tied to this user
        const existingAccounts = await AccountModel.find({ userId: existing._id }).select("provider");
        const providers = existingAccounts.map((a) => a.provider);
        if (providers.includes("email" as any)) {
            throw new BadRequestError("Email already registered");
        }
        throw new UnauthorizedError(
            `This email is already registered with: ${providers.join(", ")}. Please sign in with that provider.`
        );
    }

    // Create user
    let user = new UserModel({
        name: name || email.split("@")[0],
        email,
        password,
    });
    await user.save();

    // Link account to EMAIL provider
    const account = new AccountModel({
        userId: user._id,
        provider: "email" as any,
        providerId: email,
    });
    await account.save();

    // Create workspace and assign OFFICER role
    const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
    });
    await workspace.save();

    const ownerRole = await RoleModel.findOne({ name: Roles.OFFICER });
    if (!ownerRole) throw new NotFoundError("Owner's Role Not Found");

    const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
    });
    await member.save();

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    return { user };
}; }*/

// Email login flow
/* {export const loginWithEmailService = async (data: {
    email: string;
    password: string;
}) => {
    const { email, password } = data;
    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
        throw new UnauthorizedError("Invalid credentials");
    }
    // Ensure this user has an EMAIL provider account
    const emailAccount = await AccountModel.findOne({ userId: user._id, provider: "email" as any });
    if (!emailAccount) {
        const otherAccounts = await AccountModel.find({ userId: user._id }).select("provider");
        const providers = otherAccounts.map((a) => a.provider).join(", ");
        throw new UnauthorizedError(
            providers
                ? `This email is registered with: ${providers}. Please sign in using the same provider.`
                : "This account is not configured for email login."
        );
    }
    const ok = await compareValues(password, user.password);
    if (!ok) throw new UnauthorizedError("Invalid credentials");
    return { user };
}; } */

export const registerUserService = async (body: { email: string; name: string; password: string }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { email, name, password } = body;
        const existingUser = await UserModel.findOne({ email }).session(session);
        if (existingUser) throw new BadRequestError("Existing Account");

        const user = await new UserModel({ email, name, password }).save({ session });
        await new AccountModel({
            userId: user._id,
            provider: ProviderEnum.EMAIL,
            providerId: email,
        }).save({ session });

        const workspace = await new WorkspaceModel({
            name: `My Workspace`,
            description: `Workspace created for ${user.name}`,
            owner: user._id,
        }).save({ session });

        const ownerRole = await RoleModel.findOne({ name: Roles.OFFICER }).session(session);
        if (!ownerRole) throw new NotFoundError("Officer role not found");

        await new MemberModel({
            userId: user._id,
            workspaceId: workspace._id,
            role: ownerRole._id,
            joinedAt: new Date(),
        }).save({ session });

        user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();
        return { userId: user._id, workspace: workspace._id };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const verifyUserService = async ({
    email,
    password,
    provider = ProviderEnum.EMAIL,
}: {
    email: string;
    password: string;
    provider?: string;
}) => {
    const account = await AccountModel.findOne({ provider, providerId: email });
    if (!account) throw new NotFoundError("Invalid email or password");

    const user = await UserModel.findById(account.userId).select("+password");
    if (!user) throw new NotFoundError("User not found for the given account");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new UnauthorizedError("Invalid email or password");

    return user.omitPassword();
};