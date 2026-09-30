"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  COMIC_STATUS_ORDER,
  COMIC_TYPE_ORDER,
} from "@/components/dashboard/status-display";
import {
  errorMessage,
  requiredString,
  type FormActionState,
} from "@/lib/form-action";
import {
  createComic,
  updateComic,
  type ComicWritePayload,
} from "@/services/comics.service";
import type { ComicStatus, ComicType } from "@/types/comic";

function isComicType(value: string): value is ComicType {
  return COMIC_TYPE_ORDER.some((option) => option === value);
}

function isComicStatus(value: string): value is ComicStatus {
  return COMIC_STATUS_ORDER.some((option) => option === value);
}

type ComicFormParse =
  | { ok: true; payload: ComicWritePayload }
  | { ok: false; message: string };

/**
 * Monta o payload de escrita a partir do formulário.
 * A API também valida (400) — aqui garantimos mensagens amigáveis em pt-BR
 * antes de gastar uma chamada.
 */
function parseComicForm(formData: FormData): ComicFormParse {
  const title = requiredString(formData, "title");
  if (!title) {
    return { ok: false, message: "Informe o título da obra." };
  }

  const type = requiredString(formData, "type");
  if (!isComicType(type)) {
    return { ok: false, message: "Selecione o tipo da obra." };
  }

  const status = requiredString(formData, "status");
  if (!isComicStatus(status)) {
    return { ok: false, message: "Selecione o status de publicação." };
  }

  const alternativeTitles = requiredString(formData, "alternativeTitles")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const coverUrl = requiredString(formData, "coverUrl");

  return {
    ok: true,
    payload: {
      title,
      type,
      status,
      alternativeTitles,
      coverUrl: coverUrl.length > 0 ? coverUrl : null,
    },
  };
}

/** Cria o quadrinho e redireciona para o detalhe do registro criado. */
export async function createComicAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = parseComicForm(formData);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  let createdId = "";
  try {
    const comic = await createComic(parsed.payload);
    createdId = comic.id;
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/");
  redirect(`/comics/${createdId}`);
}

/** Atualiza os dados cadastrais e redireciona para o detalhe. */
export async function updateComicAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const comicId = requiredString(formData, "comicId");
  if (!comicId) {
    return { ok: false, message: "Identificador do quadrinho ausente." };
  }

  const parsed = parseComicForm(formData);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await updateComic(comicId, parsed.payload);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/comics/[id]", "page");
  redirect(`/comics/${comicId}`);
}
