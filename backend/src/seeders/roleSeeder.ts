import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/databaseConfig";
import RoleModel from "../models/roleModel";
import { RolePermissions } from "../utils/permission";

const seedRoles = async () => {
    console.log("Seeding roles started...");

    try {
        await connectDB();
        const useTransactions = process.env.NODE_ENV !== "development";
        let session: mongoose.ClientSession | null = null;
        if (useTransactions) {
            session = await mongoose.startSession();
            session.startTransaction();
        }

        console.log("Deleting existing roles...");

    if (session) {
        await RoleModel.deleteMany({}).session(session);
    } else {
        await RoleModel.deleteMany({});
    }

        for (const roleName in RolePermissions) {
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];
            // Check for existing roles
            let existingRoleQuery = RoleModel.findOne({name: role});
            if (session) existingRoleQuery = existingRoleQuery.session(session);
            const existingRole = await existingRoleQuery;

            if (!existingRole) {
                const newRole = new RoleModel({ name: role, permissions: permissions, });
                if (session) {
                    await newRole.save({ session });
                } else {
                    await newRole.save();
                }
                console.log(`Added ${role} with permissions.`);
            }
            else {
                console.log(`${role} already exists.`);
            }
        }

        if (session) {
            await session.commitTransaction();
            console.log("Transaction committed.");
            session.endSession();
            console.log("Session ended.");
        }
        // On sessions completion without error
        console.log("Seeding completed successfully.");        
    } catch (error) {
        console.error("Error during seeding:", error);
    }
};

seedRoles().catch((error) =>
    console.error("Error running seed script:", error)
);