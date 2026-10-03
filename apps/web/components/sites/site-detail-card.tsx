import type { ReactNode } from "react";
import Link from "next/link";
import type { Site } from "@/types/comic";
import { formatDate } from "@/lib/format-date";
import { formatRelativeTime } from "@/lib/relative-time";
import { DeleteSiteButton } from "./delete-site-button";
import { EditIcon, GlobeIcon, InfoIcon, OpenInNewIcon } from "@/components/icons";

interface SiteDetailCardProps {
  site: Site;
  /** Total de vínculos; `null` quando a listagem falhou (mostra "—"). */
  linkedCount: number | null;
  children: ReactNode;
}

/**
 * Card de detalhe do site: cabeçalho com ações, aviso sobre onde os vínculos
 * são gerenciados, grade de dados cadastrais e o slot das obras vinculadas.
 */
export function SiteDetailCard({
  site,
  linkedCount,
  children,
}: SiteDetailCardProps) {
  const lastUpdate = formatRelativeTime(site.updatedAt) ?? formatDate(site.updatedAt);

  return (
    <section className="w-full max-w-4xl mx-auto bg-surface-container-low rounded-xl border border-outline-variant p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl">
      <div
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 border-b border-outline-variant">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
            <GlobeIcon className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-headline-sm sm:text-headline-lg tracking-tight truncate">
                {site.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-caption font-bold uppercase tracking-wider ${
                  site.isActive
                    ? "bg-secondary/10 text-secondary"
                    : "bg-surface-container-highest text-outline"
                }`}
              >
                {site.isActive ? "Site Ativo" : "Site Inativo"}
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-xl">
              Fonte de leitura cadastrada para os vínculos das obras do seu
              acervo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
          <a
            href={site.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <span>Visitar Domínio</span>
            <OpenInNewIcon className="w-4 h-4" />
          </a>
          <Link
            href={`/sites/${site.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-bright text-on-surface hover:text-primary text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <EditIcon className="w-4 h-4" />
            <span>Editar</span>
          </Link>
          <DeleteSiteButton siteId={site.id} siteName={site.name} />
        </div>
      </header>

      <div className="flex items-start gap-3.5 p-4 rounded-lg bg-surface-container">
        <InfoIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-body-md text-on-surface-variant">
          Os vínculos deste site com as obras são gerenciados na página de cada
          quadrinho, na seção{" "}
          <span className="text-on-surface font-medium">
            Onde Ler / Fontes Vinculadas
          </span>
          .
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-container">
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            Nome do Site
          </dt>
          <dd className="text-body-md text-on-surface font-semibold truncate">
            {site.name}
          </dd>
        </div>
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            URL Base do Domínio
          </dt>
          <dd className="min-w-0">
            <a
              href={site.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body-md text-primary font-semibold hover:underline truncate max-w-full rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <span className="truncate">{site.baseUrl}</span>
              <OpenInNewIcon className="w-3.5 h-3.5 shrink-0" />
            </a>
          </dd>
        </div>
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            Status do Site
          </dt>
          <dd>
            <span
              className={`inline-flex items-center gap-1.5 text-body-md font-semibold ${
                site.isActive ? "text-secondary" : "text-on-surface-variant"
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${
                  site.isActive ? "bg-secondary" : "bg-outline"
                }`}
              />
              {site.isActive ? "Ativo" : "Inativo"}
            </span>
          </dd>
        </div>
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            Data de Cadastro
          </dt>
          <dd className="text-body-md text-on-surface font-semibold">
            {formatDate(site.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            Última Alteração
          </dt>
          <dd className="text-body-md text-on-surface font-semibold capitalize">
            {lastUpdate}
          </dd>
        </div>
        <div>
          <dt className="block text-caption text-outline uppercase tracking-wider">
            Quadrinhos Vinculados
          </dt>
          <dd className="text-body-md text-on-surface font-semibold">
            {linkedCount === null
              ? "—"
              : `${linkedCount} ${linkedCount === 1 ? "obra vinculada" : "obras vinculadas"}`}
          </dd>
        </div>
      </dl>

      {children}

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant">
        <p className="text-body-sm text-outline max-w-md sm:text-left text-center">
          A exclusão deste site remove os vínculos diretos associados e
          desassocia o progresso de leitura dos quadrinhos afetados.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sites"
            className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Voltar para Sites
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-label-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Gerenciar Obras no Acervo
          </Link>
        </div>
      </footer>
    </section>
  );
}
