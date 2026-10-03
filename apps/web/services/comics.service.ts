import type { Comic, ComicStatus, ComicType } from "@/types/comic";
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

/** Dados de escrita de um quadrinho (criação e edição). */
export interface ComicWritePayload {
  title: string;
  type: ComicType;
  status: ComicStatus;
  alternativeTitles: string[];
  /** `null` limpa a capa; string vazia também vira `null`. */
  coverUrl: string | null;
  /** Avaliação pessoal de 1 a 5; `null` = sem avaliação. */
  rating: number | null;
}

/** Cria um quadrinho via `POST /comics`. */
export function createComic(payload: ComicWritePayload): Promise<Comic> {
  return apiFetch<Comic>("/comics", { method: "POST", json: payload });
}

/** Atualiza os dados cadastrais via `PATCH /comics/:id`. */
export function updateComic(
  id: string,
  payload: ComicWritePayload,
): Promise<Comic> {
  return apiFetch<Comic>(`/comics/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: payload,
  });
}

/**
 * Grava apenas a avaliação pessoal via `PATCH /comics/:id`.
 * Usado pelo registro de progresso, que salva nota e capítulo juntos.
 */
export function updateComicRating(
  id: string,
  rating: number | null,
): Promise<Comic> {
  return apiFetch<Comic>(`/comics/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: { rating },
  });
}
