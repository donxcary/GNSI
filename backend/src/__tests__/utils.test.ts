import { buildPagination } from '../utils/pagination';
import { roleGuard } from '../utils/roleGuard';
import { RolePermissions } from '../utils/permission';
import { TaskStatusEnum } from '../enums/task';
import { UnauthorizedError } from '../utils/appError';

describe('pagination utility', () => {
  it('should clamp page size and compute skip', () => {
    const p = buildPagination({ pageNumber: '2', pageSize: '500', maxPageSize: 100 });
    expect(p.pageNumber).toBe(2);
    expect(p.pageSize).toBe(100); // clamped
    expect(p.skip).toBe(100);
  });
});

describe('roleGuard', () => {
  it('allows when permission present', () => {
    const officerPerms = RolePermissions.officer;
    expect(() => roleGuard('officer', [officerPerms[0]])).not.toThrow();
  });
  it('denies when permission missing', () => {
    expect(() => roleGuard('member', ['DELETE_WORKSPACE' as any])).toThrow(UnauthorizedError);
  });
});

describe('task enum integrity', () => {
  it('does not contain COMPLETED entry anymore', () => {
    expect(Object.values(TaskStatusEnum)).not.toContain('COMPLETED');
  });
  it('includes done state', () => {
    expect(Object.values(TaskStatusEnum)).toContain('done');
  });
});
