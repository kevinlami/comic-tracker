import type { ComicStatus, ComicType, ReadingStatus } from "@/types/comic";

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

/** Labels em pt-BR do tipo/formato da obra. */
export const COMIC_TYPE_LABEL: Record<ComicType, string> = {
  MANGA: "Mangá",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  WEBTOON: "Webtoon",
  COMIC: "Comic",
  OTHER: "Outro",
};

/** Ordem de exibição dos tipos nos selects de criação/edição. */
export const COMIC_TYPE_ORDER: ComicType[] = [
  "MANGA",
  "MANHWA",
  "MANHUA",
  "WEBTOON",
  "COMIC",
  "OTHER",
];

/** Ordem de exibição do status de publicação nos selects. */
export const COMIC_STATUS_ORDER: ComicStatus[] = [
  "ONGOING",
  "COMPLETED",
  "HIATUS",
  "CANCELLED",
  "UNKNOWN",
];
