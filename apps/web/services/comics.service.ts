import type { Comic } from "@/types/comic";

// Somente no servidor (Server Components) — lê API_URL do ambiente.
const API_URL = process.env.API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
  const url = new URL("/comics", API_URL);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.order) url.searchParams.set("order", params.order);

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ApiError(
      0,
      "Não foi possível conectar à API. Verifique se o servidor está em execução.",
    );
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError(400, "Um dos filtros enviados não é válido.");
    }
    throw new ApiError(
      response.status,
      "A API retornou um erro ao carregar os quadrinhos.",
    );
  }

  return (await response.json()) as Comic[];
}
