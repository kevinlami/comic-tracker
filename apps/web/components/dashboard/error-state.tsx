"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudOffIcon, RefreshIcon } from "@/components/icons";
import { buildDashboardHref } from "@/lib/dashboard-url";

interface ErrorStateProps {
  status: number;
  message: string;
}

/**
 * Falha ao carregar o acervo: filtro inválido (400) ou falha da API.
 */
export function ErrorState({ status, message }: ErrorStateProps) {
  const router = useRouter();
  const isInvalidFilter = status === 400;

  return (
    <section
      role="alert"
      className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col items-center text-center"
    >
      <div
        className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center mb-3"
        aria-hidden="true"
      >
        <CloudOffIcon className="w-6 h-6" />
      </div>
      <h2 className="text-body-lg font-semibold text-error">
        {isInvalidFilter ? "Filtro inválido" : "Não foi possível carregar"}
      </h2>
      <p className="text-body-sm text-on-surface-variant mt-1 mb-4 max-w-md">
        {message}
      </p>
      {isInvalidFilter ? (
        <Link
          href={buildDashboardHref({})}
          className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Limpar filtros
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <RefreshIcon className="w-4 h-4" />
          Tentar novamente
        </button>
      )}
    </section>
  );
}
