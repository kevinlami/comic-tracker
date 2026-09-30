import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { updateComicAction } from "@/app/comics/actions";
import { ComicForm } from "@/components/comic-form/comic-form";
import { ErrorState } from "@/components/dashboard/error-state";
import { ArrowBackIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/services/api-client";
import { fetchComic } from "@/services/comics.service";
import type { Comic } from "@/types/comic";

interface ComicEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Deduplica o fetch entre `generateMetadata` e a página (mesma requisição).
 * `notFound()` no corpo fixa o status HTTP 404 (ver detalhe em
 * `app/comics/[id]/page.tsx`) — não adicionar `loading.tsx` na árvore.
 */
const getCachedComic = cache(fetchComic);

export async function generateMetadata({
  params,
}: ComicEditPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const comic = await getCachedComic(id);
    return { title: `Editar ${comic.title} · Comic Tracker` };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return { title: "Editar quadrinho · Comic Tracker" };
  }
}

export default async function ComicEditPage({
  params,
}: ComicEditPageProps) {
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

  return (
    <div className="flex flex-col w-full text-on-surface gap-8">
      <nav
        aria-label="Navegação secundária"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/comics/${comic.id}`}
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-md rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <ArrowBackIcon className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" />
            <span>Voltar ao quadrinho</span>
          </Link>
          <span className="text-outline text-label-sm" aria-hidden="true">
            /
          </span>
          <span className="flex items-center gap-1.5 text-caption text-on-surface-variant min-w-0">
            <Link
              href="/"
              className="hover:text-on-surface transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              Acervo
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-on-surface font-medium truncate max-w-[160px] sm:max-w-[320px]">
              {comic.title}
            </span>
            <span aria-hidden="true">›</span>
            <span className="text-primary font-medium">Editar</span>
          </span>
        </div>
      </nav>

      <section className="w-full max-w-4xl mx-auto bg-surface-container-low rounded-xl border border-outline-variant p-6 sm:p-8 lg:p-10">
        <div className="flex items-start gap-4 pb-6 mb-6 border-b border-outline-variant">
          <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shrink-0">
            <EditIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-headline-sm sm:text-headline-lg tracking-tight">
              Editar quadrinho
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Ajuste os dados cadastrais da obra. Alterações valem para o
              catálogo e para as telas de acompanhamento.
            </p>
          </div>
        </div>

        <ComicForm action={updateComicAction} initial={comic} />
      </section>
    </div>
  );
}
