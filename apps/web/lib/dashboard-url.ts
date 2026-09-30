export interface DashboardQuery {
  search?: string;
  status?: string;
  order?: string;
}

/**
 * Monta a URL da home (`/`) preservando os filtros informados.
 * Valores vazios são omitidos da query string.
 */
export function buildDashboardHref(query: DashboardQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.order) params.set("order", query.order);

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}
