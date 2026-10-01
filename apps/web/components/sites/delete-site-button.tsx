"use client";

import { useActionState, useState, type MouseEvent } from "react";
import {
  deleteSiteAction,
  type FormActionState,
} from "@/app/sites/actions";
import { TrashIcon } from "@/components/icons";

const CONFIRM_WINDOW_MS = 4000;

/**
 * Exclusão de site com confirmação em duas etapas (a janela expira em 4s),
 * no padrão de `delete-comic-button`.
 *
 * A exclusão em cascata apaga os vínculos de leitura do site e desassocia o
 * progresso dos quadrinhos afetados — por isso o aviso em ambas as etapas.
 */
export function DeleteSiteButton({
  siteId,
  siteName,
}: {
  siteId: string;
  siteName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(deleteSiteAction, null);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!confirming) {
      event.preventDefault();
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="siteId" value={siteId} />
      <button
        type="submit"
        disabled={pending}
        onClick={handleClick}
        aria-label={`Excluir site ${siteName}`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-label-md transition-colors disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
          confirming
            ? "bg-error-container text-error animate-pulse"
            : "bg-error-container/40 hover:bg-error-container text-error"
        }`}
      >
        <TrashIcon className="w-[18px] h-[18px]" />
        <span>
          {pending
            ? "Excluindo..."
            : confirming
              ? "Confirmar Exclusão?"
              : "Excluir"}
        </span>
      </button>
      {confirming ? (
        <span className="max-w-[240px] text-caption text-error text-right leading-snug">
          Apaga os vínculos de leitura do site e desassocia o progresso dos
          quadrinhos afetados.
        </span>
      ) : null}
      {state && !state.ok ? (
        <span role="alert" className="max-w-[240px] text-caption text-error text-right">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
