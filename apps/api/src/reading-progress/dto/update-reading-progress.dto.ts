export class UpdateReadingProgressDto {
  currentChapterNumber?: string | null;
  /**
   * URL do capítulo lido — gravada no vínculo (`ComicSite`) de destino,
   * não no progresso. Exige site: o `comicSiteId` enviado ou o já atual.
   */
  currentChapterUrl?: string | null;
  comicSiteId?: string | null;
  status?: string;
  /**
   * Data da leitura (ISO 8601). Opcional — usado para importações com
   * histórico; sem informar, vale a regra padrão de `lastReadAt`.
   */
  lastReadAt?: string | null;
}
