/**
 * Skeleton do acervo — fallback do `Suspense` da página `/`.
 * Espelha a estrutura real: resumo, busca e grid de cards.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full text-on-surface animate-pulse">
      <section
        aria-hidden="true"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12"
      >
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-surface-container-low rounded-xl p-4 shadow-sm"
          >
            <div className="h-3 bg-surface-container-high rounded w-1/2" />
            <div className="h-8 bg-surface-container-high rounded w-1/3 mt-4" />
          </div>
        ))}
      </section>

      <section aria-hidden="true" className="mb-12">
        <div className="h-10 bg-surface-container-low rounded-xl w-full lg:max-w-sm" />
      </section>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[0, 1, 2].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-low rounded-xl p-3 flex gap-3">
      <div className="w-24 shrink-0 aspect-[2/3] bg-surface-container-high rounded-lg" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-surface-container-high rounded w-1/3" />
        <div className="h-5 bg-surface-container-high rounded w-4/5" />
        <div className="h-3 bg-surface-container-high rounded w-1/2" />
        <div className="h-8 bg-surface-container-high rounded w-2/3" />
      </div>
    </div>
  );
}
