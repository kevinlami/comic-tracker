import { ApiError, fetchComics } from "@/services/comics.service";
import type { Comic } from "@/types/comic";
import { MetricsSummary } from "@/components/dashboard/metrics-summary";
import { SearchBar } from "@/components/dashboard/search-bar";
import { StatusChips } from "@/components/dashboard/status-chips";
import { SortToggle } from "@/components/dashboard/sort-toggle";
import { RecentReadings } from "@/components/dashboard/recent-readings";
import { ComicsGrid } from "@/components/dashboard/comics-grid";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";

interface DashboardSearchParams {
  search?: string;
  status?: string;
  order?: string;
}

/**
 * Dashboard do acervo — Server Component.
 *
 * Filtros, busca e ordenação vivem na URL (`?search=`, `?status=`,
 * `?order=`), então o estado é compartilhável e sobrevive ao reload.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const order = typeof params.order === "string" ? params.order : "";

  let comics: Comic[] = [];
  let error: ApiError | null = null;

  try {
    comics = await fetchComics({
      search: search || undefined,
      status: status || undefined,
      order: order || undefined,
    });
  } catch (caught) {
    error =
      caught instanceof ApiError
        ? caught
        : new ApiError(0, "Erro inesperado ao carregar os quadrinhos.");
  }

  if (error) {
    return (
      <ErrorState status={error.status} message={error.message} />
    );
  }

  // "Retomar leitura": top 5 por data da última leitura (mais recente primeiro).
  const reads = comics.flatMap((comic) => {
    const lastReadAt = comic.readingProgress?.lastReadAt;
    return lastReadAt ? [{ comic, lastReadAt }] : [];
  });
  reads.sort((a, b) => Date.parse(b.lastReadAt) - Date.parse(a.lastReadAt));
  const recent = reads.slice(0, 5);

  const hasFilters = Boolean(search.trim() || status || order);
  const countLabel = hasFilters
    ? comics.length === 1
      ? "1 quadrinho filtrado"
      : `${comics.length} quadrinhos filtrados`
    : comics.length === 1
      ? "1 quadrinho"
      : `${comics.length} quadrinhos`;

  return (
    <div className="flex flex-col w-full text-on-surface">
      <MetricsSummary comics={comics} />

      <section
        aria-label="Busca e filtros"
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-12"
      >
        <SearchBar initialSearch={search} />
        <StatusChips search={search} status={status} order={order} />
      </section>

      <RecentReadings items={recent} />

      <section aria-labelledby="acervo-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <h2
              id="acervo-heading"
              className="text-headline-sm font-bold text-on-surface"
            >
              Meus quadrinhos
            </h2>
            <span className="text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
              {countLabel}
            </span>
          </div>
          <SortToggle search={search} status={status} order={order} />
        </div>

        {comics.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <ComicsGrid comics={comics} />
        )}
      </section>
    </div>
  );
}
