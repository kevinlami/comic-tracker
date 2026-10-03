import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ApiError } from "@/services/api-client";
import { fetchSite } from "@/services/sites.service";
import { fetchComicSitesBySite } from "@/services/comic-sites.service";
import type { Site, SiteComicLink } from "@/types/comic";
import { SiteDetailCard } from "@/components/sites/site-detail-card";
import { SiteComicsGrid } from "@/components/sites/site-comics-grid";
import { ErrorState } from "@/components/dashboard/error-state";
import { ArrowBackIcon } from "@/components/icons";

interface SiteDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Deduplica o fetch entre `generateMetadata` e a página (mesma requisição).
 * `notFound()` no corpo fixa o status HTTP 404 (mesmo padrão de
 * `app/sites/[id]/edit/page.tsx`) — não adicionar `loading.tsx` na árvore.
 */
const getCachedSite = cache(fetchSite);

export async function generateMetadata({
  params,
}: SiteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const site = await getCachedSite(id);
    return { title: `${site.name} · Comic Tracker` };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { title: "Detalhe do site · Comic Tracker" };
  }
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params;

  let site: Site;
  try {
    site = await getCachedSite(id);
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(0, "Erro inesperado ao carregar o site.");
    if (apiError.status === 404) {
      notFound();
    }
    return <ErrorState status={apiError.status} message={apiError.message} />;
  }

  let links: SiteComicLink[] | null = null;
  let linksError: ApiError | null = null;
  try {
    links = await fetchComicSitesBySite(site.id);
  } catch (error) {
    linksError =
      error instanceof ApiError
        ? error
        : new ApiError(0, "Erro inesperado ao carregar os quadrinhos vinculados.");
  }

  return (
    <div className="flex flex-col w-full text-on-surface gap-8">
      <nav
        aria-label="Navegação secundária"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/sites"
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-md rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <ArrowBackIcon className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" />
            <span>Voltar para gerenciamento de sites</span>
          </Link>
          <span className="text-outline text-label-sm" aria-hidden="true">
            /
          </span>
          <span className="flex items-center gap-1.5 text-caption text-on-surface-variant min-w-0">
            <Link
              href="/sites"
              className="hover:text-on-surface transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              Sites
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-primary font-medium truncate max-w-[160px] sm:max-w-[320px]">
              {site.name}
            </span>
          </span>
        </div>
      </nav>

      <SiteDetailCard site={site} linkedCount={links ? links.length : null}>
        {linksError ? (
          <ErrorState status={linksError.status} message={linksError.message} />
        ) : links ? (
          <SiteComicsGrid links={links} />
        ) : null}
      </SiteDetailCard>
    </div>
  );
}
