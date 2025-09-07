import mongoose, { Document, Schema } from "mongoose";
import { ProviderEnum, ProviderEnumType } from "../enums/accProvider";

export interface AccountDocument extends Document {
    provider: ProviderEnumType;
    providerId: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<AccountDocument>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: Object.values(ProviderEnum), required: true },
    providerId: { type: String, required: true },
}, {
    timestamps: true,
        toJSON: {}
});

const AccountModel = mongoose.model<AccountDocument>("Account", accountSchema);

export default AccountModel;
