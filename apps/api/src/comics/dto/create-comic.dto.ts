import { ComicType, ComicStatus } from '../../generated/enums';

export class CreateComicDto {
  title: string;
  alternativeTitles?: string[];
  type?: ComicType;
  status?: ComicStatus;
  coverUrl?: string | null;
  /** Avaliação pessoal de 1 a 5; `null` (ou ausente) = sem avaliação. */
  rating?: number | null;
}
