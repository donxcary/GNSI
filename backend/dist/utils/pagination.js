"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPagination = void 0;
const buildPagination = ({ pageNumber = 1, pageSize = 10, maxPageSize = 100, defaultPageSize = 10, }) => {
    const pn = Math.max(1, parseInt(String(pageNumber), 10) || 1);
    let ps = parseInt(String(pageSize), 10) || defaultPageSize;
    ps = Math.min(Math.max(1, ps), maxPageSize);
    const skip = (pn - 1) * ps;
    return { pageNumber: pn, pageSize: ps, skip, limit: ps };
};
exports.buildPagination = buildPagination;
