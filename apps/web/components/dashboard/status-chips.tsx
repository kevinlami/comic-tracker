import Link from "next/link";
import type { ReadingStatus } from "@/types/comic";
import { buildDashboardHref } from "@/lib/dashboard-url";
import {
  READING_STATUS_DOT,
  READING_STATUS_LABEL,
} from "./status-display";

interface StatusChipsProps {
  search: string;
  status: string;
  order: string;
}

interface ChipDefinition {
  status?: ReadingStatus;
  label: string;
  dotClassName?: string;
}

const CHIPS: ChipDefinition[] = [
  { label: "Todos" },
  ...(
    [
      "READING",
      "PLAN_TO_READ",
      "PAUSED",
      "COMPLETED",
      "DROPPED",
    ] as ReadingStatus[]
  ).map((status) => ({
    status,
    label: READING_STATUS_LABEL[status],
    dotClassName: READING_STATUS_DOT[status],
  })),
];

/**
 * Filtros por status de leitura como links: o estado vive na URL
 * (`?status=`) e pode ser compartilhado/recarregado.
 */
export function StatusChips({ search, status, order }: StatusChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por status de leitura"
      className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0"
    >
      {CHIPS.map((chip) => {
        const chipStatus = chip.status ?? "";
        const isActive = status === chipStatus;
        const href = buildDashboardHref({ search, order, status: chipStatus });

        return (
          <Link
            key={chip.label}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm whitespace-nowrap shrink-0 transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              isActive
                ? "bg-on-surface text-surface shadow-sm font-semibold"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium"
            }`}
          >
            {chip.dotClassName ? (
              <span
                className={`w-1.5 h-1.5 rounded-full ${chip.dotClassName}`}
                aria-hidden="true"
              />
            ) : null}
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
