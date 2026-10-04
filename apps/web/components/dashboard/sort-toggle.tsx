import Link from "next/link";
import { SortIcon } from "@/components/icons";
import { buildDashboardHref, type DashboardQuery } from "@/lib/dashboard-url";

interface SortToggleProps {
  /** Filtros atuais da URL, preservados ao alternar a ordenação. */
  query: DashboardQuery;
}

/**
 * Alterna a ordenação do acervo entre título (A–Z, padrão) e
 * cadastro mais recente — o estado vive na URL (`?order=`).
 */
export function SortToggle({ query }: SortToggleProps) {
  const current = query.order === "recent" ? "recent" : "title";
  const next = current === "recent" ? "title" : "recent";
  const label = current === "recent" ? "Recentes" : "Título A–Z";

  const href = buildDashboardHref({
    ...query,
    order: next === "title" ? "" : next,
  });

  return (
    <Link
      href={href}
      aria-label={`Ordenação atual: ${label}. Alternar ordenação.`}
      className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <SortIcon className="w-[18px] h-[18px]" />
      <span className="text-caption">
        Ordenar: <span className="font-semibold text-on-surface">{label}</span>
      </span>
    </Link>
  );
}
