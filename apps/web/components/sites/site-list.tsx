import type { Site } from "@/types/comic";
import { DeleteSiteButton } from "./delete-site-button";
import { EditIcon, GlobeIcon, OpenInNewIcon } from "@/components/icons";
import Link from "next/link";

/** Lista os sites cadastrados em linhas com edição e exclusão. */
export function SiteList({ sites }: { sites: Site[] }) {
  return (
    <ul className="space-y-3">
      {sites.map((site) => (
        <li
          key={site.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container text-headline-sm flex items-center justify-center shrink-0 uppercase">
              {site.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/sites/${site.id}`}
                  className="text-body-lg text-on-surface font-semibold truncate hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {site.name}
                </Link>
                <span
                  className={`px-2 py-0.5 rounded text-caption font-bold uppercase tracking-wider ${
                    site.isActive
                      ? "bg-secondary/10 text-secondary"
                      : "bg-surface-container-highest text-outline"
                  }`}
                >
                  {site.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
              <a
                href={site.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-body-sm text-outline hover:text-primary transition-colors truncate max-w-md sm:max-w-xl rounded focus-visible:outline-2 focus-visible:outline-primary"
              >
                <GlobeIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{site.baseUrl}</span>
                <OpenInNewIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link
              href={`/sites/${site.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-bright text-on-surface hover:text-primary text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <EditIcon className="w-4 h-4" />
              <span>Editar</span>
            </Link>
            <DeleteSiteButton siteId={site.id} siteName={site.name} />
          </div>
        </li>
      ))}
    </ul>
  );
}
