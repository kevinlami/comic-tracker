/** Resultado da leitura do campo de avaliação em um formulário. */
export type RatingParse =
  | { ok: true; rating: number | null }
  | { ok: false; message: string };

/**
 * Lê o campo de avaliação (`rating`) do `FormData`.
 *
 * Vazio = sem avaliação (`null`); caso contrário o valor precisa ser um
 * inteiro de 1 a 5. A API valida de novo — aqui só garantimos uma mensagem
 * amigável antes de gastar uma chamada.
 */
export function parseRating(value: string): RatingParse {
  if (value.length === 0) {
    return { ok: true, rating: null };
  }

  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Avaliação deve ser um inteiro de 1 a 5." };
  }

  return { ok: true, rating };
}
