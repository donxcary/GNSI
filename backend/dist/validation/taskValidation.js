"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = exports.taskIdSchema = exports.statusSchema = exports.prioritySchema = exports.dueDateSchema = exports.assignedSchema = exports.descriptionSchema = exports.titleSchema = void 0;
const zod_1 = require("zod");
const task_1 = require("../enums/task");
exports.titleSchema = zod_1.z.string().min(2).max(255);
exports.descriptionSchema = zod_1.z.string().min(5).max(500).optional();
exports.assignedSchema = zod_1.z.string().min(2).max(100).nullable().optional();
exports.dueDateSchema = zod_1.z.date().min(new Date()).optional().refine((val) => {
    return !val || !isNaN(Date.parse(val.toString()));
}, {
    message: "Please provide a valid due date. Invalid date format.",
});
exports.prioritySchema = zod_1.z.enum(Object.values(task_1.TaskPriorityEnum));
exports.statusSchema = zod_1.z.enum(Object.values(task_1.TaskStatusEnum));
exports.taskIdSchema = zod_1.z.string().trim().uuid();
exports.createTaskSchema = zod_1.z.object({
    title: exports.titleSchema,
    description: exports.descriptionSchema,
    dueDate: exports.dueDateSchema,
    priority: exports.prioritySchema,
    status: exports.statusSchema,
    assignedTo: exports.assignedSchema
});
exports.updateTaskSchema = exports.createTaskSchema.partial();
