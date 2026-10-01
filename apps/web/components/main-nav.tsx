"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** `true` quando a rota atual pertence a este item (ex.: `/sites/...`). */
  matches: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Acervo", matches: (path) => path === "/" },
  { href: "/sites", label: "Sites", matches: (path) => path.startsWith("/sites") },
];

/** Links da navegação principal, com `aria-current` conforme a rota ativa. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-4">
      {NAV_ITEMS.map((item) =>
        item.matches(pathname) ? (
          <Link
            key={item.href}
            href={item.href}
            aria-current="page"
            className="text-label-md text-primary rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {item.label}
          </Link>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="text-label-md text-on-surface-variant hover:text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
