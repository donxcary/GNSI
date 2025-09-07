import mongoose, { Document, Schema } from "mongoose";
import { PermissionType, Roles, RoleType, Permissions } from "../enums/role";


export interface RoleDocument extends Document {
    name: RoleType;
    permissions: Array<PermissionType>;
    createdAt: Date;
    updatedAt: Date;
}

const roleSchema = new Schema<RoleDocument>({
    name: { type: String, required: true, unique: true, enum: Object.values(Roles) },
    permissions: { type: [String], required: true, enum: Object.values(Permissions) },
}, {
    timestamps: true,
});

const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
export default RoleModel;
