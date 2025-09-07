"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithEmailService = exports.registerWithEmailService = exports.loginOrCreateAccountService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const accountModel_1 = __importDefault(require("../models/accountModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const roleModel_1 = __importDefault(require("../models/roleModel"));
const role_1 = require("../enums/role");
const appError_1 = require("../utils/appError");
const memberModel_1 = __importDefault(require("../models/memberModel"));
const bcrypt_1 = require("../utils/bcrypt");
const loginOrCreateAccountService = async (data) => {
    const { providerId, provider, displayName, email, picture } = data;
    // Disable transactions in local development (standalone MongoDB)
    const useTransactions = process.env.NODE_ENV !== "development";
    let session = null;
    if (useTransactions) {
        session = await mongoose_1.default.startSession();
    }
    try {
        if (session)
            session.startTransaction();
        console.log("Session Start...");
        // Use session only when available
        const s = session || undefined;
        // 1) First, try to find an existing account by provider + providerId
        let existingAccountQuery = accountModel_1.default.findOne({ provider: provider, providerId });
        if (s)
            existingAccountQuery = existingAccountQuery.session(s);
        const existingAccount = await existingAccountQuery;
        if (existingAccount) {
            // Provider and providerId match — load the user and return
            let userByAccountQuery = userModel_1.default.findById(existingAccount.userId);
            if (s)
                userByAccountQuery = userByAccountQuery.session(s);
            const user = await userByAccountQuery;
            if (!user)
                throw new appError_1.NotFoundError("User for account not found");
            if (session) {
                await session.commitTransaction();
                session.endSession();
            }
            console.log("Session End...");
            return { user };
        }
        // 2) No matching provider account. If email maps to an existing user, block cross-provider login.
        let userQuery = email ? userModel_1.default.findOne({ email }) : null;
        if (s && userQuery)
            userQuery = userQuery.session(s);
        let user = userQuery ? await userQuery : null;
        if (user) {
            // Find user providers to show a helpful error
            let providersQuery = accountModel_1.default.find({ userId: user._id }).select("provider");
            if (s)
                providersQuery = providersQuery.session(s);
            const accounts = await providersQuery;
            const providers = accounts.map((a) => a.provider).join(", ");
            throw new appError_1.UnauthorizedError(providers
                ? `This email is registered with: ${providers}. Please sign in using the same provider.`
                : `This email is already registered. Please sign in using the original provider.`);
        }
        if (!user) {
            user = new userModel_1.default({
                email,
                name: displayName,
                profilePicture: picture || null,
            });
            if (s) {
                await user.save({ session: s });
            }
            else {
                await user.save();
            }
            const account = new accountModel_1.default({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            });
            if (s) {
                await account.save({ session: s });
            }
            else {
                await account.save();
            }
            const workspace = new workspaceModel_1.default({
                name: `My Workspace`,
                description: `Workspace created for ${user.name}`,
                owner: user._id,
            });
            if (s) {
                await workspace.save({ session: s });
            }
            else {
                await workspace.save();
            }
            let ownerRoleQuery = roleModel_1.default.findOne({
                name: role_1.Roles.OFFICER,
            });
            if (s)
                ownerRoleQuery = ownerRoleQuery.session(s);
            const ownerRole = await ownerRoleQuery;
            if (!ownerRole) {
                throw new appError_1.NotFoundError("Owner's Role Not Found");
            }
            const member = new memberModel_1.default({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            if (s) {
                await member.save({ session: s });
            }
            else {
                await member.save();
            }
            user.currentWorkspace = workspace._id;
            if (s) {
                await user.save({ session: s });
            }
            else {
                await user.save();
            }
        }
        if (session) {
            await session.commitTransaction();
            session.endSession();
        }
        console.log("Session End...");
        return { user };
    }
    catch (error) {
        console.error("Error occurred during login or account creation:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};
exports.loginOrCreateAccountService = loginOrCreateAccountService;
// Email registration flow (no transactions in development)
const registerWithEmailService = async (data) => {
    const { name, email, password } = data;
    // Check if user exists
    let existing = await userModel_1.default.findOne({ email });
    if (existing) {
        // Check providers tied to this user
        const existingAccounts = await accountModel_1.default.find({ userId: existing._id }).select("provider");
        const providers = existingAccounts.map((a) => a.provider);
        if (providers.includes("email")) {
            throw new appError_1.BadRequestError("Email already registered");
        }
        throw new appError_1.UnauthorizedError(`This email is already registered with: ${providers.join(", ")}. Please sign in with that provider.`);
    }
    // Create user
    let user = new userModel_1.default({
        name: name || email.split("@")[0],
        email,
        password,
    });
    await user.save();
    // Link account to EMAIL provider
    const account = new accountModel_1.default({
        userId: user._id,
        provider: "email",
        providerId: email,
    });
    await account.save();
    // Create workspace and assign OFFICER role
    const workspace = new workspaceModel_1.default({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
    });
    await workspace.save();
    const ownerRole = await roleModel_1.default.findOne({ name: role_1.Roles.OFFICER });
    if (!ownerRole)
        throw new appError_1.NotFoundError("Owner's Role Not Found");
    const member = new memberModel_1.default({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
    });
    await member.save();
    user.currentWorkspace = workspace._id;
    await user.save();
    return { user };
};
exports.registerWithEmailService = registerWithEmailService;
// Email login flow
const loginWithEmailService = async (data) => {
    const { email, password } = data;
    const user = await userModel_1.default.findOne({ email });
    if (!user || !user.password) {
        throw new appError_1.UnauthorizedError("Invalid credentials");
    }
    // Ensure this user has an EMAIL provider account
    const emailAccount = await accountModel_1.default.findOne({ userId: user._id, provider: "email" });
    if (!emailAccount) {
        const otherAccounts = await accountModel_1.default.find({ userId: user._id }).select("provider");
        const providers = otherAccounts.map((a) => a.provider).join(", ");
        throw new appError_1.UnauthorizedError(providers
            ? `This email is registered with: ${providers}. Please sign in using the same provider.`
            : "This account is not configured for email login.");
    }
    const ok = await (0, bcrypt_1.compareValues)(password, user.password);
    if (!ok)
        throw new appError_1.UnauthorizedError("Invalid credentials");
    return { user };
};
exports.loginWithEmailService = loginWithEmailService;
