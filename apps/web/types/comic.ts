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
}

/** Vínculo de um quadrinho com um site de leitura (ComicSite). */
export interface ComicSiteLink {
  id: string;
  comicId: string;
  siteId: string;
  url: string;
  site: Site;
}

/** Progresso de leitura — apenas o último capítulo lido (sem histórico). */
export interface ReadingProgress {
  id: string;
  comicId: string;
  currentChapterNumber: string | null;
  currentChapterUrl: string | null;
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
