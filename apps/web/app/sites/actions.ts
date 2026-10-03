"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  errorMessage,
  requiredString,
  type FormActionState,
} from "@/lib/form-action";
import {
  createSite,
  deleteSite,
  updateSite,
  type SiteWritePayload,
} from "@/services/sites.service";
import { ApiError } from "@/services/api-client";

export type { FormActionState };

/**
 * Converte falha de escrita em mensagem amigável. O 409 (nome duplicado)
 * vem em inglês da API, então é traduzido aqui.
 */
function siteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "Já existe um site cadastrado com este nome.";
  }
  return errorMessage(error);
}

type SiteFormParse =
  | { ok: true; payload: SiteWritePayload }
  | { ok: false; message: string };

/**
 * Monta o payload de escrita a partir do formulário.
 * A API também valida (400) — aqui garantimos mensagens amigáveis em pt-BR
 * antes de gastar uma chamada.
 */
function parseSiteForm(formData: FormData): SiteFormParse {
  const name = requiredString(formData, "name");
  if (!name) {
    return { ok: false, message: "Informe o nome do site." };
  }

  const baseUrl = requiredString(formData, "baseUrl");
  if (!baseUrl) {
    return { ok: false, message: "Informe a URL base do domínio." };
  }

  return {
    ok: true,
    payload: {
      name,
      baseUrl,
      isActive: formData.get("isActive") === "on",
    },
  };
}

/** Revalida as telas que exibem os dados do site (lista, detalhe e vínculos). */
function revalidateSitePages() {
  revalidatePath("/sites");
  revalidatePath("/sites/[id]", "page");
  revalidatePath("/comics/[id]", "page");
}

/** Cria o site e volta para a listagem. */
export async function createSiteAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = parseSiteForm(formData);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await createSite(parsed.payload);
  } catch (error) {
    return { ok: false, message: siteErrorMessage(error) };
  }

  revalidateSitePages();
  redirect("/sites");
}

/** Atualiza o site e volta para a listagem. */
export async function updateSiteAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const siteId = requiredString(formData, "siteId");
  if (!siteId) {
    return { ok: false, message: "Identificador do site ausente." };
  }

  const parsed = parseSiteForm(formData);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await updateSite(siteId, parsed.payload);
  } catch (error) {
    return { ok: false, message: siteErrorMessage(error) };
  }

  revalidateSitePages();
  redirect("/sites");
}

/**
 * Exclui o site (cascata: vínculos de leitura e desassociação do progresso)
 * e volta para a listagem. A confirmação em duas etapas é do componente —
 * aqui entra apenas no segundo clique (padrão `delete-comic-button`).
 */
export async function deleteSiteAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const siteId = requiredString(formData, "siteId");
  if (!siteId) {
    return { ok: false, message: "Identificador do site ausente." };
  }

  try {
    await deleteSite(siteId);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidateSitePages();
  redirect("/sites");
}
