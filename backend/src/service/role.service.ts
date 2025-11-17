import RoleModel from "../models/roleModel";

export const getAllRolesService = async () => {
    const roles = await RoleModel.find({});
    return roles;
};
