"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const databaseConfig_1 = __importDefault(require("../config/databaseConfig"));
const roleModel_1 = __importDefault(require("../models/roleModel"));
const permission_1 = require("../utils/permission");
const seedRoles = async () => {
    console.log("Seeding roles started...");
    try {
        await (0, databaseConfig_1.default)();
        const useTransactions = process.env.NODE_ENV !== "development";
        let session = null;
        if (useTransactions) {
            session = await mongoose_1.default.startSession();
            session.startTransaction();
        }
        console.log("Deleting existing roles...");
        if (session) {
            await roleModel_1.default.deleteMany({}).session(session);
        }
        else {
            await roleModel_1.default.deleteMany({});
        }
        for (const roleName in permission_1.RolePermissions) {
            const role = roleName;
            const permissions = permission_1.RolePermissions[role];
            // Check for existing roles
            let existingRoleQuery = roleModel_1.default.findOne({ name: role });
            if (session)
                existingRoleQuery = existingRoleQuery.session(session);
            const existingRole = await existingRoleQuery;
            if (!existingRole) {
                const newRole = new roleModel_1.default({ name: role, permissions: permissions, });
                if (session) {
                    await newRole.save({ session });
                }
                else {
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
    }
    catch (error) {
        console.error("Error during seeding:", error);
    }
};
seedRoles().catch((error) => console.error("Error running seed script:", error));
