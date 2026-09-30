import type { Comic } from "@/types/comic";
import { apiFetch } from "./api-client";

export interface ListComicsParams {
  search?: string;
  status?: string;
  order?: string;
}

/**
 * Busca os quadrinhos com filtros opcionais (título, status de leitura,
 * ordenação) via `GET /comics`.
 */
export async function fetchComics(
  params: ListComicsParams = {},
): Promise<Comic[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return apiFetch<Comic[]>(`/comics${queryString ? `?${queryString}` : ""}`);
}

/** Busca um quadrinho pelo id via `GET /comics/:id`. Lança `ApiError(404)`. */
export function fetchComic(id: string): Promise<Comic> {
  return apiFetch<Comic>(`/comics/${encodeURIComponent(id)}`);
}

/** Remove um quadrinho via `DELETE /comics/:id` (cascata: progresso e vínculos). */
export function deleteComic(id: string): Promise<void> {
  return apiFetch<void>(`/comics/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
