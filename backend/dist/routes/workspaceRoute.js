"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspaceController_1 = require("../controllers/workspaceController");
const workspaceRoutes = (0, express_1.Router)();
// Define workspace-related routes here
// For example:
workspaceRoutes.post('/create/new', workspaceController_1.createWorkspaceController);
workspaceRoutes.put('/update/:id', workspaceController_1.updateWorkspaceController);
workspaceRoutes.put('/change/members/role/:id', workspaceController_1.changeMembersRoleController);
workspaceRoutes.delete('/delete/:id', workspaceController_1.deleteWorkspaceController);
workspaceRoutes.get('/all', workspaceController_1.userAllWorkspacesController);
workspaceRoutes.get('/members/:id', workspaceController_1.membersWorkspacesController);
workspaceRoutes.get('/:id', workspaceController_1.userAllWorkspacesByIdController);
workspaceRoutes.get('/analytics/:id', workspaceController_1.workspaceAnalyticsController);
exports.default = workspaceRoutes;
