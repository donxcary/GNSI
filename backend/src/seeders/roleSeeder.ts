import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/databaseConfig";
import RoleModel from "../models/roleModel";
import { RolePermissions } from "../utils/permission";

const seedRoles = async () => {
    console.log("Seeding roles started...");

    try {
        await connectDB();
        const session = await mongoose.startSession();
        session.startTransaction();

        console.log("Deleting existing roles...");

    await RoleModel.deleteMany({}).session(session);

        for (const roleName in RolePermissions) {
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];
            // Check for existing roles
            const existingRole = await RoleModel.findOne({name: role}).session(session)

            if (!existingRole) {
                const newRole = new RoleModel({ name: role, permissions: permissions, });
                await newRole.save({ session });
                console.log(`Added ${role} with permissions.`);
            }
            else {
                console.log(`${role} already exists.`);
            }
        }

        await session.commitTransaction();
        console.log("Transaction committed.");

        session.endSession();
        console.log("Session ended.");
        // On sessions completion without error
        console.log("Seeding completed successfully.");        
    } catch (error) {
        console.error("Error during seeding:", error);
    }
};

seedRoles().catch((error) =>
    console.error("Error running seed script:", error)
);