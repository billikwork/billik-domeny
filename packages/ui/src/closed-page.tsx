import type { SiteConfig } from "@billik/site-config";

interface ClosedPageProps {
  site: SiteConfig;
}

export function ClosedPage({ site }: ClosedPageProps) {
  const accent = site.accentColor;
  const closed = site.closed;

  if (!closed) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0b] text-zinc-100">
      <header className="border-b border-white/10 bg-[#0a0a0b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-black"
              style={{ backgroundColor: accent }}
            >
              B
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white sm:text-base">
                Billik Trade <span className="font-normal text-zinc-400">s.r.o.</span>
              </p>
              <p className="text-xs text-zinc-500">Tradícia od roku 1992 · Nitra</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accent}18, transparent 55%)` }}
        />
        <div className="relative w-full max-w-2xl text-center">
          <p
            className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            {site.domain}
          </p>
          <h1
            className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] tracking-wide text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {closed.heading}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-zinc-300 sm:text-lg">{closed.message}</p>
          <div className="mt-8 flex justify-center">
            <a
              href={closed.linkUrl}
              className="inline-flex items-center rounded-xl px-8 py-4 text-base font-bold text-black shadow-lg transition hover:scale-[1.02] hover:opacity-95"
              style={{ backgroundColor: accent, boxShadow: `0 12px 40px ${accent}44` }}
            >
              {closed.linkLabel}
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-white">Billik Trade s.r.o.</p>
              <p className="mt-1 text-sm text-zinc-500">Priemyselná 4, 949 01 Nitra · Slovensko</p>
              <p className="mt-1 text-sm text-zinc-500">
                <a href="tel:+4213776522106" className="hover:text-zinc-300">
                  037 / 65 22 106
                </a>
              </p>
            </div>
            <a
              href={closed.linkUrl}
              className="text-base font-semibold transition hover:opacity-80"
              style={{ color: accent }}
            >
              www.billik.sk →
            </a>
          </div>
          <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
            © {new Date().getFullYear()} Billik Trade s.r.o. Všetky práva vyhradené.
          </p>
        </div>
      </footer>
    </div>
  );
}
