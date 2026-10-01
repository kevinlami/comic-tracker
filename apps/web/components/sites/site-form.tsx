"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  CloudOffIcon,
  InfoIcon,
  LinkIcon,
  OpenInNewIcon,
  RefreshIcon,
} from "@/components/icons";
import type { FormActionState } from "@/lib/form-action";
import type { Site } from "@/types/comic";

/** Assinatura das server actions de criação/edição de site. */
type SiteFormAction = (
  state: FormActionState | null,
  formData: FormData,
) => Promise<FormActionState>;

interface SiteFormProps {
  action: SiteFormAction;
  /** Valores iniciais no modo edição; `undefined` no modo criação. */
  initial?: Site;
}

const NAME_MAX_LENGTH = 50;

const INPUT_CLASS =
  "w-full bg-surface-container rounded px-3 py-2 text-on-surface text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

/**
 * Formulário de criação/edição de site (`POST/PATCH /sites`).
 * Erros da action aparecem em banner; o sucesso faz `redirect` para a
 * listagem (realizado na server action). Prévia reativa de nome, domínio
 * e status conforme o mockup da tela de sites.
 */
export function SiteForm({ action, initial }: SiteFormProps) {
  const isEdit = initial !== undefined;
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(action, null);

  const [name, setName] = useState(initial?.name ?? "");
  const [baseUrl, setBaseUrl] = useState(initial?.baseUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const trimmedName = name.trim();
  const trimmedUrl = baseUrl.trim();

  return (
    <>
      {state ? (
        <div
          role={state.ok ? "status" : "alert"}
          className={`flex flex-col gap-1 p-3 rounded text-body-sm ${
            state.ok
              ? "bg-secondary/15 text-secondary"
              : "bg-error-container/30 text-error"
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            {state.ok ? (
              <CheckCircleIcon className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <CloudOffIcon className="w-[18px] h-[18px] shrink-0" />
            )}
            <span>{state.message}</span>
          </span>
        </div>
      ) : null}

      <form action={formAction} className="flex flex-col gap-6">
        {isEdit ? (
          <input type="hidden" name="siteId" value={initial.id} />
        ) : null}

        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-high/60 text-on-surface-variant">
          <InfoIcon className="w-5 h-5 text-primary shrink-0" />
          <p className="text-body-sm leading-relaxed">
            Todos os campos com asterisco (
            <span className="text-primary font-medium">*</span>) são de
            preenchimento obrigatório e serão validados em conformidade com as
            regras do catálogo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="site-name"
                className="flex items-center gap-1 text-label-md text-on-surface"
              >
                Nome do Site / Scan <span className="text-primary">*</span>
              </label>
              <span className="text-caption text-on-surface-variant">
                {name.length}/{NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="site-name"
              name="name"
              type="text"
              required
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: AsuraScans, MangaPlus by SHUEISHA, Webtoons"
              className={INPUT_CLASS}
            />
            <p className="text-caption text-on-surface-variant">
              Nome canônico que aparecerá nos seletores de vínculos e no botão{" "}
              <strong className="text-on-surface font-medium">
                Continuar Lendo
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="site-url"
              className="flex items-center gap-1 text-label-md text-on-surface"
            >
              URL Base do Domínio <span className="text-primary">*</span>
            </label>
            <div className="relative flex items-center">
              <LinkIcon className="w-[18px] h-[18px] absolute left-3 text-outline pointer-events-none" />
              <input
                id="site-url"
                name="baseUrl"
                type="url"
                required
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://asuracomic.net"
                className={`${INPUT_CLASS} pl-10`}
              />
            </div>
            <p className="text-caption text-on-surface-variant">
              Domínio oficial sem barras extras ao final (ex:{" "}
              <code className="text-primary font-mono text-caption">
                https://dominio.com
              </code>
              ).
            </p>
          </div>

          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface-container/60">
            <div className="flex flex-col gap-1 min-w-0">
              <label
                htmlFor="site-status"
                className="text-title-md text-on-surface cursor-pointer select-none"
              >
                Site Ativo para Sincronização
              </label>
              <p className="text-body-sm text-on-surface-variant">
                Sites inativos permanecem cadastrados para histórico e
                consultas, sem entrar em novos vínculos de leitura.
              </p>
            </div>
            <label
              htmlFor="site-status"
              className="relative inline-flex items-center cursor-pointer shrink-0 mt-1"
            >
              <input
                id="site-status"
                name="isActive"
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              <span className="w-11 h-6 rounded-full bg-surface-container-highest peer-checked:bg-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {/* Prévia de como o site aparece no catálogo. */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant">
          <div className="flex items-center justify-between">
            <span className="text-caption uppercase tracking-wider text-outline font-semibold">
              Prévia no Leitor e Catálogo
            </span>
            <span
              className={`flex items-center gap-1.5 text-caption font-semibold ${
                isActive ? "text-secondary" : "text-outline"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isActive ? "bg-secondary" : "bg-outline"
                }`}
              />
              {isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container text-headline-sm flex items-center justify-center shrink-0 uppercase">
                {trimmedName ? trimmedName.charAt(0).toUpperCase() : "—"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-title-md text-on-surface truncate">
                  {trimmedName || "Nome do Site"}
                </span>
                <span className="text-caption text-on-surface-variant truncate">
                  {trimmedUrl || "https://exemplo.com"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded bg-surface-container-high text-primary text-label-sm flex items-center gap-1.5 shadow-sm">
                <span>Continuar Lendo</span>
                <OpenInNewIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <Link
            href="/sites"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary text-title-md shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {pending ? (
              <RefreshIcon className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircleIcon className="w-5 h-5" />
            )}
            <span>
              {pending
                ? "Sincronizando..."
                : isEdit
                  ? "Salvar Alterações"
                  : "Cadastrar Site"}
            </span>
          </button>
        </div>
      </form>

      <p className="pt-2 text-caption text-outline text-center sm:text-left">
        Ao cadastrar um site, ele ficará disponível imediatamente para
        vínculos de links rápidos na página de detalhes de cada quadrinho (
        <code className="text-on-surface-variant font-mono text-caption">
          /comics/[id]
        </code>
        ).
      </p>
    </>
  );
}
