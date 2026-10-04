"use client";

import { useRouter } from "next/navigation";
import { HubIcon } from "@/components/icons";
import { buildDashboardHref, type DashboardQuery } from "@/lib/dashboard-url";

interface SiteStatusToggleProps {
  /** Filtros atuais da URL, preservados ao alternar a situação. */
  query: DashboardQuery;
}

/**
 * Alterna o acervo entre obras com sites ativos e obras com sites
 * desativados — o estado vive na URL (`?siteStatus=`).
 *
 * Sem `siteStatus` nada é filtrado, mas o rótulo já exibe "Com sites
 * ativos" (posição inicial do toggle) e o primeiro clique aplica o
 * filtro oposto. Só o visual destacado indica que o filtro está ativo.
 * O "Limpar" da barra de filtros é quem volta ao estado sem filtro.
 */
export function SiteStatusToggle({ query }: SiteStatusToggleProps) {
  const router = useRouter();

  const isFiltering = Boolean(query.siteStatus);
  const showingInactive = query.siteStatus === "inactive";
  const label = showingInactive
    ? "Com sites desativados"
    : "Com sites ativos";
  const next = showingInactive ? "active" : "inactive";

  const applyToggle = () => {
    router.replace(buildDashboardHref({ ...query, siteStatus: next }), {
      scroll: false,
    });
  };

  return (
    <button
      type="button"
      onClick={applyToggle}
      aria-label={`Situação dos sites: ${label}${
        isFiltering ? " (filtro ativo)" : " (sem filtro)"
      }. Alternar para ${next === "active" ? "ativos" : "desativados"}.`}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-caption whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
        isFiltering
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <HubIcon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
