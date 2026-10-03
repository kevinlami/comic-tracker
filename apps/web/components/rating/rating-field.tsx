"use client";

import { useState } from "react";
import { StarIcon, StarOutlineIcon } from "@/components/icons";

interface RatingFieldProps {
  /** Nome do hidden input enviado junto com o formulário. */
  name: string;
  /** Nota já gravada; `null` começa sem avaliação. */
  initialRating: number | null;
  label: string;
  /** Texto de ajuda abaixo do rótulo. */
  hint?: string;
}

const TOTAL_STARS = [1, 2, 3, 4, 5];

/**
 * Campo de avaliação de 1 a 5 estrelas para formulários.
 *
 * O clique só marca a nota — ela é persistida pelo botão de salvar do
 * formulário pai (o valor sai no hidden input `name`). Clicar na estrela
 * já selecionada limpa a avaliação.
 */
export function RatingField({
  name,
  initialRating,
  label,
  hint,
}: RatingFieldProps) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const preview = hovered ?? rating;
  const labelId = `${name}-label`;

  function select(value: number) {
    setRating((current) => (current === value ? null : value));
  }

  return (
    <div className="p-4 rounded bg-surface-container border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span id={labelId} className="block text-label-sm text-on-surface-variant">
          {label}
        </span>
        {hint ? (
          <p className="text-caption text-on-surface-variant">{hint}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div
          role="group"
          aria-labelledby={labelId}
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(null)}
        >
          {TOTAL_STARS.map((value) => {
            const filled = preview !== null && value <= preview;
            const isCurrent = rating === value;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                aria-pressed={isCurrent}
                onClick={() => select(value)}
                onMouseEnter={() => setHovered(value)}
                className="p-0.5 rounded text-tertiary hover:text-tertiary/70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 transition-colors"
              >
                {filled ? (
                  <StarIcon className="w-[26px] h-[26px]" />
                ) : (
                  <StarOutlineIcon className="w-[26px] h-[26px]" />
                )}
              </button>
            );
          })}
        </div>

        {rating !== null ? (
          <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-tertiary text-label-md font-bold whitespace-nowrap">
            {rating} / 5 estrelas
          </span>
        ) : null}

        <input type="hidden" name={name} value={rating ?? ""} />
      </div>
    </div>
  );
}
