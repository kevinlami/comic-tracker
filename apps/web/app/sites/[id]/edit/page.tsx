import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { updateSiteAction } from "@/app/sites/actions";
import { SiteForm } from "@/components/sites/site-form";
import { ErrorState } from "@/components/dashboard/error-state";
import { ArrowBackIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/services/api-client";
import { fetchSite } from "@/services/sites.service";
import type { Site } from "@/types/comic";

interface SiteEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Deduplica o fetch entre `generateMetadata` e a página (mesma requisição).
 * `notFound()` no corpo fixa o status HTTP 404 (mesmo padrão de
 * `app/comics/[id]/edit/page.tsx`) — não adicionar `loading.tsx` na árvore.
 */
const getCachedSite = cache(fetchSite);

export async function generateMetadata({
  params,
}: SiteEditPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const site = await getCachedSite(id);
    return { title: `Editar ${site.name} · Comic Tracker` };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { title: "Editar site · Comic Tracker" };
  }
}

export default async function SiteEditPage({ params }: SiteEditPageProps) {
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
            <span className="text-on-surface font-medium truncate max-w-[160px] sm:max-w-[320px]">
              {site.name}
            </span>
            <span aria-hidden="true">›</span>
            <span className="text-primary font-medium">Editar</span>
          </span>
        </div>
      </nav>

      <section className="w-full max-w-4xl mx-auto bg-surface-container-low rounded-xl border border-outline-variant p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl">
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-outline-variant">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
              <EditIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-headline-sm sm:text-headline-lg tracking-tight">
                Editar Site
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-xl">
                Ajuste os dados cadastrais da fonte. Os vínculos existentes nos
                quadrinhos continuam válidos.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-caption uppercase tracking-wider bg-surface-container-highest text-primary font-semibold">
            Editar Registro
          </span>
        </div>

        <SiteForm action={updateSiteAction} initial={site} />
      </section>
    </div>
  );
}
