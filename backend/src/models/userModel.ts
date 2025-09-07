import mongoose, { Document, Schema } from "mongoose";
import { hashValue, compareValues } from "../utils/bcrypt";

export interface UserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    profilePicture: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date | null;
    currentWorkspace: mongoose.Types.ObjectId | null;
    comparePassword: (password: string) => Promise<boolean>;
    omitPassword: () => Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>({
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, select: true },
    profilePicture: { type: String, required: false, default: null },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
    currentWorkspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", default: null },
},
{
    timestamps: true,
}
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        if (this.password) {
            this.password = await hashValue(this.password)
        }
    }
    next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

userSchema.methods.comparePassword = async function (value: string): Promise<boolean> {
    if (!this.password) return false;
    return await compareValues(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;


