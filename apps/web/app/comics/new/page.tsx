import type { Metadata } from "next";
import Link from "next/link";
import { createComicAction } from "@/app/comics/actions";
import { ComicForm } from "@/components/comic-form/comic-form";
import { AddIcon, ArrowBackIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Novo quadrinho · Comic Tracker",
};

export default function NewComicPage() {
  return (
    <div className="flex flex-col w-full text-on-surface gap-8">
      <nav
        aria-label="Navegação secundária"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-label-md rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <ArrowBackIcon className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" />
            <span>Voltar ao Acervo</span>
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
            <span className="text-primary font-medium">Novo quadrinho</span>
          </span>
        </div>
      </nav>

      <section className="w-full max-w-4xl mx-auto bg-surface-container-low rounded-xl border border-outline-variant p-6 sm:p-8 lg:p-10">
        <div className="flex items-start gap-4 pb-6 mb-6 border-b border-outline-variant">
          <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shrink-0">
            <AddIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-headline-sm sm:text-headline-lg tracking-tight">
              Novo quadrinho
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Cadastre a obra no acervo. Progresso de leitura e vínculos de
              site ficam disponíveis após a criação.
            </p>
          </div>
        </div>

        <ComicForm action={createComicAction} />
      </section>
    </div>
  );
}
