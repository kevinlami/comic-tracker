import Link from "next/link";
import { SearchOffIcon } from "@/components/icons";

interface EmptyStateProps {
  /** `true` quando há busca/filtros ativos na URL. */
  hasFilters: boolean;
}

/**
 * Estado vazio: sem resultados para os filtros ou sem quadrinhos no acervo.
 */
export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <section className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
      <div
        className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3"
        aria-hidden="true"
      >
        <SearchOffIcon className="w-6 h-6" />
      </div>
      <h3 className="text-body-lg font-semibold text-on-surface">
        {hasFilters
          ? "Nenhum resultado para os filtros"
          : "Nenhum quadrinho cadastrado ainda"}
      </h3>
      <p className="text-body-sm text-on-surface-variant mt-1 mb-4 max-w-md">
        {hasFilters
          ? "Não encontramos nenhum quadrinho correspondente à sua busca ou filtros selecionados."
          : "Seu acervo está vazio. Cadastre quadrinhos para vê-los aqui."}
      </p>
      {hasFilters ? (
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Limpar filtros
        </Link>
      ) : null}
    </section>
  );
}
