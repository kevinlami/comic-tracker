export class CreateChapterDto {
  comicSiteId: string;
  number: string;
  title?: string | null;
  url: string;
  publishedAt?: Date | null;
}
