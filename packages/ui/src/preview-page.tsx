import type { SiteConfig } from "@billik/site-config";

interface PreviewPageProps {
  sites: SiteConfig[];
}

export function PreviewPage({ sites }: PreviewPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Lokálny náhľad · dev only
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Vyberte stránku na ukážku</h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          Domény ešte nie sú napojené na DNS, preto na localhoste nepoužívame adresy ako{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-300">
            www.billik.cz:3000
          </code>
          . Každú stránku si pozriete cez odkaz nižšie. Po nasadení na Vercel a nastavení DNS
          budú fungovať priamo na svojich doménach.
        </p>

        <ul className="mt-10 space-y-3">
          {sites.map((site) => (
            <li key={site.id}>
              <a
                href={`/?site=${site.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/60 px-5 py-4 transition hover:border-white/25 hover:bg-zinc-900"
              >
                <div>
                  <p className="font-semibold text-white">www.{site.domain}</p>
                  <p className="mt-1 text-sm text-zinc-500">{site.h1}</p>
                </div>
                <span className="text-sm text-zinc-400">Náhľad →</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-xs text-zinc-600">
          Po deployi: www.{sites[0]?.domain} → Vercel (bez :3000)
        </p>
      </div>
    </div>
  );
}