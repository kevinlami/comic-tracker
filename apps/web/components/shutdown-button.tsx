"use client";

import { useState } from "react";
import { shutdownProject } from "@/app/actions";

/**
 * Botão "Sair": encerra o projeto local (API, Web e PostgreSQL).
 * Pede confirmação ao usuário antes de desligar o próprio servidor.
 * O navegador permanece aberto — apenas esta aba deixa de responder.
 */
export function ShutdownButton() {
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(): Promise<void> {
    if (leaving) {
      return;
    }

    const confirmed = window.confirm(
      "Deseja realmente encerrar o Comic Tracker? API, Web e banco serão desligados. O navegador permanece aberto.",
    );
    if (!confirmed) {
      return;
    }

    setLeaving(true);
    setError(null);
    try {
      const result = await shutdownProject();
      if (!result.ok) {
        setError(result.message);
        setLeaving(false);
        return;
      }
      // Os servidores encerram ~1,5 s depois da resposta (tempo para a
      // resposta chegar ao navegador). Só então confirmamos na tela.
      window.setTimeout(() => {
        setDone(true);
        setLeaving(false);
      }, 2500);
    } catch {
      setError("Não foi possível encerrar o projeto agora.");
      setLeaving(false);
    }
  }

  const label = done ? "Encerrado" : leaving ? "Encerrando…" : "Sair";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={leaving}
        className="text-label-md text-on-surface-variant hover:text-error transition-colors rounded focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2 disabled:opacity-50"
      >
        {label}
      </button>
      {error ? (
        <span className="text-caption text-error" role="alert">
          {error}
        </span>
      ) : done ? (
        <span className="text-caption text-on-surface-variant">
          Projeto parado. Pode fechar esta aba quando quiser.
        </span>
      ) : null}
    </div>
  );
}
