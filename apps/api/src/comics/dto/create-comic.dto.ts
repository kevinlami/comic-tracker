import { ComicType, ComicStatus } from '../../generated/enums';

export class CreateComicDto {
  title: string;
  alternativeTitles?: string[];
  type?: ComicType;
  status?: ComicStatus;
  coverUrl?: string | null;
}
