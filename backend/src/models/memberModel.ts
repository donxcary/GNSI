import mongoose, { Document, Schema } from "mongoose";
import { RoleDocument } from "./roleModel";

export interface MemberDocument extends Document {
    userId: mongoose.Types.ObjectId;
    workspaceId: mongoose.Types.ObjectId;
    role: RoleDocument;
    joinedAt: Date;
    updatedAt: Date;
}

const memberSchema = new Schema<MemberDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    joinedAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
}, {
    timestamps: true,
});

const MemberModel = mongoose.model<MemberDocument>("Member", memberSchema);

export default MemberModel;