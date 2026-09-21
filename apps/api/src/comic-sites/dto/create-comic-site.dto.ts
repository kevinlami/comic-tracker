export class CreateComicSiteDto {
  comicId: string;
  siteId: string;
  url: string;
  isAvailable?: boolean;
  lastCheckedAt?: Date | null;
}
