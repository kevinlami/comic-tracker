export class CreateReadingProgressDto {
  comicId: string;
  currentChapterNumber?: string | null;
  currentChapterUrl?: string | null;
  comicSiteId?: string | null;
  status?: string;
}
