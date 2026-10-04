export interface DashboardQuery {
  search?: string;
  status?: string;
  order?: string;
  rating?: string;
  site?: string;
  /** `active` (≥1 site ativo) ou `inactive` (≥1 site desativado). */
  siteStatus?: string;
  inactive?: string;
}

/**
 * Filtros da visão padrão do acervo, aplicados quando ele é aberto sem
 * nenhum filtro na URL (`/`): nota máxima, em leitura, parado há uma
 * semana e sites com pelo menos um link ativo.
 */
export const DASHBOARD_DEFAULT_QUERY: DashboardQuery = {
  status: "READING",
  rating: "5",
  siteStatus: "active",
  inactive: "1w",
};

/**
 * Monta a URL da home (`/`) preservando os filtros informados.
 * Valores vazios são omitidos da query string.
 *
 * Sem nenhum filtro, devolve a URL "sem filtros": os parâmetros que têm
 * padrão são gravados vazios para diferenciar de `/`, que redireciona
 * para a visão padrão com os filtros já aplicados.
 */
export function buildDashboardHref(query: DashboardQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.order) params.set("order", query.order);
  if (query.rating) params.set("rating", query.rating);
  if (query.site) params.set("site", query.site);
  if (query.siteStatus) params.set("siteStatus", query.siteStatus);
  if (query.inactive) params.set("inactive", query.inactive);

  const queryString = params.toString();
  if (queryString) return `/?${queryString}`;

  const emptyQueryString = Object.keys(DASHBOARD_DEFAULT_QUERY)
    .map((key) => `${key}=`)
    .join("&");
  return `/?${emptyQueryString}`;
}
