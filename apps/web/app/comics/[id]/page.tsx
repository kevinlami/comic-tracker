import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ApiError } from "@/services/api-client";
import { fetchComic } from "@/services/comics.service";
import { fetchSites } from "@/services/sites.service";
import type { Comic, Site } from "@/types/comic";
import { ComicHero } from "@/components/comic-detail/comic-hero";
import { DeleteComicButton } from "@/components/comic-detail/delete-comic-button";
import { LinkedSources } from "@/components/comic-detail/linked-sources";
import { ProgressForm } from "@/components/comic-detail/progress-form";
import { ErrorState } from "@/components/dashboard/error-state";
import { ArrowBackIcon, BookmarkIcon, EditIcon } from "@/components/icons";

interface ComicDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Deduplica o fetch entre `generateMetadata` e a página (mesma requisição).
 * O `notFound()` no corpo é obrigatório: é ele que faz o Next fixar o
 * status HTTP 404 (o do metadata sozinho não basta).
 */
const getCachedComic = cache(fetchComic);

export async function generateMetadata({
  params,
}: ComicDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const comic = await getCachedComic(id);
    return { title: `${comic.title} · Comic Tracker` };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { title: "Comic Tracker" };
  }
}

export default async function ComicDetailPage({
  params,
}: ComicDetailPageProps) {
  const { id } = await params;

  let comic: Comic;
  try {
    comic = await getCachedComic(id);
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(0, "Erro inesperado ao carregar o quadrinho.");
    if (apiError.status === 404) {
      notFound();
    }
    return <ErrorState status={apiError.status} message={apiError.message} />;
  }

  const sites: Site[] = await fetchSites().catch(() => []);

  return (
    <div className="flex flex-col w-full text-on-surface gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-md rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <ArrowBackIcon className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" />
          <span>Voltar ao Acervo</span>
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            href={`/comics/${comic.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <EditIcon className="w-[18px] h-[18px]" />
            <span>Editar Quadrinho</span>
          </Link>
          <DeleteComicButton comicId={comic.id} />
        </div>
      </div>

      <ComicHero comic={comic} />

      <section
        className="bg-surface-container-low rounded-xl p-6 sm:p-8 space-y-6"
        aria-labelledby="progress-heading"
      >
        <div>
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-[22px] h-[22px] text-primary" />
            <h2
              id="progress-heading"
              className="text-headline-sm text-on-surface"
            >
              Registrar Progresso de Leitura
            </h2>
          </div>
          <p className="text-body-md text-on-surface-variant mt-1">
            Atualize o capítulo, o site de leitura e o status — a gravação é
            atômica (uma única operação).
          </p>
        </div>
        <ProgressForm comic={comic} />
      </section>

      <LinkedSources comic={comic} sites={sites} />
    </div>
  );
}
