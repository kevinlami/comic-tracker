// Somente no servidor (Server Components e Server Actions).
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

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiFetchOptions {
  method?: HttpMethod;
  /** Corpo JSON; quando ausente, a requisição não envia corpo. */
  json?: unknown;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "message" in body) {
      const message = (body as { message: unknown }).message;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  } catch {
    // corpo não-JSON — usa a mensagem genérica abaixo
  }
  if (response.status === 404) {
    return "Registro não encontrado.";
  }
  return `A API retornou o erro ${response.status}.`;
}

/**
 * Cliente HTTP da API: `fetch` simples com erros tipados (`ApiError`).
 * Erros de rede viram `ApiError(0, ...)`; respostas não-2xx viram
 * `ApiError(status, mensagem da API)`.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", json } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, API_URL), {
      method,
      headers,
      cache: "no-store",
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Não foi possível conectar à API. Verifique se o servidor está em execução.",
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
