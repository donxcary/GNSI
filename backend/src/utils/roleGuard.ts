import { PermissionType } from "../enums/role";
import { UnauthorizedError } from "./appError";
import { RolePermissions } from "./permission";


export const roleGuard = (role: keyof typeof RolePermissions, requiredPermissions: PermissionType[]) => {
    const permissions = RolePermissions[role];

    // If the role doesn't evist or has an unauthorised permission, throw an error

    const hasPermission = requiredPermissions.every((permission) => 
        permissions.includes(permission));

    if (!hasPermission) {
        throw new UnauthorizedError("You do not have permission to access this account.");
    }
}