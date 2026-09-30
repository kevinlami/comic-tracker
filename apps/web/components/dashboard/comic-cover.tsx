import { BookIcon } from "@/components/icons";

interface ComicCoverProps {
  coverUrl: string | null;
  title: string;
  /** Classes extras para efeitos no <img> (ex.: zoom no hover). */
  className?: string;
}

/**
 * Capa do quadrinho ou placeholder quando não há `coverUrl`.
 * Usa <img> simples porque as capas são URLs arbitrárias cadastradas
 * pelo usuário (não há domínios fixos para configurar no next/image).
 */
export function ComicCover({ coverUrl, title, className }: ComicCoverProps) {
  if (!coverUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-outline">
        <BookIcon className="w-8 h-8 mb-1" />
        <span className="text-caption text-on-surface-variant font-medium">
          Sem capa
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- capas com URLs arbitrárias do usuário
    <img
      src={coverUrl}
      alt={`Capa de ${title}`}
      loading="lazy"
      className={`w-full h-full object-cover ${className ?? ""}`}
    />
  );
}
