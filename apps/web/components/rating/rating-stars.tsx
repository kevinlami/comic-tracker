import { StarIcon, StarOutlineIcon } from "@/components/icons";

type RatingStarsVariant = "row" | "badge";

interface RatingStarsProps {
  /** Nota de 1 a 5; `null` não renderiza nada (obra ainda não avaliada). */
  rating: number | null;
  /**
   * `row` = 5 estrelas + número, no fluxo do texto;
   * `badge` = chip com 1 estrela + número — a posição sobre a capa vem
   * do `className` (ex.: `absolute top-2 right-2`).
   */
  variant?: RatingStarsVariant;
  className?: string;
}

const TOTAL_STARS = [1, 2, 3, 4, 5];

/**
 * Exibição somente leitura da avaliação pessoal do quadrinho.
 * Obra sem nota não ganha estrelas em lugar nenhum.
 */
export function RatingStars({
  rating,
  variant = "row",
  className,
}: RatingStarsProps) {
  if (rating === null) {
    return null;
  }

  const label = `Avaliação: ${rating} de 5 estrelas`;

  if (variant === "badge") {
    return (
      <span
        role="img"
        aria-label={label}
        className={`px-1.5 py-0.5 rounded text-caption font-bold bg-surface-container-lowest/80 backdrop-blur-sm text-tertiary flex items-center gap-1 ${className ?? ""}`}
      >
        <StarIcon className="w-3.5 h-3.5" />
        <span>{rating}</span>
      </span>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center gap-1 mt-1.5 ${className ?? ""}`}
    >
      <span className="flex items-center text-tertiary" aria-hidden="true">
        {TOTAL_STARS.map((star) =>
          star <= rating ? (
            <StarIcon key={star} className="w-[14px] h-[14px]" />
          ) : (
            <StarOutlineIcon key={star} className="w-[14px] h-[14px]" />
          ),
        )}
      </span>
      <span className="text-caption font-semibold text-tertiary ml-0.5">
        {rating}
      </span>
    </div>
  );
}
