"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = exports.InternalServerError = exports.HttpException = exports.AppError = void 0;
const httpConfig_1 = require("../config/httpConfig");
const errCode_1 = require("../enums/errCode");
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class HttpException extends AppError {
    constructor(message, statusCode, errorCode) {
        super(message, statusCode, errorCode);
    }
}
exports.HttpException = HttpException;
class InternalServerError extends AppError {
    constructor(message = "Internal Server Error", errorCode) {
        super(message, httpConfig_1.HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode || errCode_1.ErrorCodeEnum.INTERNAL_SERVER_ERROR);
    }
}
exports.InternalServerError = InternalServerError;
class BadRequestError extends AppError {
    constructor(message = "Bad Request", errorCode) {
        super(message, httpConfig_1.HTTPSTATUS.BAD_REQUEST, errorCode || errCode_1.ErrorCodeEnum.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends AppError {
    constructor(message = "Not Found", errorCode) {
        super(message, httpConfig_1.HTTPSTATUS.NOT_FOUND, errorCode || errCode_1.ErrorCodeEnum.RESOURCE_NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized", errorCode) {
        super(message, httpConfig_1.HTTPSTATUS.UNAUTHORIZED, errorCode || errCode_1.ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
