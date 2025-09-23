import { Router } from "express";
import { joinWorkspaceController } from "../controllers/memberController";



const memberRoute = Router();

memberRoute.post("/workspace/join/:inviteToken/join", joinWorkspaceController);

export default memberRoute;