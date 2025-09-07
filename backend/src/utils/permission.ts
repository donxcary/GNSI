import { Roles,  RoleType, PermissionType, Permissions } from "../enums/role";


export const RolePermissions: Record<RoleType, Array<PermissionType>> = {
    officer: [
        Permissions.CREATE_WORKSPACE,
        Permissions.ADD_MEMBER,
        Permissions.CHANGE_MEMBER_ROLE,
        Permissions.CREATE_PROJECT,
        Permissions.CREATE_TASK,
        Permissions.DELETE_PROJECT,
        Permissions.DELETE_TASK,
        Permissions.DELETE_WORKSPACE,
        Permissions.EDIT_PROJECT,
        Permissions.EDIT_TASK,
        Permissions.EDIT_WORKSPACE,
        Permissions.MANAGE_WORKSPACE,
        Permissions.REMOVE_MEMBER,
        Permissions.VIEW_ONLY,
    ],

    admin: [
        Permissions.ADD_MEMBER,
        Permissions.REMOVE_MEMBER,

        Permissions.CREATE_PROJECT,
        Permissions.EDIT_PROJECT,
        Permissions.DELETE_PROJECT,

        Permissions.CREATE_TASK,
        Permissions.EDIT_TASK,
        Permissions.DELETE_TASK,
        Permissions.MANAGE_WORKSPACE_SETTINGS,
        Permissions.VIEW_ONLY,
    ],

    member: [
        Permissions.VIEW_ONLY,
        Permissions.ADD_MEMBER,
        Permissions.CREATE_TASK,
        Permissions.EDIT_TASK,
    ],
};