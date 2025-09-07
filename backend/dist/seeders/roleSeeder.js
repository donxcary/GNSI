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
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        console.log("Deleting existing roles...");
        await roleModel_1.default.deleteMany({}).session(session);
        for (const roleName in permission_1.RolePermissions) {
            const role = roleName;
            const permissions = permission_1.RolePermissions[role];
            // Check for existing roles
            const existingRole = await roleModel_1.default.findOne({ name: role }).session(session);
            if (!existingRole) {
                const newRole = new roleModel_1.default({ name: role, permissions: permissions, });
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
    }
    catch (error) {
        console.error("Error during seeding:", error);
    }
};
seedRoles().catch((error) => console.error("Error running seed script:", error));
