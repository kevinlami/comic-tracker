"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteComic } from "@/services/comics.service";
import {
  upsertReadingProgress,
  type UpsertReadingProgressPayload,
} from "@/services/reading-progress.service";
import {
  createComicSite,
  deleteComicSite,
} from "@/services/comic-sites.service";
import {
  errorMessage,
  requiredString,
  type FormActionState,
} from "@/lib/form-action";

export type { FormActionState };

/**
 * Registra a última leitura (`PUT` atômico).
 *
 * Campos cujo valor não mudou são omitidos — assim, salvar apenas o status
 * não altera `lastReadAt` (que representa a última leitura de capítulo).
 */
export async function saveProgressAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const comicId = requiredString(formData, "comicId");
  if (!comicId) {
    return { ok: false, message: "Identificador do quadrinho ausente." };
  }

  const chapter = requiredString(formData, "currentChapterNumber");
  const url = requiredString(formData, "currentChapterUrl");
  const comicSiteId = requiredString(formData, "comicSiteId");
  const status = requiredString(formData, "status");

  const initialChapter = requiredString(formData, "initialChapterNumber");
  const initialUrl = requiredString(formData, "initialChapterUrl");
  const initialComicSiteId = requiredString(formData, "initialComicSiteId");

  const payload: UpsertReadingProgressPayload = {};
  if (status) {
    payload.status = status;
  }
  if (chapter !== initialChapter) {
    payload.currentChapterNumber = chapter.length > 0 ? chapter : null;
  }
  if (url !== initialUrl) {
    payload.currentChapterUrl = url.length > 0 ? url : null;
  }
  if (comicSiteId !== initialComicSiteId) {
    payload.comicSiteId = comicSiteId.length > 0 ? comicSiteId : null;
  }

  try {
    await upsertReadingProgress(comicId, payload);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/comics/[id]", "page");
  revalidatePath("/");
  return {
    ok: true,
    message: chapter
      ? `Capítulo ${chapter} registrado com sucesso.`
      : "Progresso atualizado com sucesso.",
  };
}

/**
 * Exclui o quadrinho (cascata: progresso e vínculos) e volta ao acervo.
 * Em caso de sucesso faz `redirect` (que não retorna valor); em caso de
 * falha devolve a mensagem para exibição no formulário.
 */
export async function deleteComicAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState | null> {
  const comicId = requiredString(formData, "comicId");
  if (!comicId) {
    return { ok: false, message: "Identificador do quadrinho ausente." };
  }

  try {
    await deleteComic(comicId);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/");
  redirect("/");
}

/** Vincula um site de leitura ao quadrinho. */
export async function addComicSiteAction(
  _prevState: FormActionState | null,
  formData: FormData,
): Promise<FormActionState> {
  const comicId = requiredString(formData, "comicId");
  const siteId = requiredString(formData, "siteId");
  const url = requiredString(formData, "url");

  if (!siteId) {
    return { ok: false, message: "Selecione um site." };
  }
  if (!url) {
    return { ok: false, message: "Informe a URL da obra neste site." };
  }

  try {
    await createComicSite({ comicId, siteId, url });
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/comics/[id]", "page");
  return { ok: true, message: "Vínculo adicionado." };
}

/** Remove um vínculo site↔quadrinho. */
export async function removeComicSiteAction(
  linkId: string,
): Promise<{ ok: false; message: string } | undefined> {
  try {
    await deleteComicSite(linkId);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }

  revalidatePath("/comics/[id]", "page");
  return undefined;
}
