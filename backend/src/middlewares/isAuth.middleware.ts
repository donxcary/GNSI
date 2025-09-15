import e, { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../utils/appError";



export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
        throw new UnauthorizedError("User is not authenticated");
    }
    next();
};

export default isAuthenticated;