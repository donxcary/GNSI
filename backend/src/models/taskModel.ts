import mongoose, { Document, Schema } from "mongoose";
import { TaskPriorityEnum, TaskPriorityEnumType, TaskStatusEnum, TaskStatusEnumType } from "../enums/task";
import { generateTaskCode } from "../utils/uuId";

export interface TaskDocument extends Document {
    taskCode: string;
    title: string;
    description: string | null;
    status: TaskStatusEnumType;
    priority: TaskPriorityEnumType;
    dueDate: Date | null;
    project: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId | null;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>({
    taskCode: { type: String, required: true, unique: true, default: generateTaskCode },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false, default: null },
    status: { type: String, enum: Object.values(TaskStatusEnum), required: true, default: TaskStatusEnum.TODO },
    priority: { type: String, enum: Object.values(TaskPriorityEnum), required: true, default: TaskPriorityEnum.MEDIUM },
    dueDate: { type: Date, required: false, default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true,
});

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);

export default TaskModel;
