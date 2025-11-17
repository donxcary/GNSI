"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIdSchema = exports.updateProjectSchema = exports.createProjectControllerSchema = exports.projectDescriptionSchema = exports.projectNameSchema = exports.colorSchema = exports.emojiSchema = void 0;
const zod_1 = require("zod");
exports.emojiSchema = zod_1.z.string().trim().max(10).optional();
exports.colorSchema = zod_1.z.string().trim().max(20).optional();
exports.projectNameSchema = zod_1.z.string().min(2).max(225).trim();
exports.projectDescriptionSchema = zod_1.z.string().trim().min(10).max(1000).optional();
exports.createProjectControllerSchema = zod_1.z.object({
    emoji: exports.emojiSchema,
    color: exports.colorSchema,
    name: exports.projectNameSchema,
    description: exports.projectDescriptionSchema,
    workspaceId: zod_1.z.string().uuid(),
});
exports.updateProjectSchema = zod_1.z.object({
    emoji: exports.emojiSchema.optional(),
    color: exports.colorSchema.optional(),
    name: exports.projectNameSchema.optional(),
    description: exports.projectDescriptionSchema.optional(),
});
exports.projectIdSchema = zod_1.z.string().trim().min(1).uuid();
