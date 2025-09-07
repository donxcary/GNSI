import mongoose from "mongoose";
import UserModel from "../models/userModel";
import AccountModel from "../models/accountModel";
import WorkspaceModel from "../models/workspaceModel";
import RoleModel from "../models/roleModel";
import { Roles } from "../enums/role";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../utils/appError";
import MemberModel from "../models/memberModel";
import { compareValues } from "../utils/bcrypt";

export const loginOrCreateAccountService = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string;
    email?: string;
}) => {
    const { providerId, provider, displayName, email, picture } = data;

    // Disable transactions in local development (standalone MongoDB)
    const useTransactions = process.env.NODE_ENV !== "development";
    let session: mongoose.ClientSession | null = null;
    if (useTransactions) {
        session = await mongoose.startSession();
    }

    try {
        if (session) session.startTransaction();
        console.log("Session Start...");
        // Use session only when available
        const s = session || undefined;

        // 1) First, try to find an existing account by provider + providerId
        let existingAccountQuery = AccountModel.findOne({ provider: provider as any, providerId });
        if (s) existingAccountQuery = existingAccountQuery.session(s);
        const existingAccount = await existingAccountQuery;

        if (existingAccount) {
            // Provider and providerId match — load the user and return
            let userByAccountQuery = UserModel.findById(existingAccount.userId);
            if (s) userByAccountQuery = userByAccountQuery.session(s);
            const user = await userByAccountQuery;
            if (!user) throw new NotFoundError("User for account not found");
            if (session) {
                await session.commitTransaction();
                session.endSession();
            }
            console.log("Session End...");
            return { user };
        }

        // 2) No matching provider account. If email maps to an existing user, block cross-provider login.
        let userQuery = email ? UserModel.findOne({ email }) : null;
        if (s && userQuery) userQuery = userQuery.session(s) as any;
        let user = userQuery ? await userQuery : null;
        if (user) {
            // Find user providers to show a helpful error
            let providersQuery = AccountModel.find({ userId: user._id }).select("provider");
            if (s) providersQuery = providersQuery.session(s) as any;
            const accounts = await providersQuery;
            const providers = accounts.map((a) => a.provider).join(", ");
            throw new UnauthorizedError(
                providers
                    ? `This email is registered with: ${providers}. Please sign in using the same provider.`
                    : `This email is already registered. Please sign in using the original provider.`
            );
        }

        if (!user) {
            user = new UserModel({
                email,
                name: displayName,
                profilePicture: picture || null,
            });

            if (s) {
                await user.save({ session: s });
            } else {
                await user.save();
            }
            const account = new AccountModel({
                userId: user._id,
                provider: provider as any,
                providerId: providerId,
            });

            if (s) {
                await account.save({ session: s });
            } else {
                await account.save();
            }
            const workspace = new WorkspaceModel({
                name: `My Workspace`,
                description: `Workspace created for ${user.name}`,
                owner: user._id,
            });

            if (s) {
                await workspace.save({ session: s });
            } else {
                await workspace.save();
            }
            let ownerRoleQuery = RoleModel.findOne({
                name: Roles.OFFICER,
            });
            if (s) ownerRoleQuery = ownerRoleQuery.session(s);
            const ownerRole = await ownerRoleQuery;

            if (!ownerRole) {
                throw new NotFoundError("Owner's Role Not Found");
            }
            const member = new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            if (s) {
                await member.save({ session: s });
            } else {
                await member.save();
            }

            user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
            if (s) {
                await user.save({ session: s });
            } else {
                await user.save();
            }
        }
        if (session) {
            await session.commitTransaction();
            session.endSession();
        }
        console.log("Session End...");
    return { user };
    } catch (error) {
        console.error("Error occurred during login or account creation:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};

// Email registration flow (no transactions in development)
export const registerWithEmailService = async (data: {
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
};

// Email login flow
export const loginWithEmailService = async (data: {
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
};

export const registerUserService = async (body: {
    email: string,
    name: string,
    password: string,
}) => {
    const { email, name, password } = body;
    const session = await mongoose.startSession();
    try
};