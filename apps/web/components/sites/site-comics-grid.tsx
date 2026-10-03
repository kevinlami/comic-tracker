import Link from "next/link";
import type { SiteComicLink } from "@/types/comic";
import { formatRelativeTime } from "@/lib/relative-time";
import { ComicCover } from "@/components/dashboard/comic-cover";
import {
  COMIC_TYPE_LABEL,
  READING_STATUS_LABEL,
  READING_STATUS_PILL,
} from "@/components/dashboard/status-display";
import { BookIcon, OpenInNewIcon } from "@/components/icons";
import { RatingStars } from "@/components/rating/rating-stars";

interface SiteComicsGridProps {
  links: SiteComicLink[];
}

/**
 * Grade das obras vinculadas ao site. Cada card mostra capa, status de
 * leitura, capítulo atual e "lido há X"; o selo ★ marca o site usado na
 * última leitura registrada (`readingProgress.comicSiteId`).
 */
export function SiteComicsGrid({ links }: SiteComicsGridProps) {
  return (
    <section aria-labelledby="linked-comics-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 id="linked-comics-heading" className="text-headline-sm font-bold">
          Quadrinhos Vinculados
        </h2>
        <span className="text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
          {links.length === 1 ? "1 obra" : `${links.length} obras`}
        </span>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-surface-container">
          <div
            className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3"
            aria-hidden="true"
          >
            <BookIcon className="w-6 h-6" />
          </div>
          <h3 className="text-body-lg font-semibold text-on-surface">
            Nenhuma obra vinculada ainda
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-1 mb-4 max-w-md">
            Abra uma obra do acervo e vincule este site na seção Onde Ler /
            Fontes Vinculadas.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Ir para o Acervo
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {links.map((link) => (
            <SiteComicCard key={link.id} link={link} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SiteComicCard({ link }: { link: SiteComicLink }) {
  const { comic } = link;
  const progress = comic.readingProgress;
  const status = progress?.status;
  const chapter = progress?.currentChapterNumber;
  const lastRead = formatRelativeTime(progress?.lastReadAt ?? null);
  const isPrimary = progress?.comicSiteId === link.id;

  return (
    <li className="group flex flex-col rounded-lg bg-surface-container overflow-hidden border border-outline-variant/60 transition-colors hover:bg-surface-container-high">
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-surface-container-low">
        <ComicCover
          coverUrl={comic.coverUrl}
          title={comic.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"
          aria-hidden="true"
        />

        {isPrimary ? (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-caption font-bold uppercase tracking-wider bg-tertiary/90 text-surface">
            ★ Principal
          </span>
        ) : null}

        {status ? (
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded text-caption font-bold uppercase tracking-wider backdrop-blur-sm ${READING_STATUS_PILL[status]}`}
          >
            {READING_STATUS_LABEL[status]}
          </span>
        ) : null}

        <RatingStars
          rating={comic.rating}
          variant="badge"
          className="absolute bottom-9 right-2"
        />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
          {chapter ? (
            <span className="px-2 py-0.5 rounded bg-surface/90 text-on-surface text-caption font-mono">
              Cap. {chapter}
            </span>
          ) : (
            <span />
          )}
          {lastRead ? (
            <span className="text-caption text-secondary font-medium">
              lido {lastRead}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3 min-w-0">
        <Link
          href={`/comics/${comic.id}`}
          className="text-body-lg text-on-surface font-semibold truncate hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {comic.title}
        </Link>
        <span className="text-caption text-outline uppercase tracking-wider truncate">
          {COMIC_TYPE_LABEL[comic.type]}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 px-3 py-2 border-t border-outline-variant/60">
        <Link
          href={`/comics/${comic.id}`}
          className="inline-flex items-center gap-1.5 text-caption text-on-surface-variant hover:text-on-surface transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <BookIcon className="w-3.5 h-3.5" />
          <span>Detalhes</span>
        </Link>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-caption text-primary font-semibold hover:underline rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <span>Abrir Leitor</span>
          <OpenInNewIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </li>
  );
}
