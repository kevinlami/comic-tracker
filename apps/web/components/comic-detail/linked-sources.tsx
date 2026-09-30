import type { Comic, Site } from "@/types/comic";
import { AddLinkSection } from "./add-link-section";
import { RemoveLinkButton } from "./remove-link-button";
import { BookIcon, HubIcon, OpenInNewIcon } from "@/components/icons";

interface LinkedSourcesProps {
  comic: Comic;
  sites: Site[];
}

/** Lista os sites vinculados ao quadrinho e permite adicionar/remover vínculos. */
export function LinkedSources({ comic, sites }: LinkedSourcesProps) {
  const usedLinkId = comic.readingProgress?.comicSiteId;

  return (
    <section
      className="bg-surface-container-low rounded-xl p-6 sm:p-8 space-y-6"
      aria-labelledby="sources-heading"
    >
      <AddLinkSection comicId={comic.id} sites={sites}>
        <div>
          <div className="flex items-center gap-2">
            <HubIcon className="w-[22px] h-[22px] text-tertiary" />
            <h2
              id="sources-heading"
              className="text-headline-sm text-on-surface"
            >
              Onde Ler / Fontes Vinculadas
            </h2>
          </div>
          <p className="text-body-md text-on-surface-variant mt-1">
            Sites vinculados ao quadrinho para leitura direta e registro do
            progresso.
          </p>
        </div>
      </AddLinkSection>

      {comic.sites.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          Nenhum site vinculado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {comic.sites.map((link) => (
            <li
              key={link.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <BookIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-lg text-on-surface font-semibold">
                      {link.site.name}
                    </span>
                    {usedLinkId === link.id ? (
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-caption font-bold uppercase tracking-wider">
                        Em uso
                      </span>
                    ) : null}
                  </div>
                  <p className="text-body-sm text-outline truncate max-w-md sm:max-w-xl">
                    {link.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-bright text-on-surface hover:text-primary text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  <span>Abrir Leitor</span>
                  <OpenInNewIcon className="w-4 h-4" />
                </a>
                <RemoveLinkButton linkId={link.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
