import { z } from "zod";

export const emojiSchema = z.string().trim().max(10).optional();
export const colorSchema = z.string().trim().max(20).optional();
export const projectNameSchema = z.string().min(2).max(225).trim();
export const projectDescriptionSchema = z.string().trim().min(10).max(1000).optional();

export const createProjectControllerSchema = z.object({
    emoji: emojiSchema,
    color: colorSchema,
    name: projectNameSchema,
    description: projectDescriptionSchema,
    workspaceId: z.string().uuid(),
});

export const updateProjectSchema = z.object({
    emoji: emojiSchema.optional(),
    color: colorSchema.optional(),
    name: projectNameSchema.optional(),
    description: projectDescriptionSchema.optional(),
});

export const projectIdSchema = z.string().trim().min(1).uuid();