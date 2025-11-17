"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const appError_1 = require("../utils/appError");
const isAuthenticated = (req, res, next) => {
    if (!req.user || !req.user._id) {
        throw new appError_1.UnauthorizedError("User is not authenticated");
    }
    next();
};
exports.isAuthenticated = isAuthenticated;
exports.default = exports.isAuthenticated;
