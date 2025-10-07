import exp from "constants";
import { string, z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task";

export const titleSchema = z.string().min(2).max(255);
export const descriptionSchema = z.string().min(5).max(500).optional();
export const assignedSchema = z.string().min(2).max(100).nullable().optional();
export const dueDateSchema = z.date().min(new Date()).optional().refine((val) => {
    return !val || !isNaN(Date.parse(val.toString()));
}, {
    message: "Please provide a valid due date. Invalid date format.",
});
export const prioritySchema = z.enum(
    Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const statusSchema = z.enum(
    Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const taskIdSchema = z.string().trim().uuid();

export const createTaskSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    dueDate: dueDateSchema,
    priority: prioritySchema,
    status: statusSchema,
    assignedTo: assignedSchema
});

export const updateTaskSchema = createTaskSchema.partial();

