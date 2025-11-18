"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkspaceSchema = exports.createWorkspaceSchema = exports.changeMemberRoleSchema = exports.workspaceIdSchema = exports.descriptionSchema = exports.nameSchema = void 0;
const zod_1 = require("zod");
exports.nameSchema = zod_1.z
    .string()
    .min(1, { message: "Name is required" })
    .max(255)
    .trim()
    .nonempty();
exports.descriptionSchema = zod_1.z
    .string()
    .trim()
    .optional();
exports.workspaceIdSchema = zod_1.z
    .string()
    .trim()
    .min(1, { message: "Required Workspace ID" });
exports.changeMemberRoleSchema = zod_1.z.object({
    roleId: zod_1.z.string().trim().min(1).max(100),
    memberId: zod_1.z.string().trim().min(1).max(100),
});
exports.createWorkspaceSchema = zod_1.z.object({
    name: exports.nameSchema,
    description: exports.descriptionSchema,
});
exports.updateWorkspaceSchema = zod_1.z.object({
    name: exports.nameSchema,
    description: exports.descriptionSchema,
});
