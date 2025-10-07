import e, { Router } from "express";
import { createTaskController, deleteTaskController, getAllTasksController, getTaskByIdController, updateTaskController } from "../controllers/taskController";


const taskRouter = Router();

taskRouter.post("/project/:projectId/workspace/:workspaceId/create", createTaskController);
taskRouter.put("/project/:projectId/workspace/:workspaceId/update", updateTaskController);
taskRouter.get("/workspace/:workspaceId/all", getAllTasksController);
taskRouter.get("/:id/project/:projectId/workspace/:workspaceId", getTaskByIdController);
taskRouter.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

export default taskRouter;