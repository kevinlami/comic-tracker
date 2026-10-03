export type ComicType =
  | "MANGA"
  | "MANHWA"
  | "MANHUA"
  | "WEBTOON"
  | "COMIC"
  | "OTHER";

export type ComicStatus =
  | "ONGOING"
  | "COMPLETED"
  | "HIATUS"
  | "CANCELLED"
  | "UNKNOWN";

export type ReadingStatus =
  | "READING"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED"
  | "PLAN_TO_READ";

export interface Site {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Vínculo de um quadrinho com um site de leitura (ComicSite). */
export interface ComicSiteLink {
  id: string;
  comicId: string;
  siteId: string;
  url: string;
  /** Último capítulo lido neste vínculo — cada site guarda a sua URL. */
  currentChapterUrl: string | null;
  site: Site;
}

/** Progresso de leitura em `GET /comic-sites?siteId=` (sem `comicSite` aninhado). */
export type SiteReadingProgress = Omit<ReadingProgress, "comicSite">;

/** Comic aninhado no detalhe do site: `Comic` sem a lista de sites vinculados. */
export type SiteComic = Omit<Comic, "sites" | "readingProgress"> & {
  readingProgress: SiteReadingProgress | null;
};

/** Vínculo site↔quadrinho com o quadrinho aninhado (detalhe do site). */
export interface SiteComicLink extends ComicSiteLink {
  comic: SiteComic;
}

/** Progresso de leitura — apenas o último capítulo lido (sem histórico). */
export interface ReadingProgress {
  id: string;
  comicId: string;
  currentChapterNumber: string | null;
  comicSiteId: string | null;
  lastReadAt: string | null;
  status: ReadingStatus;
  comicSite: ComicSiteLink | null;
}

export interface Comic {
  id: string;
  title: string;
  alternativeTitles: string[];
  type: ComicType;
  status: ComicStatus;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  readingProgress: ReadingProgress | null;
  sites: ComicSiteLink[];
}
