export class UpdateComicSiteDto {
  comicId?: string;
  siteId?: string;
  url?: string;
  isAvailable?: boolean;
  lastCheckedAt?: Date | null;
}
