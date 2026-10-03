"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import type { Comic, ReadingStatus } from "@/types/comic";
import {
  saveProgressAction,
  type FormActionState,
} from "@/app/comics/[id]/actions";
import { READING_STATUS_LABEL } from "@/components/dashboard/status-display";
import { RatingField } from "@/components/rating/rating-field";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CloudOffIcon,
  LinkIcon,
  RefreshIcon,
  SaveIcon,
} from "@/components/icons";

const READING_STATUS_ORDER: ReadingStatus[] = [
  "READING",
  "PLAN_TO_READ",
  "PAUSED",
  "COMPLETED",
  "DROPPED",
];

const SELECT_CLASS =
  "appearance-none w-full bg-surface-container rounded px-3 py-2 pr-9 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

/**
 * Último capítulo lido no vínculo informado — a URL do capítulo pertence ao
 * site, não ao progresso.
 */
function savedChapterUrl(comic: Comic, siteId: string): string {
  if (!siteId) {
    return "";
  }
  const link = comic.sites.find((item) => item.id === siteId);
  return link?.currentChapterUrl ?? "";
}

/**
 * Registro atômico da última leitura (`PUT /reading-progress/:comicId`).
 * Os valores iniciais vão em hidden inputs: campos que não mudaram são
 * omitidos na action, preservando `lastReadAt`.
 *
 * Ao trocar o site provedor, o campo de URL assume a última URL lida naquele
 * vínculo — é ela que será salva e a que o acervo vai abrir.
 */
export function ProgressForm({ comic }: { comic: Comic }) {
  const progress = comic.readingProgress;
  const initialChapter = progress?.currentChapterNumber ?? "";
  const initialSiteId = progress?.comicSiteId ?? "";
  const initialStatus = progress?.status ?? "READING";

  const [chapter, setChapter] = useState(initialChapter);
  const [siteId, setSiteId] = useState(initialSiteId);
  const [url, setUrl] = useState(() => savedChapterUrl(comic, initialSiteId));
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(saveProgressAction, null);

  const initialUrl = savedChapterUrl(comic, siteId);

  function handleSiteChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSiteId = event.target.value;
    setSiteId(nextSiteId);
    setUrl(savedChapterUrl(comic, nextSiteId));
  }

  function adjustChapter(delta: number) {
    setChapter((current) => {
      const next = Math.max(
        0,
        Math.round(((parseFloat(current) || 0) + delta) * 1000) / 1000,
      );
      return String(next);
    });
  }

  return (
    <>
      {state ? (
        <div
          role="status"
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

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="comicId" value={comic.id} />
        <input
          type="hidden"
          name="initialChapterNumber"
          value={initialChapter}
        />
        <input type="hidden" name="initialChapterUrl" value={initialUrl} />
        <input type="hidden" name="initialComicSiteId" value={initialSiteId} />
        <input
          type="hidden"
          name="initialRating"
          value={comic.rating ?? ""}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="chapter"
              className="block text-label-sm text-on-surface-variant"
            >
              Capítulo Atual (decimal)
            </label>
            <div className="relative flex items-center">
              <input
                id="chapter"
                name="currentChapterNumber"
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                required
                value={chapter}
                onChange={(event) => setChapter(event.target.value)}
                className="w-full bg-surface-container rounded px-3 py-2 pr-14 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Diminuir meio capítulo"
                  onClick={() => adjustChapter(-0.5)}
                  className="w-6 h-6 rounded-sm bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface text-caption font-bold"
                >
                  -
                </button>
                <button
                  type="button"
                  aria-label="Aumentar meio capítulo"
                  onClick={() => adjustChapter(0.5)}
                  className="w-6 h-6 rounded-sm bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface text-caption font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reading-status"
              className="block text-label-sm text-on-surface-variant"
            >
              Status de Leitura
            </label>
            <div className="relative">
              <select
                id="reading-status"
                name="status"
                defaultValue={initialStatus}
                className={SELECT_CLASS}
              >
                {READING_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {READING_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="provider-site"
              className="block text-label-sm text-on-surface-variant"
            >
              Site Provedor
            </label>
            <div className="relative">
              <select
                id="provider-site"
                name="comicSiteId"
                value={siteId}
                onChange={handleSiteChange}
                className={SELECT_CLASS}
              >
                <option value="">Nenhum</option>
                {comic.sites.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.site.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
            </div>
          </div>
        </div>

        <RatingField
          name="rating"
          initialRating={comic.rating}
          label="Avaliação / Nota (1 a 5 estrelas)"
          hint="Sua classificação pessoal deste quadrinho no acervo."
        />

        <div className="space-y-1.5">
          <label
            htmlFor="chapter-url"
            className="block text-label-sm text-on-surface-variant"
          >
            URL do Capítulo Lido Neste Site
          </label>
          <div className="relative flex items-center">
            <LinkIcon className="absolute left-3 w-[18px] h-[18px] text-outline" />
            <input
              id="chapter-url"
              name="currentChapterUrl"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={!siteId}
              aria-describedby="chapter-url-hint"
              placeholder="https://..."
              className="w-full bg-surface-container rounded pl-9 pr-3 py-2 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:cursor-not-allowed disabled:text-outline"
            />
          </div>
          <p id="chapter-url-hint" className="text-caption text-outline">
            {siteId
              ? "É a URL que o acervo abre em \"Continuar lendo\"."
              : "Selecione um site provedor para informar a URL."}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-fixed transition-colors shadow-md disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {pending ? (
              <RefreshIcon className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <SaveIcon className="w-[18px] h-[18px]" />
            )}
            <span>{pending ? "Salvando..." : "Salvar Progresso"}</span>
          </button>
        </div>
      </form>
    </>
  );
}
