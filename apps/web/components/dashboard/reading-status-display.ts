import type { ReadingStatus } from "@/types/comic";

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

/** Classe de texto de cada status. */
export const READING_STATUS_TEXT: Record<ReadingStatus, string> = {
  READING: "text-primary",
  COMPLETED: "text-secondary",
  PAUSED: "text-tertiary",
  DROPPED: "text-error",
  PLAN_TO_READ: "text-on-surface-variant",
};
