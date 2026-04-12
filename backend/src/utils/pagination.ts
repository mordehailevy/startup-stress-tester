import { Request } from "express";

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Extract pagination params from query string with sensible defaults.
 * ?page=1&limit=20  →  { page: 1, limit: 20, skip: 0 }
 */
export function parsePagination(req: Request, defaultLimit = 20, maxLimit = 100): PaginationQuery {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationQuery
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}
