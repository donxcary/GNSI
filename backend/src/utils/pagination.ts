export interface PaginationInput {
  pageNumber?: number | string;
  pageSize?: number | string;
  maxPageSize?: number;
  defaultPageSize?: number;
}

export interface PaginationResult {
  pageNumber: number;
  pageSize: number;
  skip: number;
  limit: number;
}

export const buildPagination = ({
  pageNumber = 1,
  pageSize = 10,
  maxPageSize = 100,
  defaultPageSize = 10,
}: PaginationInput): PaginationResult => {
  const pn = Math.max(1, parseInt(String(pageNumber), 10) || 1);
  let ps = parseInt(String(pageSize), 10) || defaultPageSize;
  ps = Math.min(Math.max(1, ps), maxPageSize);
  const skip = (pn - 1) * ps;
  return { pageNumber: pn, pageSize: ps, skip, limit: ps };
};
