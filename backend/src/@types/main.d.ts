import { UserDocument } from "../models/userModel";

declare global {
    namespace Express {
        interface User extends UserDocument {
            _id?: any;
            // email: string;
            // displayName: string;
            // provider: string;
            // providerId: string;
            // picture?: string;
        }
    }
}