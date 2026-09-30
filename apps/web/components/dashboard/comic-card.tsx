import type { ReactNode } from "react";
import type { Comic, ComicStatus, ReadingStatus } from "@/types/comic";
import { formatRelativeTime } from "@/lib/relative-time";
import { ComicCover } from "./comic-cover";
import {
  READING_STATUS_DOT,
  READING_STATUS_LABEL,
  READING_STATUS_TEXT,
} from "./reading-status-display";
import { AddIcon, PlayIcon, ReplayIcon, RestoreIcon } from "@/components/icons";

const CTA_PRIMARY =
  "bg-on-surface text-surface hover:opacity-90 transition-opacity";
const CTA_SECONDARY =
  "bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors";
const CTA_MUTED =
  "bg-surface-container text-outline hover:text-on-surface transition-colors";

interface StatusMeta {
  label: string;
  dotClassName: string;
  textClassName: string;
  ctaLabel: string;
  ctaIcon: ReactNode;
  ctaClassName: string;
}

function statusMeta(status: ReadingStatus | "NONE"): StatusMeta {
  const label =
    status === "NONE" ? "Planejo ler" : READING_STATUS_LABEL[status];
  const dotClassName =
    status === "NONE" ? "bg-outline" : READING_STATUS_DOT[status];
  const textClassName =
    status === "NONE" ? "text-on-surface-variant" : READING_STATUS_TEXT[status];

  switch (status) {
    case "COMPLETED":
      return {
        label,
        dotClassName,
        textClassName,
        ctaLabel: "Reler",
        ctaIcon: <ReplayIcon className="w-3.5 h-3.5" />,
        ctaClassName: CTA_SECONDARY,
      };
    case "DROPPED":
      return {
        label,
        dotClassName,
        textClassName,
        ctaLabel: "Retomar",
        ctaIcon: <RestoreIcon className="w-3.5 h-3.5" />,
        ctaClassName: CTA_MUTED,
      };
    case "PLAN_TO_READ":
    case "NONE":
      return {
        label,
        dotClassName,
        textClassName,
        ctaLabel: "Começar",
        ctaIcon: <AddIcon className="w-3.5 h-3.5" />,
        ctaClassName: CTA_SECONDARY,
      };
    default:
      return {
        label,
        dotClassName,
        textClassName,
        ctaLabel: "Continuar lendo",
        ctaIcon: <PlayIcon className="w-3.5 h-3.5" />,
        ctaClassName: CTA_PRIMARY,
      };
  }
}

const PUBLICATION_BADGE: Record<ComicStatus, string | null> = {
  ONGOING: "EM PUBLICAÇÃO",
  COMPLETED: "FINALIZADO",
  HIATUS: "HIATO",
  CANCELLED: "CANCELADO",
  UNKNOWN: null,
};

export function ComicCard({ comic }: { comic: Comic }) {
  const progress = comic.readingProgress;
  const meta = statusMeta(progress?.status ?? "NONE");

  const linkedSite = progress?.comicSite ?? comic.sites[0] ?? null;
  const href =
    progress?.currentChapterUrl ?? linkedSite?.url ?? null;
  const siteName = linkedSite?.site.name ?? null;

  const chapter = progress?.currentChapterNumber ?? null;
  const lastReadRelative = formatRelativeTime(progress?.lastReadAt ?? null);

  const publicationLabel = PUBLICATION_BADGE[comic.status];

  return (
    <article className="h-full bg-surface-container-low rounded-xl p-3 flex gap-3 items-start shadow-sm hover:bg-surface-container transition-all">
      <div className="w-24 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high">
        <ComicCover coverUrl={comic.coverUrl} title={comic.title} />
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0 h-full gap-1">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-caption px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-medium">
              {comic.type}
            </span>
            {publicationLabel ? (
              <span
                className={`text-caption px-2 py-0.5 rounded font-medium ${
                  comic.status === "COMPLETED"
                    ? "bg-secondary/15 text-secondary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {publicationLabel}
              </span>
            ) : null}
          </div>

          <h3
            className="text-body-lg font-semibold text-on-surface leading-snug line-clamp-2"
            title={comic.title}
          >
            {comic.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${meta.dotClassName}`}
              aria-hidden="true"
            />
            <span className={`text-body-sm font-medium ${meta.textClassName}`}>
              {meta.label}
            </span>
            {chapter ? (
              <span className="text-body-sm font-bold text-on-surface ml-1">
                Cap. {chapter}
              </span>
            ) : null}
          </div>

          {lastReadRelative ? (
            <p className="text-caption text-outline mt-1">
              lido {lastReadRelative}
            </p>
          ) : chapter == null ? (
            <p className="text-caption text-outline italic mt-1">
              Sem capítulo registrado
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-1">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold shadow-sm shrink-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${meta.ctaClassName}`}
            >
              {meta.ctaIcon}
              {meta.ctaLabel}
            </a>
          ) : null}
          {siteName ? (
            <span
              className="text-caption text-on-surface-variant font-medium truncate"
              title={siteName}
            >
              {siteName}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
