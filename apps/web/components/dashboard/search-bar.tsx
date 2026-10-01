"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  /** Valor atual da busca vindo da URL (server-rendered). */
  initialSearch: string;
  /** Rota em que a busca é gravada (padrão: a raiz do acervo). */
  path?: string;
  /** Placeholder do campo. */
  placeholder?: string;
  /** Rótulo acessível do campo. */
  label?: string;
}

/**
 * Busca por título com debounce: o texto é gravado na URL (`?search=`)
 * após 300ms de inatividade, atualizando o resultado via servidor.
 */
export function SearchBar({
  initialSearch,
  path = "/",
  placeholder = "Buscar por título...",
  label = "Buscar por título",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialSearch);

  // Último valor que enviamos (ou recebemos) da URL — evita que a
  // sincronização apague o texto enquanto o usuário digita.
  const pushedRef = useRef(initialSearch);
  const firstRunRef = useRef(true);

  // Sincroniza mudanças externas na URL (ex.: "Limpar filtros").
  useEffect(() => {
    if (initialSearch !== pushedRef.current) {
      pushedRef.current = initialSearch;
      setValue(initialSearch);
    }
  }, [initialSearch]);

  // Debounce: grava o termo na URL sem recarregar a página.
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed === pushedRef.current) {
        return;
      }
      pushedRef.current = trimmed;

      const params = new URLSearchParams(window.location.search);
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      const queryString = params.toString();
      router.replace(queryString ? `${path}?${queryString}` : path, {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, router, path]);

  return (
    <div className="relative w-full lg:max-w-sm">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        aria-hidden="true"
      >
        <SearchIcon className="w-5 h-5" />
      </span>
      <label htmlFor="comic-search" className="sr-only">
        {label}
      </label>
      <input
        id="comic-search"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-xl pl-10 pr-4 py-2.5 shadow-sm transition-colors focus:outline-none focus:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-primary"
      />
    </div>
  );
}
