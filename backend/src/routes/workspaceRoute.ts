import { Router } from 'express';
import { createWorkspaceController, membersWorkspacesController, userAllWorkspacesByIdController, userAllWorkspacesController } from '../controllers/workspaceController';
import { use } from 'passport';

const workspaceRoutes = Router();

// Define workspace-related routes here
// For example:
workspaceRoutes.post('/create/new', createWorkspaceController);

workspaceRoutes.get('/all', userAllWorkspacesController);

workspaceRoutes.get('/members/:id', membersWorkspacesController);

workspaceRoutes.get('/:id', userAllWorkspacesByIdController);

workspaceRoutes.get('/analytics/:id', workspaceAnalyticsController);

export default workspaceRoutes;