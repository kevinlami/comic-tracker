"use client";

import { useState, ReactNode } from "react";

/**
 * Componente genérico de entrada numérica com botões de incremento/decremento.
 * Substitui o uso de input[type="number"] nativo para evitar setas do navegador.
 *
 * Props:
 * - value: valor atual formatado como string
 * - onChange: callback chamado quando o valor muda
 * - step: valor para increment/decrement (padrão: 1)
 * - min: valor mínimo permitido (padrão: undefined = sem limite)
 * - max: valor máximo permitido (padrão: undefined = sem limite)
 * - label: rótulo opcional acima do input
 * - showButtons: mostrar botões +/ - (padrão: true)
 * - inputMode: modo do teclado mobile (padrão: "decimal")
 * - type: "number" | "text" - usa "text" por padrão para evitar setas nativas
 * - className: classes Tailwind adicionais aplicadas ao input
 * - buttonClassName: classes adicionais nos botões ±
 * - labelClassName: classes adicionais no rótulo
 *
 * Exemplo de uso:
 * <NumericStepper
 *   value={chapter}
 *   onChange={setChapter}
 *   step={0.5}
 *   min={0}
 *   label="Capítulo Atual"
 *   inputMode="decimal"
 * />
 *
 * <NumericStepper
 *   value={price}
 *   onChange={setPrice}
 *   step={10}
 *   type="number"
 *   currency="BRL"
 * />
 */
export function NumericStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  label,
  showButtons = true,
  inputMode = "decimal",
  type = "text", // "text" por padrão para evitar setas nativas
  className,
  buttonClassName,
  labelClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  showButtons?: boolean;
  inputMode?: "decimal" | "numeric" | "tel";
  type?: "number" | "text";
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
}) {
  // Limpar e validar entrada do usuário
  const validateAndFormat = (raw: string): string => {
    // Remove caracteres que não são dígitos, ponto ou negativo
    let cleaned = raw.replace(/[^0-9.-]/g, "");

    // Evita mais de um ponto decimal
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf("."));
    }

    // Evita ponto no início ou no final sem dígitos
    if (cleaned.startsWith(".")) {
      cleaned = "0" + cleaned;
    }
    if (cleaned.endsWith(".")) {
      cleaned = cleaned.slice(0, -1);
    }

    // Parse e aplicar limites
    let number = parseFloat(cleaned) || 0;

    if (min !== undefined && number < min) {
      number = min;
    }
    if (max !== undefined && number > max) {
      number = max;
    }

    // Arredondar para o passo definido
    const rounded = Math.round(number * 1000) / 1000;
    return String(rounded);
  };

  // Ajustar valor
  const adjustValue = (delta: number) => {
    const current = parseFloat(value) || 0;
    let next = current + delta;

    // Aplicar limites
    if (min !== undefined && next < min) {
      next = min;
    }
    if (max !== undefined && next > max) {
      next = max;
    }

    onChange(String(next));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="
            block text-label-sm text-on-surface-variant
          "
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(validateAndFormat(e.target.value))}
          className="
            w-full bg-surface-container rounded px-3 py-2 pr-14 text-on-surface text-body-md
            focus:outline-none focus:ring-2 focus:ring-primary transition-colors
            appearance-none
          "
          inputMode={inputMode}
          aria-label={label || "Valor numérico"}
        />

        {/* Style para remover setas nativas dos navegadores */}
        <style>{`
          /* Esconder setas do Chrome/Edge/Safari */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
          /* Esconder setas do Firefox */
          input[type="number"] {
            -moz-appearance: none !important;
          }
          /* Garantir que o type="text" também não tenha setas */
          input[type="text"] {
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
          input[type="text"]::-webkit-outer-spin-button,
          input[type="text"]::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
        `}</style>

        {showButtons && (
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              aria-label="Diminuir valor"
              onClick={() => adjustValue(-step)}
              className="
                w-6 h-6 rounded-sm bg-surface-container-high hover:bg-surface-bright
                flex items-center justify-center text-on-surface text-caption font-bold
              "
            >
              -
            </button>
            <button
              type="button"
              aria-label="Aumentar valor"
              onClick={() => adjustValue(step)}
              className="
                w-6 h-6 rounded-sm bg-surface-container-high hover:bg-surface-bright
                flex items-center justify-center text-on-surface text-caption font-bold
              "
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}