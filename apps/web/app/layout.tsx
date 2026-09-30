import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comic Tracker",
  description: "Organize e acompanhe a leitura dos seus quadrinhos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-surface text-on-surface">
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface/85 backdrop-blur-md border-b border-outline-variant">
          <div className="max-w-6xl mx-auto h-full px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 group rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  📚
                </span>
                <span className="text-headline-sm sm:text-headline-lg text-on-surface tracking-tight group-hover:text-primary transition-colors">
                  Comic Tracker
                </span>
              </Link>
              <nav
                aria-label="Navegação principal"
                className="hidden md:flex items-center gap-4"
              >
                <Link
                  href="/"
                  aria-current="page"
                  className="text-label-md text-primary rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Acervo
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="w-full pt-16 flex-1">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>

        <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-6">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-on-surface-variant">
            <span>© 2026 Comic Tracker. Minimalist Graphic Fiction Vault.</span>
            <span className="text-caption text-outline">
              Sincronizado Localmente
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
