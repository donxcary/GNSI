"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const httpConfig_1 = require("../config/httpConfig");
const appError_1 = require("../utils/appError");
const errorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
        return res.status(httpConfig_1.HTTPSTATUS.BAD_REQUEST).json({
            message: "Invalid JSON format. Please check your request payload.",
        });
    }
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            error: err.errorCode,
        });
    }
    return res.status(httpConfig_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err?.message || "Unknown error has occurred",
    });
};
exports.errorHandler = errorHandler;
