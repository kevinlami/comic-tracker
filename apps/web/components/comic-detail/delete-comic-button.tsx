"use client";

import { useActionState, useState, type MouseEvent } from "react";
import {
  deleteComicAction,
  type FormActionState,
} from "@/app/comics/[id]/actions";
import { TrashIcon } from "@/components/icons";

const CONFIRM_WINDOW_MS = 4000;

/**
 * Exclusão com confirmação em duas etapas (a janela expira em 4s),
 * implementada como formulário para que o `redirect` pós-exclusão
 * seja tratado nativamente pelo Next.
 */
export function DeleteComicButton({ comicId }: { comicId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState<
    FormActionState | null,
    FormData
  >(deleteComicAction, null);

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
      <input type="hidden" name="comicId" value={comicId} />
      <button
        type="submit"
        disabled={pending}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-label-md transition-colors disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
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
              : "Excluir Quadrinho"}
        </span>
      </button>
      {state && !state.ok ? (
        <span role="alert" className="text-caption text-error">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
