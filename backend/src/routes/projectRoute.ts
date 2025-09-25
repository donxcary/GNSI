import { Router } from "express";
// import { createProjectController, getAllProjectsController } from "../controllers/ProjectController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { validateProjectCreation } from "../middlewares/validateProjectCreation";
import { validateProjectUpdate } from "../middlewares/validateProjectUpdate";
import { projectController } from "../controllers/ProjectController";


const projectRoutes = Router();

projectRoutes.post(
    "/workspace/:workspaceId/create",
    authenticateToken,
    validateProjectCreation,
    projectController.createProject.bind(projectController)
);

projectRoutes.put(
    "/workspace/:workspaceId/update/:id",
    authenticateToken,
    validateProjectUpdate,
    projectController.updateProject.bind(projectController)
);

projectRoutes.delete(
    "/workspace/:workspaceId/delete/:id",
    authenticateToken,
    projectController.deleteProject.bind(projectController)
);

projectRoutes.get(
    "/:id/workspace/:workspaceId",
    authenticateToken,
    projectController.getProjectById.bind(projectController)
);

projectRoutes.get(
    "/workspace/:workspaceId/:id/analytics",
    authenticateToken,
    projectController.getProjectAnalytics.bind(projectController)
);

projectRoutes.get(
    "/workspace/:workspaceId/all",
    authenticateToken,
    projectController.getAllProjects.bind(projectController)
);

export default projectRoutes;