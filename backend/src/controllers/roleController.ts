import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getAllRolesService } from "../service/role.service";
import { HTTPSTATUS } from "../config/httpConfig";

export const getAllRolesController = asyncHandler(async (req: Request, res: Response) => {
    const roles = await getAllRolesService();
    res.status(HTTPSTATUS.OK).json({
        status: "success",
        data: roles,
    });
});
