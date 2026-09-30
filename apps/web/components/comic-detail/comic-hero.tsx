import type { Comic, ComicStatus } from "@/types/comic";
import { formatDate } from "@/lib/format-date";
import { formatRelativeTime } from "@/lib/relative-time";
import { ComicCover } from "@/components/dashboard/comic-cover";
import {
  COMIC_STATUS_LABEL,
  READING_STATUS_LABEL,
  READING_STATUS_PILL,
} from "@/components/dashboard/status-display";
import { ClockIcon } from "@/components/icons";

/** Badge do status de publicação (fundo + texto), sem badge para UNKNOWN. */
const PUBLICATION_PILL: Record<ComicStatus, string> = {
  ONGOING: "bg-surface-container-high text-on-surface-variant",
  COMPLETED: "bg-secondary/15 text-secondary",
  HIATUS: "bg-tertiary/15 text-tertiary",
  CANCELLED: "bg-error/10 text-error",
  UNKNOWN: "bg-surface-container-high text-on-surface-variant",
};

interface ComicHeroProps {
  comic: Comic;
}

export function ComicHero({ comic }: ComicHeroProps) {
  const progress = comic.readingProgress;
  const status = progress?.status;
  const chapter = progress?.currentChapterNumber;
  const lastRead = formatRelativeTime(progress?.lastReadAt ?? null);
  const publicationLabel = COMIC_STATUS_LABEL[comic.status];

  const statusLabel = status ? READING_STATUS_LABEL[status] : "Não iniciado";
  const statusPill = status
    ? READING_STATUS_PILL[status]
    : "bg-surface-container-high text-on-surface-variant";
  const dotMotion = status === "READING" ? "animate-pulse" : "";

  return (
    <section className="bg-surface-container-low rounded-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-20 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="w-48 sm:w-56 shrink-0 mx-auto md:mx-0">
        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-surface-container-high relative group">
          <ComicCover
            coverUrl={comic.coverUrl}
            title={comic.title}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-surface-container-lowest to-transparent flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-sm bg-surface/90 text-primary text-caption tracking-wider uppercase font-semibold">
              {comic.type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6 min-w-0">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-sm bg-primary/10 text-primary text-caption uppercase tracking-wider font-semibold">
              {comic.type}
            </span>
            {publicationLabel ? (
              <span
                className={`px-2.5 py-1 rounded-sm text-caption uppercase tracking-wider font-semibold ${PUBLICATION_PILL[comic.status]}`}
              >
                {publicationLabel}
              </span>
            ) : null}
            <span className="px-2.5 py-1 rounded-sm bg-tertiary/15 text-tertiary text-caption uppercase tracking-wider font-semibold">
              {comic.sites.length}{" "}
              {comic.sites.length === 1 ? "site" : "sites"}
            </span>
          </div>

          <h1 className="text-headline-lg sm:text-display-lg tracking-tight">
            {comic.title}
          </h1>

          {comic.alternativeTitles.length > 0 ? (
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              <span className="block text-caption text-outline uppercase tracking-wider mb-1">
                Títulos alternativos
              </span>
              {comic.alternativeTitles.join(" · ")}
            </p>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 bg-surface-container rounded-lg px-4">
            <div>
              <span className="block text-caption text-outline uppercase tracking-wider">
                Tipo
              </span>
              <span className="text-body-md text-on-surface font-semibold truncate block">
                {comic.type}
              </span>
            </div>
            <div>
              <span className="block text-caption text-outline uppercase tracking-wider">
                Status da obra
              </span>
              <span className="text-body-md text-on-surface font-semibold block">
                {publicationLabel ?? "—"}
              </span>
            </div>
            <div>
              <span className="block text-caption text-outline uppercase tracking-wider">
                Cadastrado em
              </span>
              <span className="text-body-md text-on-surface font-semibold block">
                {formatDate(comic.createdAt)}
              </span>
            </div>
            <div>
              <span className="block text-caption text-outline uppercase tracking-wider">
                Última alteração
              </span>
              <span className="text-body-md text-on-surface font-semibold block">
                {formatDate(comic.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-high">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-label-md font-semibold flex items-center gap-1.5 ${statusPill}`}
            >
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full bg-current ${dotMotion}`}
              />
              {statusLabel}
            </span>
            {chapter ? (
              <span className="text-body-lg text-on-surface">
                Capítulo Atual:{" "}
                <strong className="text-primary font-bold">{chapter}</strong>
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-outline text-body-sm">
            <ClockIcon className="w-4 h-4" />
            <span>
              {lastRead
                ? `Última leitura registrada ${lastRead}`
                : "Ainda sem leitura registrada"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
