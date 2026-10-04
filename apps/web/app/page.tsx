import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchComics } from "@/services/comics.service";
import { fetchSites } from "@/services/sites.service";
import { ApiError } from "@/services/api-client";
import type { Comic, Site } from "@/types/comic";
import {
  buildDashboardHref,
  DASHBOARD_DEFAULT_QUERY,
  type DashboardQuery,
} from "@/lib/dashboard-url";
import { MetricsSummary } from "@/components/dashboard/metrics-summary";
import { SearchBar } from "@/components/dashboard/search-bar";
import { StatusChips } from "@/components/dashboard/status-chips";
import { ExtraFilters } from "@/components/dashboard/extra-filters";
import { SortToggle } from "@/components/dashboard/sort-toggle";
import { RecentReadings } from "@/components/dashboard/recent-readings";
import { ComicsGrid } from "@/components/dashboard/comics-grid";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ErrorState } from "@/components/dashboard/error-state";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AddIcon } from "@/components/icons";

interface DashboardSearchParams {
  search?: string;
  status?: string;
  order?: string;
  rating?: string;
  site?: string;
  siteStatus?: string;
  inactive?: string;
}

/**
 * Dashboard do acervo — Server Component.
 *
 * Filtros, busca e ordenação vivem na URL (`?search=`, `?status=`,
 * `?order=`, `?rating=`, `?site=`, `?siteStatus=`, `?inactive=`), então o
 * estado é compartilhável e sobrevive ao reload.
 *
 * Abrir o acervo sem nenhum filtro na URL redireciona para a visão padrão
 * (`DASHBOARD_DEFAULT_QUERY`): os filtros são materializados na URL, que
 * passa a refletir o que a tela mostra. "Limpar filtros" vai para a URL
 * "sem filtros" (parâmetros vazios) e nunca para `/`.
 *
 * O skeleton fica num `Suspense` interno (e não num `loading.tsx` raiz)
 * porque qualquer `loading.tsx` na árvore impede o Next de fixar o status
 * 404 de `notFound()` nas demais rotas (vercel/next.js#97514, #99318).
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;

  if (Object.keys(params).length === 0) {
    redirect(buildDashboardHref(DASHBOARD_DEFAULT_QUERY));
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent params={params} />
    </Suspense>
  );
}

async function DashboardContent({
  params,
}: {
  params: DashboardSearchParams;
}) {
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const order = typeof params.order === "string" ? params.order : "";
  const rating = typeof params.rating === "string" ? params.rating : "";
  const site = typeof params.site === "string" ? params.site : "";
  const siteStatus =
    typeof params.siteStatus === "string" ? params.siteStatus : "";
  const inactive = typeof params.inactive === "string" ? params.inactive : "";

  const query: DashboardQuery = {
    search,
    status,
    order,
    rating,
    site,
    siteStatus,
    inactive,
  };

  let comics: Comic[] = [];
  let sites: Site[] = [];
  let error: ApiError | null = null;

  try {
    [comics, sites] = await Promise.all([
      fetchComics({
        search: search || undefined,
        status: status || undefined,
        order: order || undefined,
        rating: rating || undefined,
        site: site || undefined,
        siteStatus: siteStatus || undefined,
        inactive: inactive || undefined,
      }),
      fetchSites(),
    ]);
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

  const hasFilters = Boolean(
    search.trim() || status || order || rating || site || siteStatus || inactive,
  );
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
        className="flex flex-col gap-4 mb-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <SearchBar initialSearch={search} />
          <StatusChips query={query} />
        </div>
        <ExtraFilters sites={sites} query={query} />
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
          <div className="flex items-center gap-4">
            <Link
              href="/comics/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary hover:bg-primary-fixed text-on-primary text-label-md font-semibold transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <AddIcon className="w-4 h-4" />
              <span>Novo quadrinho</span>
            </Link>
            <SortToggle query={query} />
          </div>
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
