import type { Site } from "@/types/comic";
import { apiFetch } from "./api-client";

/** Lista os sites cadastrados via `GET /sites`. */
export function fetchSites(): Promise<Site[]> {
  return apiFetch<Site[]>("/sites");
}

/** Busca um site pelo id via `GET /sites/:id`. Lança `ApiError(404)`. */
export function fetchSite(id: string): Promise<Site> {
  return apiFetch<Site>(`/sites/${encodeURIComponent(id)}`);
}

/** Dados de escrita de um site (criação e edição). */
export interface SiteWritePayload {
  name: string;
  baseUrl: string;
  isActive: boolean;
}

/** Cria um site via `POST /sites`. */
export function createSite(payload: SiteWritePayload): Promise<Site> {
  return apiFetch<Site>("/sites", { method: "POST", json: payload });
}

/** Atualiza um site via `PATCH /sites/:id`. */
export function updateSite(
  id: string,
  payload: SiteWritePayload,
): Promise<Site> {
  return apiFetch<Site>(`/sites/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: payload,
  });
}

/** Remove um site via `DELETE /sites/:id` (cascata: vínculos de leitura). */
export function deleteSite(id: string): Promise<void> {
  return apiFetch<void>(`/sites/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
