"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ComicCover } from "@/components/dashboard/comic-cover";
import {
  COMIC_STATUS_LABEL,
  COMIC_STATUS_ORDER,
  COMIC_TYPE_LABEL,
  COMIC_TYPE_ORDER,
} from "@/components/dashboard/status-display";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CloudOffIcon,
  InfoIcon,
  OpenInNewIcon,
  RefreshIcon,
  SaveIcon,
} from "@/components/icons";
import type { FormActionState } from "@/lib/form-action";
import { RatingField } from "@/components/rating/rating-field";
import type { Comic, ComicStatus, ComicType } from "@/types/comic";

/** Assinatura das server actions de criação/edição de quadrinho. */
type ComicFormAction = (
  state: FormActionState | null,
  formData: FormData,
) => Promise<FormActionState>;

interface ComicFormProps {
  action: ComicFormAction;
  /** Valores iniciais no modo edição; `undefined` no modo criação. */
  initial?: Comic;
}

const INPUT_CLASS =
  "w-full bg-surface-container rounded px-3 py-2 text-on-surface text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

const SELECT_CLASS =
  "appearance-none w-full bg-surface-container rounded px-3 py-2 pr-9 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer";

const COVER_ACTION_CLASS =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-surface-container-high hover:bg-surface-bright border border-outline-variant text-on-surface-variant hover:text-on-surface text-label-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Formulário de criação/edição de dados cadastrais do quadrinho
 * (`POST/PATCH /comics`). Erros da action aparecem em banner; o sucesso
 * faz `redirect` para o detalhe (realizado na server action).
 */
export function ComicForm({ action, initial }: ComicFormProps) {
  const isEdit = initial !== undefined;
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(action, null);

  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  // Chave do preview: incrementar força o remount da <img> (reload da capa).
  const [coverKey, setCoverKey] = useState(0);

  const previewCover = coverUrl.trim().length > 0 ? coverUrl.trim() : null;

  return (
    <>
      {state ? (
        <div
          role={state.ok ? "status" : "alert"}
          className={`p-3 rounded flex items-start justify-between gap-3 text-body-sm ${
            state.ok
              ? "bg-secondary/15 text-secondary"
              : "bg-error-container/30 text-error"
          }`}
        >
          <span className="flex items-center gap-2">
            {state.ok ? (
              <CheckCircleIcon className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <CloudOffIcon className="w-[18px] h-[18px] shrink-0" />
            )}
            <span>{state.message}</span>
          </span>
        </div>
      ) : null}

      <form action={formAction} className="space-y-6">
        {isEdit ? (
          <input type="hidden" name="comicId" value={initial.id} />
        ) : null}

        <div className="p-3 rounded bg-surface-container border border-outline-variant flex items-start gap-2 text-body-sm text-on-surface-variant">
          <InfoIcon className="w-[18px] h-[18px] shrink-0 mt-0.5 text-primary" />
          <span>
            Campos marcados com{" "}
            <strong className="text-error font-semibold">*</strong> são de
            preenchimento obrigatório.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 space-y-1.5">
            <label
              htmlFor="comic-title"
              className="block text-label-sm text-on-surface-variant"
            >
              Título da Obra <span className="text-error">*</span>
            </label>
            <input
              id="comic-title"
              name="title"
              type="text"
              required
              defaultValue={initial?.title ?? ""}
              placeholder="Ex: Solo Leveling"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="comic-type"
              className="block text-label-sm text-on-surface-variant"
            >
              Tipo da Obra <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                id="comic-type"
                name="type"
                required
                defaultValue={initial?.type ?? "MANGA"}
                className={SELECT_CLASS}
              >
                {COMIC_TYPE_ORDER.map((type: ComicType) => (
                  <option key={type} value={type}>
                    {COMIC_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label
              htmlFor="comic-alternative-titles"
              className="flex items-center justify-between gap-2 text-label-sm text-on-surface-variant"
            >
              <span>Títulos Alternativos</span>
              <span className="text-caption font-normal">Um por linha</span>
            </label>
            <textarea
              id="comic-alternative-titles"
              name="alternativeTitles"
              rows={3}
              defaultValue={initial?.alternativeTitles.join("\n") ?? ""}
              placeholder={"Insira variantes e traduções alternativas..."}
              className={`${INPUT_CLASS} resize-y`}
            />
            <p className="text-caption text-on-surface-variant">
              Usados para busca e unificação de referências da obra.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="comic-status"
              className="block text-label-sm text-on-surface-variant"
            >
              Status da Publicação <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                id="comic-status"
                name="status"
                required
                defaultValue={initial?.status ?? "UNKNOWN"}
                className={SELECT_CLASS}
              >
                {COMIC_STATUS_ORDER.map((status: ComicStatus) => (
                  <option key={status} value={status}>
                    {COMIC_STATUS_LABEL[status] ?? "Desconhecido"}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded bg-surface-container border border-outline-variant">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-8 space-y-1.5">
              <label
                htmlFor="comic-cover"
                className="block text-label-sm text-on-surface-variant"
              >
                URL da Imagem de Capa
              </label>
              <input
                id="comic-cover"
                name="coverUrl"
                type="url"
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://exemplo.com/capa.jpg"
                className={INPUT_CLASS}
              />
              <p className="text-caption text-on-surface-variant">
                URL direta para imagem PNG ou JPG. Proporção vertical
                recomendada: <span className="text-on-surface">2:3</span>.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={!previewCover}
                  onClick={() => setCoverKey((key) => key + 1)}
                  className={COVER_ACTION_CLASS}
                >
                  <RefreshIcon className="w-[14px] h-[14px]" />
                  Recarregar imagem
                </button>
                {previewCover ? (
                  <a
                    href={previewCover}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={COVER_ACTION_CLASS}
                  >
                    <OpenInNewIcon className="w-[14px] h-[14px]" />
                    Testar link externo
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={COVER_ACTION_CLASS}
                  >
                    <OpenInNewIcon className="w-[14px] h-[14px]" />
                    Testar link externo
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center gap-2">
              <div className="w-[130px] aspect-[2/3] rounded-lg overflow-hidden border border-outline-variant bg-surface-container-lowest">
                <ComicCover
                  key={coverKey}
                  coverUrl={previewCover}
                  title={initial?.title ?? "Prévia da capa"}
                />
              </div>
              <span className="text-caption text-on-surface-variant text-center">
                Visualização no catálogo
              </span>
            </div>
          </div>
        </div>

        <RatingField
          name="rating"
          initialRating={initial?.rating ?? null}
          label="Avaliação / Nota (1 a 5 estrelas)"
          hint="Sua classificação pessoal deste quadrinho no acervo."
        />

        <div className="pt-5 border-t border-outline-variant flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
          <Link
            href={isEdit ? `/comics/${initial.id}` : "/"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded border border-outline-variant hover:border-outline text-on-surface-variant hover:text-on-surface text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-primary hover:bg-primary-fixed text-on-primary text-label-md font-semibold shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {pending ? (
              <RefreshIcon className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <SaveIcon className="w-[18px] h-[18px]" />
            )}
            <span>
              {pending
                ? "Salvando..."
                : isEdit
                  ? "Salvar Alterações"
                  : "Criar Quadrinho"}
            </span>
          </button>
        </div>
      </form>
    </>
  );
}
