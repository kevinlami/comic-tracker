"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { Site } from "@/types/comic";
import {
  addComicSiteAction,
  type FormActionState,
} from "@/app/comics/[id]/actions";
import {
  AddIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloudOffIcon,
} from "@/components/icons";

interface AddLinkSectionProps extends PropsWithChildren {
  comicId: string;
  sites: Site[];
}

const SELECT_CLASS =
  "appearance-none w-full bg-surface-container-high rounded px-3 py-2 pr-9 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

/**
 * Cabeçalho da seção de fontes + botão de toggle + painel colapsável.
 * O filho (`children`) é o conteúdo à esquerda do cabeçalho.
 */
export function AddLinkSection({
  comicId,
  sites,
  children,
}: AddLinkSectionProps) {
  const [open, setOpen] = useState(false);
  const closePanel = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {children}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <AddIcon className="w-[18px] h-[18px]" />
          <span>{open ? "Fechar" : "+ Adicionar Novo Vínculo"}</span>
        </button>
      </div>

      {open ? (
        sites.length === 0 ? (
          <div className="p-5 rounded-lg bg-surface-container">
            <p className="text-body-sm text-on-surface-variant">
              Nenhum site cadastrado ainda — cadastre um site antes de criar
              vínculos de leitura.
            </p>
          </div>
        ) : (
          <AddLinkForm
            comicId={comicId}
            sites={sites}
            onClose={closePanel}
          />
        )
      ) : null}
    </>
  );
}

function AddLinkForm({
  comicId,
  sites,
  onClose,
}: {
  comicId: string;
  sites: Site[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(addComicSiteAction, null);

  useEffect(() => {
    if (state?.ok) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="p-5 rounded-lg bg-surface-container space-y-4">
      <input type="hidden" name="comicId" value={comicId} />

      <h3 className="text-body-md text-on-surface flex items-center gap-2 font-semibold">
        <AddIcon className="w-[18px] h-[18px] text-primary" />
        Cadastrar Novo Provedor de Leitura
      </h3>

      {state && !state.ok ? (
        <div
          role="alert"
          className="p-3 rounded bg-error-container/30 text-error text-body-sm flex items-start gap-2"
        >
          <CloudOffIcon className="w-[18px] h-[18px] shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label
            htmlFor="link-site"
            className="block text-label-sm text-on-surface-variant"
          >
            Site / Scan
          </label>
          <div className="relative">
            <select
              id="link-site"
              name="siteId"
              required
              defaultValue=""
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                Selecione
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-[18px] h-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" />
          </div>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label
            htmlFor="link-url"
            className="block text-label-sm text-on-surface-variant"
          >
            URL Direta da Obra
          </label>
          <input
            id="link-url"
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="w-full bg-surface-container-high rounded px-3 py-2 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-sm text-on-surface-variant hover:text-on-surface text-label-md transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-fixed transition-colors disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {state?.ok ? (
            <CheckCircleIcon className="w-[18px] h-[18px]" />
          ) : null}
          <span>{pending ? "Salvando..." : "Salvar Vínculo"}</span>
        </button>
      </div>
    </form>
  );
}
