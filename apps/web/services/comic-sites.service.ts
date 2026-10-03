import type { ComicSiteLink, SiteComicLink } from "@/types/comic";
import { apiFetch } from "./api-client";

export interface CreateComicSitePayload {
  comicId: string;
  siteId: string;
  url: string;
}

/** Vincula um site a um quadrinho via `POST /comic-sites` (409 se duplicado). */
export function createComicSite(
  payload: CreateComicSitePayload,
): Promise<ComicSiteLink> {
  return apiFetch<ComicSiteLink>("/comic-sites", {
    method: "POST",
    json: payload,
  });
}

/** Vínculos de um site (com os quadrinhos aninhados) via `GET /comic-sites?siteId=`. */
export function fetchComicSitesBySite(siteId: string): Promise<SiteComicLink[]> {
  const query = new URLSearchParams({ siteId });
  return apiFetch<SiteComicLink[]>(`/comic-sites?${query.toString()}`);
}

/** Remove um vínculo site↔quadrinho via `DELETE /comic-sites/:id`. */
export function deleteComicSite(id: string): Promise<void> {
  return apiFetch<void>(`/comic-sites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
