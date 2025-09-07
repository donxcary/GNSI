import { HTTPSTATUS, HttpStatusCodeType } from "../config/httpConfig";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/errCode";



export class AppError extends Error {
    public statusCode: HttpStatusCodeType;
    public errorCode?: ErrorCodeEnumType;

    constructor(
    message: string,
    statusCode: HttpStatusCodeType,
        errorCode?: ErrorCodeEnumType
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class HttpException extends AppError {
    constructor(
    message: string,
        statusCode: HttpStatusCodeType,
        errorCode?: ErrorCodeEnumType
    ) {
        super(message, statusCode, errorCode);
    }
}

export class InternalServerError extends AppError {
    constructor(
    message: string = "Internal Server Error",
        errorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.INTERNAL_SERVER_ERROR,
            errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
        );
    }
}


export class BadRequestError extends AppError {
    constructor(
    message: string = "Bad Request",
        errorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.BAD_REQUEST,
            errorCode || ErrorCodeEnum.BAD_REQUEST
        );
    }
}

export class NotFoundError extends AppError {
    constructor(
    message: string = "Not Found",
        errorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.NOT_FOUND,
            errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
        );
    }
}

export class UnauthorizedError extends AppError {
    constructor(
    message: string = "Unauthorized",
        errorCode?: ErrorCodeEnumType
    ) {
        super(
            message,
            HTTPSTATUS.UNAUTHORIZED,
            errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED
        );
    }
}

