import { ApiError } from "@/services/api-client";

/** Resultado padrão das ações com formulário (`useActionState`). */
export interface FormActionState {
  ok: boolean;
  message: string;
}

/** Converte uma falha em mensagem amigável para exibição no formulário. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Erro inesperado. Tente novamente.";
}

/** Lê um campo de texto do `FormData` já recortado (`""` quando ausente). */
export function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
