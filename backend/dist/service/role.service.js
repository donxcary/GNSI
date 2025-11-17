"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRolesService = void 0;
const roleModel_1 = __importDefault(require("../models/roleModel"));
const getAllRolesService = async () => {
    const roles = await roleModel_1.default.find({});
    return roles;
};
exports.getAllRolesService = getAllRolesService;
