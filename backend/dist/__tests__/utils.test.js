"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pagination_1 = require("../utils/pagination");
const roleGuard_1 = require("../utils/roleGuard");
const permission_1 = require("../utils/permission");
const task_1 = require("../enums/task");
const appError_1 = require("../utils/appError");
describe('pagination utility', () => {
    it('should clamp page size and compute skip', () => {
        const p = (0, pagination_1.buildPagination)({ pageNumber: '2', pageSize: '500', maxPageSize: 100 });
        expect(p.pageNumber).toBe(2);
        expect(p.pageSize).toBe(100); // clamped
        expect(p.skip).toBe(100);
    });
});
describe('roleGuard', () => {
    it('allows when permission present', () => {
        const officerPerms = permission_1.RolePermissions.officer;
        expect(() => (0, roleGuard_1.roleGuard)('officer', [officerPerms[0]])).not.toThrow();
    });
    it('denies when permission missing', () => {
        expect(() => (0, roleGuard_1.roleGuard)('member', ['DELETE_WORKSPACE'])).toThrow(appError_1.UnauthorizedError);
    });
});
describe('task enum integrity', () => {
    it('does not contain COMPLETED entry anymore', () => {
        expect(Object.values(task_1.TaskStatusEnum)).not.toContain('COMPLETED');
    });
    it('includes done state', () => {
        expect(Object.values(task_1.TaskStatusEnum)).toContain('done');
    });
});
