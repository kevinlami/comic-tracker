import type { Comic } from "@/types/comic";
import { ComicCard } from "./comic-card";

export function ComicsGrid({ comics }: { comics: Comic[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
