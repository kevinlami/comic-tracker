import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { fetchSites } from "@/services/sites.service";
import { ApiError } from "@/services/api-client";
import type { Site } from "@/types/comic";
import { SearchBar } from "@/components/dashboard/search-bar";
import { ErrorState } from "@/components/dashboard/error-state";
import { SiteList } from "@/components/sites/site-list";
import { AddIcon, SearchOffIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Sites · Comic Tracker",
};

interface SitesSearchParams {
  search?: string;
}

/**
 * Listagem de sites — Server Component.
 *
 * A busca fica na URL (`?search=`) e o filtro por nome/baseUrl é aplicado
 * aqui, no servidor (a API não possui filtro próprio). O `Suspense` segue o
 * padrão do dashboard — não adicionar `loading.tsx` na árvore (ver
 * `app/page.tsx`).
 */
export default function SitesPage({
  searchParams,
}: {
  searchParams: Promise<SitesSearchParams>;
}) {
  return (
    <Suspense fallback={<SitesPageSkeleton />}>
      <SitesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SitesContent({
  searchParams,
}: {
  searchParams: Promise<SitesSearchParams>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim() : "";

  let sites: Site[] = [];
  let error: ApiError | null = null;

  try {
    sites = await fetchSites();
  } catch (caught) {
    error =
      caught instanceof ApiError
        ? caught
        : new ApiError(0, "Erro inesperado ao carregar os sites.");
  }

  if (error) {
    return <ErrorState status={error.status} message={error.message} />;
  }

  const term = search.toLowerCase();
  const filtered = term
    ? sites.filter(
        (site) =>
          site.name.toLowerCase().includes(term) ||
          site.baseUrl.toLowerCase().includes(term),
      )
    : sites;

  const countLabel = search
    ? filtered.length === 1
      ? "1 site filtrado"
      : `${filtered.length} sites filtrados`
    : filtered.length === 1
      ? "1 site"
      : `${filtered.length} sites`;

  return (
    <div className="flex flex-col w-full text-on-surface gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-outline-variant">
        <div>
          <h1 className="text-headline-sm sm:text-headline-lg tracking-tight">
            Sites de leitura
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Fontes e scans cadastrados para vínculos de leitura no acervo.
          </p>
        </div>
        <Link
          href="/sites/new"
          className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-sm bg-primary hover:bg-primary-fixed text-on-primary text-label-md font-semibold transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <AddIcon className="w-4 h-4" />
          <span>Novo site</span>
        </Link>
      </div>

      <section aria-label="Busca de sites" className="flex items-center gap-4">
        <SearchBar
          initialSearch={search}
          path="/sites"
          placeholder="Buscar por nome ou domínio..."
          label="Buscar site por nome ou domínio"
        />
      </section>

      <section aria-labelledby="sites-heading">
        <div className="flex items-baseline gap-2 mb-4">
          <h2 id="sites-heading" className="text-headline-sm font-bold">
            Meus sites
          </h2>
          <span className="text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
            {countLabel}
          </span>
        </div>

        {filtered.length === 0 ? (
          <SitesEmptyState hasSearch={Boolean(search)} total={sites.length} />
        ) : (
          <SiteList sites={filtered} />
        )}
      </section>
    </div>
  );
}

/** Estado vazio: sem sites cadastrados ou sem resultado para a busca. */
function SitesEmptyState({
  hasSearch,
  total,
}: {
  hasSearch: boolean;
  total: number;
}) {
  return (
    <section className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3"
        aria-hidden="true"
      >
        <SearchOffIcon className="w-6 h-6" />
      </div>
      <h3 className="text-body-lg font-semibold text-on-surface">
        {hasSearch
          ? "Nenhum resultado para a busca"
          : "Nenhum site cadastrado ainda"}
      </h3>
      <p className="text-body-sm text-on-surface-variant mt-1 mb-4 max-w-md">
        {hasSearch
          ? "Não encontramos nenhum site correspondente ao seu termo de busca."
          : "Cadastre os sites onde você lê para vinculá-los aos quadrinhos do acervo."}
      </p>
      {hasSearch && total > 0 ? (
        <Link
          href="/sites"
          className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Limpar busca
        </Link>
      ) : null}
      {!hasSearch && total === 0 ? (
        <Link
          href="/sites/new"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Cadastrar primeiro site
        </Link>
      ) : null}
    </section>
  );
}

function SitesPageSkeleton() {
  return (
    <div className="flex flex-col w-full text-on-surface gap-6 animate-pulse">
      <div className="h-20 rounded-lg bg-surface-container-high" />
      <div className="h-10 rounded-xl bg-surface-container-high max-w-sm" />
      <div className="space-y-3">
        <div className="h-20 rounded-lg bg-surface-container-high" />
        <div className="h-20 rounded-lg bg-surface-container-high" />
        <div className="h-20 rounded-lg bg-surface-container-high" />
      </div>
    </div>
  );
}
