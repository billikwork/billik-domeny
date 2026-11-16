import type { CSSProperties, ReactNode } from "react";
import type { SiteConfig } from "@billik/site-config";

interface ClosedPageProps {
  site: SiteConfig;
  /** Host the visitor actually requested (without www). Falls back to site.domain. */
  host?: string;
}

const ADDRESS = "Priemyselná 4, 949 01 Nitra";
const HOURS = "Po–Pi 7:00–16:30";
const PHONE_LABEL = "037 / 65 22 106";
const PHONE_HREF = "tel:+4213776522106";
const EMAIL = "info@billik.sk";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const OFFERS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Zváracia technika a zváračky",
    text: "Zváračky, plazmové rezačky a spotrebný materiál pre dielňu aj priemysel.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" {...stroke}>
        <path d="M13 2 5 13.5h6L10 22l9-12.5h-6L13 2Z" />
      </svg>
    ),
  },
  {
    title: "Servis zváračiek",
    text: "Oprava a servis zváracej techniky v Nitre, aby vám stroj slúžil roky.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" {...stroke}>
        <path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6a2 2 0 0 1 0 2.8l-5.6 5.6a2 2 0 0 1-2.8 0L3 11.4a2 2 0 0 1 0-2.8L8.6 3a2 2 0 0 1 2.8 0l3.3 3.3Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </svg>
    ),
  },
  {
    title: "Zámočnícka výroba",
    text: "Zákazková kovovýroba a zámočnícke práce na mieru podľa vašich požiadaviek.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" {...stroke}>
        <path d="M3 4h18v4H3zM6 8v12M18 8v12M6 14h12" />
      </svg>
    ),
  },
];

// Spark trajectories, in container-width units so they scale with the illustration.
const SPARKS = [
  { dx: -14, up: 20, fall: 22, delay: 0.0, dur: 2.2, size: 3 },
  { dx: 9, up: 26, fall: 18, delay: 0.5, dur: 2.6, size: 3 },
  { dx: 18, up: 14, fall: 24, delay: 1.1, dur: 2.0, size: 3 },
  { dx: -6, up: 30, fall: 16, delay: 1.6, dur: 2.8, size: 3 },
  { dx: 26, up: 22, fall: 20, delay: 0.3, dur: 2.4, size: 4 },
  { dx: -22, up: 12, fall: 26, delay: 1.9, dur: 2.1, size: 3 },
  { dx: 4, up: 34, fall: 14, delay: 0.9, dur: 3.0, size: 3 },
  { dx: -10, up: 16, fall: 20, delay: 2.4, dur: 2.3, size: 3 },
  { dx: 14, up: 28, fall: 22, delay: 2.0, dur: 2.7, size: 3 },
  { dx: -28, up: 18, fall: 18, delay: 1.3, dur: 2.5, size: 3 },
];

const CSS = `
.cp-root { --cp-accent: #edaf1d; --cp-bg: #14110e; --cp-panel: #1b1713; --cp-ink: #f5efe4; --cp-muted: #b8afa2; }

.cp-brushed {
  background-image:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #2a2520 0%, #1b1713 45%, #25201b 100%);
}

.cp-spark {
  position: absolute; left: 0; top: 0;
  border-radius: 9999px;
  background: #ffe6a3;
  box-shadow: 0 0 8px 2px rgba(255, 150, 40, 0.95);
  opacity: 0;
  pointer-events: none;
}
.cp-head-flare { transform-origin: center; transform-box: fill-box; }

@keyframes cp-weld { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
@keyframes cp-travel { from { transform: translateX(0); } to { transform: translateX(300px); } }
@keyframes cp-flicker { 0%,100% { opacity: 1; transform: scale(1); } 40% { opacity: .78; transform: scale(.9); } 70% { opacity: .95; transform: scale(1.08); } }
@keyframes cp-spark {
  0%   { transform: translate(0, 0); opacity: 0; }
  8%   { opacity: 1; }
  35%  { transform: translate(calc(var(--dx) * .55cqw), calc(var(--up) * -1cqw)); }
  100% { transform: translate(calc(var(--dx) * 1cqw), calc(var(--fall) * 1cqw)); opacity: 0; }
}
@keyframes cp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: no-preference) {
  .cp-bead  { animation: cp-weld 3.4s cubic-bezier(.45,.1,.3,1) .4s both; }
  .cp-head  { animation: cp-travel 3.4s cubic-bezier(.45,.1,.3,1) .4s both; }
  .cp-head-flare { animation: cp-flicker .35s linear 3.8s infinite; }
  .cp-spark { animation: cp-spark var(--dur) ease-out calc(var(--delay) + 3.6s) infinite; }
  .cp-intro { animation: cp-rise .8s ease-out both; }
}
@media (prefers-reduced-motion: reduce) {
  .cp-spark { display: none; }
}
`;

