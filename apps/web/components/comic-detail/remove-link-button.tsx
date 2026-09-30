"use client";

import { useState, useTransition } from "react";
import { removeComicSiteAction } from "@/app/comics/[id]/actions";
import { TrashIcon } from "@/components/icons";

/** Remove um vínculo site↔quadrinho; erros ficam visíveis ao lado do botão. */
export function RemoveLinkButton({ linkId }: { linkId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const failure = await removeComicSiteAction(linkId);
      if (failure) {
        setError(failure.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        title="Remover Vínculo"
        aria-label="Remover vínculo"
        onClick={handleRemove}
        className="p-2 rounded-sm hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <TrashIcon className="w-[18px] h-[18px]" />
      </button>
      {error ? (
        <span role="alert" className="text-caption text-error text-right">
          {error}
        </span>
      ) : null}
    </div>
  );
}
