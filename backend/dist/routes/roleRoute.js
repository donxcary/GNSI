"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const roleRoutes = (0, express_1.Router)();
roleRoutes.get("/", roleController_1.getAllRolesController);
exports.default = roleRoutes;
