"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWorkspaceService = exports.getMemberRoleService = void 0;
const errCode_1 = require("../enums/errCode");
const role_1 = require("../enums/role");
const memberModel_1 = __importDefault(require("../models/memberModel"));
const roleModel_1 = __importDefault(require("../models/roleModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const appError_1 = require("../utils/appError");
const getMemberRoleService = async (userId, workspaceId) => {
    const workspace = await workspaceModel_1.default.findById(workspaceId);
    if (!workspace) {
        throw new appError_1.NotFoundError("Workspace not found");
    }
    const member = await memberModel_1.default.findOne({
        userId,
        workspaceId,
    }).populate("role");
    if (!member) {
        throw new appError_1.UnauthorizedError("Unauthorised workspace member", errCode_1.ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
    const roleName = member.role?.name;
    return { role: roleName };
};
exports.getMemberRoleService = getMemberRoleService;
const joinWorkspaceService = async ({ inviteToken, userId }) => {
    // Find the workspace by invite token
    const workspace = await workspaceModel_1.default.findOne({ inviteToken }).exec();
    if (!workspace) {
        throw new appError_1.NotFoundError("Invalid invite token or workspace not found");
    }
    // Ensure the user is already authenticated
    const existingMember = await memberModel_1.default.findOne({ userId, workspaceId: workspace._id }).exec();
    if (existingMember) {
        throw new appError_1.UnauthorizedError("User is already a member of this workspace", errCode_1.ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
    // Get the default role for new members
    const role = await roleModel_1.default.findOne({ name: role_1.Roles.MEMBER }).exec();
    if (!role) {
        throw new appError_1.NotFoundError("Default role not found");
    }
    const newMember = await memberModel_1.default.create({
        userId,
        workspaceId: workspace._id,
        role: role._id,
    });
    await newMember.save();
    // Return the workspace ID and assigned role
    return { workspaceId: workspace._id, role: role.name };
};
exports.joinWorkspaceService = joinWorkspaceService;
