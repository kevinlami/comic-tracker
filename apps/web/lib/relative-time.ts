const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * Converte uma data ISO em texto relativo em pt-BR
 * ("há 2 dias", "ontem", "agora").
 */
export function formatRelativeTime(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const diff = timestamp - Date.now();
  const absolute = Math.abs(diff);

  if (absolute < 45 * 1000) {
    return RELATIVE_FORMATTER.format(0, "minute");
  }

  for (const [unit, milliseconds] of UNITS) {
    if (absolute >= milliseconds) {
      return RELATIVE_FORMATTER.format(Math.round(diff / milliseconds), unit);
    }
  }

  return null;
}
