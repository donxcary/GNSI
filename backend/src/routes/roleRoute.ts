import { Router } from "express";
import { getAllRolesController } from "../controllers/roleController";

const roleRoutes = Router();

roleRoutes.get("/", getAllRolesController);

export default roleRoutes;
