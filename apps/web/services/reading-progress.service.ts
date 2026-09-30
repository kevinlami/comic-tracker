import type { ReadingProgress } from "@/types/comic";
import { apiFetch } from "./api-client";

export interface UpsertReadingProgressPayload {
  currentChapterNumber?: string | null;
  currentChapterUrl?: string | null;
  comicSiteId?: string | null;
  status?: string;
}

/**
 * Cria ou atualiza o progresso em uma única operação atômica
 * (`PUT /reading-progress/:comicId`).
 *
 * Campos omitidos não são alterados; campos `null` são limpos.
 * `lastReadAt` só muda quando capítulo/URL são enviados.
 */
export function upsertReadingProgress(
  comicId: string,
  payload: UpsertReadingProgressPayload,
): Promise<ReadingProgress> {
  return apiFetch<ReadingProgress>(
    `/reading-progress/${encodeURIComponent(comicId)}`,
    { method: "PUT", json: payload },
  );
}