export function ClosedPage({ site, host }: ClosedPageProps) {
  const accent = site.accentColor;
  const closed = site.closed;

  if (!closed) return null;

  const shownHost = (host || site.domain).toLowerCase().replace(/^www\./, "");
  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cp-accent)]";

  return (
    <div
      className="cp-root flex min-h-screen flex-col bg-[var(--cp-bg)] text-[var(--cp-ink)]"
      style={{ ["--cp-accent" as string]: accent }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4 sm:px-8">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md text-lg font-bold text-black"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          >
            B
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white sm:text-base">
              Billik Trade <span className="font-normal text-[var(--cp-muted)]">s.r.o.</span>
            </p>
            <p className="text-xs text-[var(--cp-muted)]">Od roku 1992 v Nitre</p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: the weld seam is the centrepiece. */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(60% 70% at 78% 62%, rgba(255,140,30,0.20), transparent 70%), radial-gradient(40% 50% at 8% 0%, rgba(237,175,29,0.07), transparent 70%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-20 lg:pt-16">
            <div className="cp-intro order-2 lg:order-1">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-[var(--cp-muted)]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
                {shownHost}
              </p>
              <h1
                className="text-balance text-[clamp(3.25rem,12vw,6.75rem)] leading-[0.9] tracking-wide text-[var(--cp-ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {closed.heading}
              </h1>
              <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-[var(--cp-muted)] sm:text-lg">
                {closed.message}
              </p>
              <div className="mt-8">
                <a
                  href={closed.linkUrl}
                  className={`inline-flex items-center gap-3 rounded-md px-7 py-4 text-base font-bold text-black transition hover:brightness-110 ${focusRing}`}
                  style={{ backgroundColor: accent, boxShadow: `0 10px 36px ${accent}33` }}
                >
                  {closed.linkLabel}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke} strokeWidth={2.2}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Two steel plates being joined by a glowing weld bead. Decorative only. */}
            <div
              className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none"
              style={{ containerType: "inline-size" }}
              aria-hidden="true"
            >
              <svg viewBox="0 70 400 220" className="block h-auto w-full">
                <defs>
                  <linearGradient id="cp-plate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3a332c" />
                    <stop offset="0.5" stopColor="#262019" />
                    <stop offset="1" stopColor="#1c1813" />
                  </linearGradient>
                  <linearGradient id="cp-bead" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="330" y2="0">
                    <stop offset="0" stopColor="#9a5a0c" />
                    <stop offset="0.6" stopColor="#e8962a" />
                    <stop offset="1" stopColor="#ffe08a" />
                  </linearGradient>
                  <radialGradient id="cp-glow">
                    <stop offset="0" stopColor="#fff4cf" stopOpacity="0.95" />
                    <stop offset="0.18" stopColor="#ffc24a" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#ff7a1a" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="cp-grain" width="3" height="4" patternUnits="userSpaceOnUse">
                    <rect width="1" height="4" fill="#ffffff" opacity="0.035" />
                  </pattern>
                </defs>

                {/* upper plate */}
                <rect x="10" y="132" width="380" height="64" rx="3" fill="url(#cp-plate)" />
                <rect x="10" y="132" width="380" height="64" rx="3" fill="url(#cp-grain)" />
                <rect x="10" y="132" width="380" height="1.5" fill="#ffffff" opacity="0.14" />
                {/* lower plate */}
                <rect x="10" y="204" width="380" height="64" rx="3" fill="url(#cp-plate)" />
                <rect x="10" y="204" width="380" height="64" rx="3" fill="url(#cp-grain)" />
                <rect x="10" y="204" width="380" height="1.5" fill="#ffffff" opacity="0.1" />
                {/* the open joint */}
                <rect x="10" y="196" width="380" height="8" fill="#0b0907" />

                {/* weld bead, drawn once left to right */}
                <path
                  className="cp-bead"
                  d="M30 200H330"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={0}
                  stroke="url(#cp-bead)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* arc head, travels with the bead and rests at its end */}
                <g className="cp-head" style={{ transform: "translateX(300px)" }}>
                  <g className="cp-head-flare">
                    <circle cx="30" cy="200" r="46" fill="url(#cp-glow)" />
                    <circle cx="30" cy="200" r="4" fill="#fffaf0" />
                  </g>
                </g>
              </svg>

              {/* sparks leave from where the bead ends (x = 330 of 400, y = 200 in a 70..290 viewBox) */}
              <div className="absolute" style={{ left: "82.5%", top: "59%" }}>
                {SPARKS.map((s, i) => (
                  <span
                    key={i}
                    className="cp-spark"
                    style={
                      {
                        width: s.size,
                        height: s.size,
                        "--dx": s.dx,
                        "--up": s.up,
                        "--fall": s.fall,
                        "--delay": `${s.delay}s`,
                        "--dur": `${s.dur}s`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What Billik still offers */}
        <section className="border-t border-white/10 bg-[var(--cp-panel)]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
            <h2
              className="text-3xl tracking-wide text-[var(--cp-ink)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Čo u nás nájdete naďalej
            </h2>
            <ul className="mt-7 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-3">
              {OFFERS.map((offer) => (
                <li key={offer.title} className="bg-[var(--cp-panel)]">
                  <a
                    href={closed.linkUrl}
                    className={`group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05] ${focusRing} focus-visible:-outline-offset-4`}
                  >
                    <span style={{ color: accent }}>{offer.icon}</span>
                    <span className="text-lg font-bold text-[var(--cp-ink)]">{offer.title}</span>
                    <span className="text-sm leading-relaxed text-[var(--cp-muted)]">{offer.text}</span>
                    <span
                      className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold"
                      style={{ color: accent }}
                    >
                      Na billik.sk
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                        {...stroke}
                        strokeWidth={2.2}
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact strip */}
        <section className="border-t border-white/10">
          <address className="mx-auto grid max-w-6xl gap-6 px-5 py-9 text-sm not-italic sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            <ContactItem label="Adresa" accent={accent}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke}>
                <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <span>{ADDRESS}</span>
            </ContactItem>
            <ContactItem label="Otváracie hodiny" accent={accent}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{HOURS}</span>
            </ContactItem>
            <ContactItem label="Telefón" accent={accent}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke}>
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
              <a href={PHONE_HREF} className={`underline-offset-4 hover:underline ${focusRing}`}>
                {PHONE_LABEL}
              </a>
            </ContactItem>
            <ContactItem label="E-mail" accent={accent}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...stroke}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <a href={`mailto:${EMAIL}`} className={`underline-offset-4 hover:underline ${focusRing}`}>
                {EMAIL}
              </a>
            </ContactItem>
          </address>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-[var(--cp-muted)] sm:px-8">
          © {new Date().getFullYear()} Billik Trade s.r.o. Všetky práva vyhradené.
        </p>
      </footer>
    </div>
  );
}

function ContactItem({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: ReactNode;
}) {
  const [icon, ...rest] = Array.isArray(children) ? children : [children];
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5" style={{ color: accent }}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-[var(--cp-muted)]">{label}</p>
        <p className="mt-0.5 text-base text-[var(--cp-ink)]">{rest}</p>
      </div>
    </div>
  );
}
