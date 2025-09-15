import { ErrorRequestHandler, response, Response } from "express";
import { HTTPSTATUS } from "../config/httpConfig";
import { AppError } from "../utils/appError";
import { z, ZodError } from "zod";
import { error } from "console";
import { ErrorCodeEnum } from "../enums/errCode";


const formatZodError = (
    err: z.ZodError,
    res: Response,
) => {
    const errors = err?.issues?.map((error) => ({
        field: error.path.join("."),
        message: error.message,
    }));
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Vaildation failed",
        err: errors,
        errCode: ErrorCodeEnum.VALIDATION_ERROR,
    });
}

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
): any => {
    if (err instanceof SyntaxError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "Invalid JSON format. Please check your request payload.",
        });
    }

    if (err instanceof ZodError) {
        return formatZodError(res, err);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            error: err.errorCode,
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err?.message || "Unknown error has occurred",
    });
};