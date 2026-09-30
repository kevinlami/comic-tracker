import type { ComicStatus, ReadingStatus } from "@/types/comic";

/** Labels em pt-BR dos status de leitura. */
export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  READING: "Lendo",
  COMPLETED: "Concluído",
  PAUSED: "Pausado",
  DROPPED: "Descartado",
  PLAN_TO_READ: "Planejo ler",
};

/** Classe do ponto colorido de cada status (cor + texto, nunca só cor). */
export const READING_STATUS_DOT: Record<ReadingStatus, string> = {
  READING: "bg-primary",
  COMPLETED: "bg-secondary",
  PAUSED: "bg-tertiary",
  DROPPED: "bg-error",
  PLAN_TO_READ: "bg-outline",
};

/** Classe de texto de cada status de leitura. */
export const READING_STATUS_TEXT: Record<ReadingStatus, string> = {
  READING: "text-primary",
  COMPLETED: "text-secondary",
  PAUSED: "text-tertiary",
  DROPPED: "text-error",
  PLAN_TO_READ: "text-on-surface-variant",
};

/** Classes do pílula de status de leitura (fundo + texto). */
export const READING_STATUS_PILL: Record<ReadingStatus, string> = {
  READING: "bg-primary/20 text-primary",
  COMPLETED: "bg-secondary/15 text-secondary",
  PAUSED: "bg-tertiary/15 text-tertiary",
  DROPPED: "bg-error/10 text-error",
  PLAN_TO_READ: "bg-surface-container-high text-on-surface-variant",
};

/**
 * Labels em pt-BR do status de publicação da obra.
 * `null` para `UNKNOWN` (não exibir badge).
 */
export const COMIC_STATUS_LABEL: Record<ComicStatus, string | null> = {
  ONGOING: "Em publicação",
  COMPLETED: "Finalizado",
  HIATUS: "Hiato",
  CANCELLED: "Cancelado",
  UNKNOWN: null,
};
