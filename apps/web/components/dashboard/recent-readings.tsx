import type { Comic } from "@/types/comic";
import { formatRelativeTime } from "@/lib/relative-time";
import { ComicCover } from "./comic-cover";
import {
  READING_STATUS_DOT,
  READING_STATUS_LABEL,
  READING_STATUS_TEXT,
} from "./status-display";

export interface RecentReading {
  comic: Comic;
  lastReadAt: string;
}

interface RecentReadingsProps {
  items: RecentReading[];
}

/**
 * "Retomar leitura": os quadrinhos mais lidos recentemente (top 5),
 * derivados da lista já carregada — sem requisição extra.
 */
export function RecentReadings({ items }: RecentReadingsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="retomar-heading" className="mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h2
            id="retomar-heading"
            className="text-headline-sm font-bold text-on-surface"
          >
            Retomar leitura
          </h2>
          <span className="text-caption text-primary uppercase font-semibold tracking-wider">
            Top 5 recentes
          </span>
        </div>
        <span className="text-caption text-on-surface-variant hidden sm:inline-block">
          Últimas sessões sincronizadas
        </span>
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map(({ comic, lastReadAt }, index) => (
          <li
            key={comic.id}
            className={index === 4 ? "col-span-2 sm:col-span-1" : undefined}
          >
            <RecentCard comic={comic} lastReadAt={lastReadAt} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function RecentCard({ comic, lastReadAt }: RecentReading) {
  const progress = comic.readingProgress;
  const status = progress?.status ?? "PLAN_TO_READ";
  const linkedSite = progress?.comicSite ?? comic.sites[0] ?? null;
  const href = progress?.currentChapterUrl ?? linkedSite?.url ?? null;
  const chapter = progress?.currentChapterNumber;
  const relative = formatRelativeTime(lastReadAt);

  const content = (
    <>
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high">
        <ComicCover
          coverUrl={comic.coverUrl}
          title={comic.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent" />
        {chapter ? (
          <span
            className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-caption font-bold bg-surface-container-lowest/80 backdrop-blur-sm ${READING_STATUS_TEXT[status]}`}
          >
            Cap. {chapter}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-0.5 min-w-0">
        <h3 className="text-label-md font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
          {comic.title}
        </h3>
        <div
          className={`flex items-center gap-1 text-caption ${READING_STATUS_TEXT[status]}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${READING_STATUS_DOT[status]}`}
            aria-hidden="true"
          />
          <span className="font-medium">{READING_STATUS_LABEL[status]}</span>
        </div>
        <span className="text-caption text-outline truncate">
          {relative ? `lido ${relative}` : "lido há pouco"}
        </span>
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="group flex flex-col bg-surface-container-low rounded-xl p-2 shadow-sm h-full">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-surface-container-low rounded-xl p-2 hover:bg-surface-container transition-colors shadow-sm h-full focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      {content}
    </a>
  );
}
