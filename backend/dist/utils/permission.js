"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
const role_1 = require("../enums/role");
exports.RolePermissions = {
    officer: [
        role_1.Permissions.CREATE_WORKSPACE,
        role_1.Permissions.ADD_MEMBER,
        role_1.Permissions.CHANGE_MEMBER_ROLE,
        role_1.Permissions.CREATE_PROJECT,
        role_1.Permissions.CREATE_TASK,
        role_1.Permissions.DELETE_PROJECT,
        role_1.Permissions.DELETE_TASK,
        role_1.Permissions.DELETE_WORKSPACE,
        role_1.Permissions.EDIT_PROJECT,
        role_1.Permissions.EDIT_TASK,
        role_1.Permissions.EDIT_WORKSPACE,
        role_1.Permissions.MANAGE_WORKSPACE,
        role_1.Permissions.REMOVE_MEMBER,
        role_1.Permissions.VIEW_ONLY,
    ],
    admin: [
        role_1.Permissions.ADD_MEMBER,
        role_1.Permissions.REMOVE_MEMBER,
        role_1.Permissions.CREATE_PROJECT,
        role_1.Permissions.EDIT_PROJECT,
        role_1.Permissions.DELETE_PROJECT,
        role_1.Permissions.CREATE_TASK,
        role_1.Permissions.EDIT_TASK,
        role_1.Permissions.DELETE_TASK,
        role_1.Permissions.MANAGE_WORKSPACE_SETTINGS,
        role_1.Permissions.VIEW_ONLY,
    ],
    member: [
        role_1.Permissions.VIEW_ONLY,
        role_1.Permissions.ADD_MEMBER,
        role_1.Permissions.CREATE_TASK,
        role_1.Permissions.EDIT_TASK,
    ],
};
