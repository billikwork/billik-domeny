import Image from "next/image";
import type { SiteConfig } from "@billik/site-config";

interface LandingPageProps {
  site: SiteConfig;
}

function faqHeading(language: string) {
  if (language === "cs") return "Často kladené dotazy";
  if (language === "en") return "Frequently asked questions";
  return "Často kladené otázky";
}

export function LandingPage({ site }: LandingPageProps) {
  const accent = site.accentColor;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0b]/85 backdrop-blur-md">
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
          <a
            href="tel:+4213776522106"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-white/30 sm:inline-flex"
            style={{ color: accent }}
          >
            037 / 65 22 106
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0a0b]" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <p
                className="mb-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{ borderColor: `${accent}55`, color: accent }}
              >
                {site.domain}
              </p>
              <h1
                className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] tracking-wide text-white sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {site.h1}
              </h1>
              <p className="mt-5 text-lg font-medium text-zinc-200 sm:text-xl" style={{ color: accent }}>
                {site.subtitle}
              </p>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
                {site.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={site.ctaUrl}
                  className="inline-flex items-center rounded-xl px-6 py-3.5 text-sm font-bold text-black shadow-lg transition hover:scale-[1.02] hover:opacity-95"
                  style={{ backgroundColor: accent, boxShadow: `0 12px 40px ${accent}44` }}
                >
                  {site.ctaText}
                </a>
                <a
                  href="https://www.billik.sk"
                  className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-white/40 hover:bg-white/5"
                >
                  Navštíviť billik.sk
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60">
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                />
                <Image
                  src={site.heroImage}
                  alt={site.heroAlt}
                  width={1200}
                  height={1400}
                  priority
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-zinc-950/80">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {site.benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 transition hover:border-white/20 hover:bg-zinc-900"
            >
              <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-black"
                style={{ backgroundColor: accent }}
              >
                {index + 1}
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                {benefit.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{faqHeading(site.language)}</h2>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-white/20 to-transparent sm:block" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {site.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-5 open:border-white/20 open:bg-zinc-900/80"
            >
              <summary className="cursor-pointer list-none font-semibold text-zinc-100 marker:content-none">
                <span className="flex items-start justify-between gap-3">
                  {faq.question}
                  <span
                    className="mt-0.5 text-lg leading-none text-zinc-500 transition group-open:rotate-45"
                    style={{ color: accent }}
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="border-y border-white/10 py-12"
        style={{ background: `linear-gradient(135deg, ${accent}18, transparent 55%)` }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Billik Trade s.r.o.
          </p>
          <p className="max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            Všetko pre zváranie na jednom mieste
          </p>
          <a
            href={site.ctaUrl}
            className="inline-flex items-center rounded-xl px-8 py-4 text-base font-bold text-black transition hover:opacity-95"
            style={{ backgroundColor: accent }}
          >
            {site.ctaText}
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-white">Billik Trade s.r.o.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Priemyselná 4, 949 01 Nitra · Slovensko
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Po–Pi 7:00–16:30 ·{" "}
                <a href="tel:+4213776522106" className="hover:text-zinc-300">
                  037 / 65 22 106
                </a>
              </p>
            </div>
            <a
              href="https://www.billik.sk"
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