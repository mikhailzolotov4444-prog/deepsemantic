/** Pagination shared by every list/search use case. */
export interface PageRequest {
  readonly page: number; // 1-based
  readonly pageSize: number;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export function emptyPage<T>(request: PageRequest): Page<T> {
  return { items: [], total: 0, page: request.page, pageSize: request.pageSize };
}

export function totalPages(page: Pick<Page<unknown>, "total" | "pageSize">): number {
  return Math.max(1, Math.ceil(page.total / page.pageSize));
}
