"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = ({ res, status = 200, message = 'success', data, meta }) => {
    return res.status(status).json({ message, data, meta });
};
exports.sendSuccess = sendSuccess;
