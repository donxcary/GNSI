import { z } from 'zod';

export const nameSchema = z
    .string()
    .min(1, { message: "Name is required" })
    .max(255)
    .trim()
    .nonempty();

export const descriptionSchema = z
    .string()
    .trim()
    .optional();


export const workspaceIdSchema = z
.string()
.trim()
.min(1, {message: "Required Workspace ID"});

export const changeMemberRoleSchema = z.object({
    roleId: z.string().trim().min(1).max(100),
    memberId: z.string().trim().min(1).max(100),
});

export const createWorkspaceSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});
