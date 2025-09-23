import { Router } from 'express';
import { changeMembersRoleController, createWorkspaceController, deleteWorkspaceController, membersWorkspacesController, updateWorkspaceController, userAllWorkspacesByIdController, userAllWorkspacesController, workspaceAnalyticsController } from '../controllers/workspaceController';
import { use } from 'passport';

const workspaceRoutes = Router();

// Define workspace-related routes here
// For example:
workspaceRoutes.post('/create/new', createWorkspaceController);

workspaceRoutes.put('/update/:id', updateWorkspaceController);

workspaceRoutes.put('/change/members/role/:id', changeMembersRoleController);

workspaceRoutes.delete('/delete/:id', deleteWorkspaceController);

workspaceRoutes.get('/all', userAllWorkspacesController);

workspaceRoutes.get('/members/:id', membersWorkspacesController);

workspaceRoutes.get('/:id', userAllWorkspacesByIdController);

workspaceRoutes.get('/analytics/:id', workspaceAnalyticsController);

export default workspaceRoutes;