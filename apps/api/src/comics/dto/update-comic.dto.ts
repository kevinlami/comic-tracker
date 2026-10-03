import { ComicType, ComicStatus } from '../../generated/enums';

export class UpdateComicDto {
  title?: string;
  alternativeTitles?: string[];
  type?: ComicType;
  status?: ComicStatus;
  coverUrl?: string | null;
  /** Avaliação pessoal de 1 a 5; `null` limpa; ausente não altera. */
  rating?: number | null;
}
