"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginOrCreateAccountService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const accountModel_1 = __importDefault(require("../models/accountModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const roleModel_1 = __importDefault(require("../models/roleModel"));
const role_1 = require("../enums/role");
const appError_1 = require("../utils/appError");
const memberModel_1 = __importDefault(require("../models/memberModel"));
const loginOrCreateAccountService = async (data) => {
    const { providerId, provider, displayName, email, picture } = data;
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        console.log("Session Start...");
        let user = await userModel_1.default.findOne({ email }).session(session);
        if (!user) {
            user = new userModel_1.default({
                email,
                name: displayName,
                profilePicture: picture || null,
            });
            await user.save({ session });
            const account = new accountModel_1.default({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            });
            await account.save({ session });
            const workspace = new workspaceModel_1.default({
                name: `My Workspace`,
                description: `Workspace created for ${user.name}`,
                owner: user._id,
            });
            await workspace.save({ session });
            const ownerRole = await roleModel_1.default.findOne({
                name: role_1.Roles.OFFICER,
            }).session(session);
            if (!ownerRole) {
                throw new appError_1.NotFoundError("Owner's Role Not Found");
            }
            const member = new memberModel_1.default({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            await member.save({ session });
            user.currentWorkspace = workspace._id;
            await user.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
        console.log("Session End...");
        return { user };
    }
    catch (error) {
        console.error("Error occurred during login or account creation:", error);
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
exports.loginOrCreateAccountService = loginOrCreateAccountService;
