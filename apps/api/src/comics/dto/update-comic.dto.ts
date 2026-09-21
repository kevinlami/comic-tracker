import { ComicType, ComicStatus } from '../../generated/enums';

export class UpdateComicDto {
  title?: string;
  alternativeTitles?: string[];
  type?: ComicType;
  status?: ComicStatus;
  coverUrl?: string | null;
}
