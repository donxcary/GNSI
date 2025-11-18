"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const appError_1 = require("./appError");
const permission_1 = require("./permission");
const roleGuard = (role, requiredPermissions) => {
    const permissions = permission_1.RolePermissions[role];
    // If the role doesn't evist or has an unauthorised permission, throw an error
    const hasPermission = requiredPermissions.every((permission) => permissions.includes(permission));
    if (!hasPermission) {
        throw new appError_1.UnauthorizedError("You do not have permission to access this account.");
    }
};
exports.roleGuard = roleGuard;
