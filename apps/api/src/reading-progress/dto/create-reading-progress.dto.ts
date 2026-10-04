export class CreateReadingProgressDto {
  comicId: string;
  currentChapterNumber?: string | null;
  /**
   * URL do capítulo lido — gravada no vínculo (`ComicSite`) de destino,
   * não no progresso. Exige `comicSiteId`.
   */
  currentChapterUrl?: string | null;
  comicSiteId?: string | null;
  status?: string;
  /**
   * Data da leitura (ISO 8601). Opcional — usado para importações com
   * histórico; sem informar, a data é a do momento do registro.
   */
  lastReadAt?: string | null;
}
