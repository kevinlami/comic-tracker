"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, CloseIcon, GlobeIcon, StarIcon } from "@/components/icons";
import { SiteStatusToggle } from "@/components/dashboard/site-status-toggle";
import { buildDashboardHref, type DashboardQuery } from "@/lib/dashboard-url";
import type { Site } from "@/types/comic";

interface ExtraFiltersProps {
  /** Sites cadastrados, para o dropdown de site. */
  sites: Site[];
  /** Filtros atuais da URL (renderizados pelo servidor). */
  query: DashboardQuery;
}

interface FilterOption {
  value: string;
  label: string;
  /** Rótulo curto exibido na tag de filtros ativos. */
  short?: string;
}

const RATING_OPTIONS: FilterOption[] = [
  { value: "", label: "Todas as notas" },
  { value: "1", label: "1 estrela", short: "★ 1" },
  { value: "2", label: "2 estrelas", short: "★ 2" },
  { value: "3", label: "3 estrelas", short: "★ 3" },
  { value: "4", label: "4 estrelas", short: "★ 4" },
  { value: "5", label: "5 estrelas", short: "★ 5" },
  { value: "none", label: "Sem avaliação", short: "Sem avaliação" },
];

const INACTIVE_OPTIONS: FilterOption[] = [
  { value: "", label: "Qualquer período" },
  { value: "recent", label: "Lido esta semana", short: "esta semana" },
  { value: "1w", label: "Parado há +1 semana", short: "+1 semana" },
  { value: "2w", label: "Parado há +2 semanas", short: "+2 semanas" },
  { value: "1m", label: "Parado há +1 mês", short: "+1 mês" },
  { value: "never", label: "Nunca lido", short: "nunca lido" },
];

/** Rótulo curto da opção ativa (ou o valor bruto, se desconhecido). */
function activeLabel(options: FilterOption[], value: string): string {
  return options.find((option) => option.value === value)?.short ?? value;
}

interface FilterSelectProps {
  id: string;
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

/**
 * Dropdown pill de filtro: `<select>` nativo (acessível) dentro de um chip.
 */
function FilterSelect({
  id,
  icon,
  iconClassName,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1.5 transition-colors hover:bg-surface-container-high focus-within:bg-surface-container-high">
      <span aria-hidden="true" className={iconClassName}>
        {icon}
      </span>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent text-caption text-on-surface focus:outline-none"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-surface-container-high text-on-surface"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Filtros secundários do acervo — nota, site, período sem leitura e o
 * toggle de sites ativos/desativados.
 *
 * O estado vive na URL (`?rating=`, `?site=`, `?inactive=`,
 * `?siteStatus=`) e cada mudança navega sem recarregar a página, como
 * na busca e nos chips de status.
 */
export function ExtraFilters({ sites, query }: ExtraFiltersProps) {
  const router = useRouter();
  const rating = query.rating ?? "";
  const site = query.site ?? "";
  const inactive = query.inactive ?? "";
  const siteStatus = query.siteStatus ?? "";

  const applyFilter = (patch: DashboardQuery) => {
    router.replace(buildDashboardHref({ ...query, ...patch }), {
      scroll: false,
    });
  };

  const sortedSites = [...sites].sort((a, b) => a.name.localeCompare(b.name));
  const siteOptions: FilterOption[] = [
    { value: "", label: "Todos os sites" },
    ...sortedSites.map((item) => ({ value: item.id, label: item.name })),
    { value: "none", label: "Sem site", short: "Sem site" },
  ];

  const activeFilters: string[] = [];
  if (rating) activeFilters.push(activeLabel(RATING_OPTIONS, rating));
  if (site) activeFilters.push(activeLabel(siteOptions, site));
  if (inactive) activeFilters.push(activeLabel(INACTIVE_OPTIONS, inactive));
  // O toggle fica visível mesmo sem filtro, mas o chip só aparece
  // quando `siteStatus` está na URL (filtro realmente aplicado).
  if (siteStatus) {
    activeFilters.push(
      siteStatus === "inactive" ? "sites desativados" : "sites ativos",
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          id="rating-filter"
          icon={<StarIcon className="w-4 h-4" />}
          iconClassName="text-tertiary"
          label="Filtrar por nota"
          value={rating}
          options={RATING_OPTIONS}
          onChange={(value) => applyFilter({ rating: value })}
        />
        <FilterSelect
          id="site-filter"
          icon={<GlobeIcon className="w-4 h-4" />}
          iconClassName="text-primary"
          label="Filtrar por site"
          value={site}
          options={siteOptions}
          onChange={(value) => applyFilter({ site: value })}
        />
        <FilterSelect
          id="inactive-filter"
          icon={<ClockIcon className="w-4 h-4" />}
          iconClassName="text-on-surface-variant"
          label="Filtrar por período sem leitura"
          value={inactive}
          options={INACTIVE_OPTIONS}
          onChange={(value) => applyFilter({ inactive: value })}
        />
        <SiteStatusToggle query={query} />
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-caption text-primary">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <span>
              Ativos:{" "}
              {activeFilters.map((label, index) => (
                <span key={`${index}-${label}`}>
                  {index > 0 ? ", " : ""}
                  <strong className="font-semibold text-on-surface">
                    {label}
                  </strong>
                </span>
              ))}
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.replace(buildDashboardHref({}), { scroll: false })}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <CloseIcon className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
