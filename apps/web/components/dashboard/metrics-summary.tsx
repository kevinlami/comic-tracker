import type { Comic } from "@/types/comic";
import { formatRelativeTime } from "@/lib/relative-time";

interface MetricsSummaryProps {
  comics: Comic[];
}

/**
 * Resumo do acervo: total, lendo, concluídos e última leitura
 * — todos derivados da lista já carregada.
 */
export function MetricsSummary({ comics }: MetricsSummaryProps) {
  const total = comics.length;
  const reading = comics.filter(
    (comic) => comic.readingProgress?.status === "READING",
  ).length;
  const completed = comics.filter(
    (comic) => comic.readingProgress?.status === "COMPLETED",
  ).length;

  const reads = comics.flatMap((comic) => {
    const progress = comic.readingProgress;
    if (!progress?.lastReadAt) return [];
    return [
      {
        at: progress.lastReadAt,
        chapter: progress.currentChapterNumber,
        title: comic.title,
      },
    ];
  });
  reads.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const latest = reads[0];
  const latestRelative = latest ? formatRelativeTime(latest.at) : null;

  return (
    <section
      aria-label="Resumo do acervo"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12"
    >
      <MetricCard label="Títulos">
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-headline-lg text-on-surface">
            {total}
          </span>
          <span className="text-caption px-1 py-0.5 rounded bg-surface-container-high">
            Biblioteca
          </span>
        </div>
      </MetricCard>

      <MetricCard
        label="Lendo"
        dotClassName="bg-primary ring-primary/20"
      >
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-headline-lg text-primary">{reading}</span>
          <span className="text-caption text-primary">Em andamento</span>
        </div>
      </MetricCard>

      <MetricCard
        label="Concluídos"
        dotClassName="bg-secondary ring-secondary/20"
      >
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-headline-lg text-secondary">{completed}</span>
          <span className="text-caption text-secondary">100% finalizado</span>
        </div>
      </MetricCard>

      <MetricCard label="Última leitura">
        <div className="flex items-baseline justify-between mt-3">
          <span className="text-headline-md text-on-surface tracking-tight">
            {latestRelative ?? "—"}
          </span>
          {latest?.chapter ? (
            <span
              className="text-caption text-on-surface-variant truncate max-w-[80px]"
              title={latest.title}
            >
              Cap. {latest.chapter}
            </span>
          ) : null}
        </div>
      </MetricCard>
    </section>
  );
}

function MetricCard({
  label,
  dotClassName,
  children,
}: {
  label: string;
  dotClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-low rounded-xl p-4 shadow-sm flex flex-col justify-between hover:bg-surface-container transition-colors">
      {dotClassName ? (
        <div className="flex items-center justify-between">
          <span className="text-caption text-on-surface-variant uppercase tracking-wider">
            {label}
          </span>
          <span
            className={`w-2 h-2 rounded-full ring-4 ${dotClassName}`}
            aria-hidden="true"
          />
        </div>
      ) : (
        <span className="text-caption text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
