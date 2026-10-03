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
}
