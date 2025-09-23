import { z } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { HTTPSTATUS } from "../config/httpConfig";
import { joinWorkspaceService } from "../service/member.service";


export const joinWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    const inviteToken = z.string().parse(req.params.inviteToken);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceService({ inviteToken, userId });

    return res.status(HTTPSTATUS.OK).json({
        status: "success",
        message: `Successfully joined the workspace as ${role}`,
        data: { workspaceId, role },
    });
});