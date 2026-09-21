export class CreateComicDto {
  title: string;
  alternativeTitles?: string[];
  type?: string;
  status?: string;
  coverUrl?: string | null;
}
