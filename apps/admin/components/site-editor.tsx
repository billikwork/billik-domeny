"use client";

import { useMemo, useState } from "react";
import type { SiteBenefit, SiteConfig, SiteFaq } from "@billik/site-config";
import { getSitesPreviewBase } from "@/lib/sites-preview";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { Field, inputClass } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

function SectionIcon({ children }: { children: React.ReactNode }) {
  return <span className="text-lg leading-none">{children}</span>;
}

export function SiteEditor({ initial }: { initial: SiteConfig }) {
  const { showToast } = useToast();
  const [site, setSite] = useState<SiteConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    const base = getSitesPreviewBase();
    return `${base}/?site=${site.id}`;
  }, [site.id]);

  const liveUrl = useMemo(() => `https://www.${site.domain}`, [site.domain]);

  const heroPreview = useMemo(() => {
    const base = getSitesPreviewBase();
    return `${base}${site.heroImage}`;
  }, [site.heroImage]);

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setSite((prev) => ({ ...prev, [key]: value }));
  }

  function updateParagraph(index: number, value: string) {
    const paragraphs = [...site.paragraphs];
    paragraphs[index] = value;
    update("paragraphs", paragraphs);
  }

  function updateBenefit(index: number, field: keyof SiteBenefit, value: string) {
    const benefits = site.benefits.map((b, i) => (i === index ? { ...b, [field]: value } : b));
    update("benefits", benefits);
  }

  function updateFaq(index: number, field: keyof SiteFaq, value: string) {
    const faqs = site.faqs.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    update("faqs", faqs);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      showToast("error", data.error ?? "Nepodarilo sa uložiť zmeny. Skúste to znova.");
      return;
    }
    const data = (await res.json()) as { mode?: string };
    showToast(
      "success",
      data.mode === "github"
        ? "Zmeny boli uložené. Stránka sa aktualizuje do jednej minúty."
        : "Zmeny boli uložené.",
    );
  }

  async function uploadHero(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/sites/${site.id}/hero`, { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      showToast("error", data.error ?? "Nepodarilo sa nahrať obrázok. Skúste iný formát (JPG, PNG, WebP).");
      return;
    }
    const data = (await res.json()) as { heroImage: string; mode?: string };
    update("heroImage", data.heroImage);
    showToast(
      "success",
      data.mode === "github"
        ? "Obrázok bol nahraný. Stránka sa aktualizuje automaticky."
        : "Obrázok bol uložený.",
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#ffd700]/30 bg-[#ffd700]/10 px-4 py-2.5 text-base font-medium text-[#ffd700] transition hover:border-[#ffd700]/50 hover:bg-[#ffd700]/15"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Náhľad stránky
        </a>
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-base text-zinc-400 transition hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Otvoriť www.{site.domain}
        </a>
      </div>

      <Disclosure
        title="Hlavný obrázok"
        description="Obrázok v hornej časti stránky a jeho popis pre vyhľadávače"
        defaultOpen
        icon={<SectionIcon>🖼️</SectionIcon>}
        badge="Hero"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl border border-white/10">
            <img
              src={heroPreview}
              alt={site.heroAlt}
              className="max-h-80 w-full object-cover"
            />
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 text-white">
                  <Spinner className="h-8 w-8 text-[#ffd700]" />
                  <span className="text-base font-medium">Nahrávam obrázok…</span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-5">
            <Field label="Popis obrázka (alt text)" hint="Krátky popis obrázka — pomáha SEO a prístupnosti">
              <input
                className={inputClass}
                value={site.heroAlt}
                onChange={(e) => update("heroAlt", e.target.value)}
              />
            </Field>
            <Field label="Nahrať nový obrázok" hint="Podporované formáty: JPG, PNG, WebP">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] px-6 py-8 transition hover:border-[#ffd700]/40 hover:bg-[#ffd700]/5">
                <svg className="mb-3 text-zinc-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-base font-medium text-zinc-300">Kliknite pre výber súboru</span>
                <span className="mt-1 text-sm text-zinc-500">alebo pretiahnite obrázok sem</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadHero(file);
                  }}
                  className="sr-only"
                />
              </label>
            </Field>
          </div>
        </div>
      </Disclosure>

      <Disclosure
        title="SEO a základné informácie"
        description="Názov stránky, popis pre Google a kľúčové slová"
        icon={<SectionIcon>🔍</SectionIcon>}
        badge="4 polia"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Titulok stránky (SEO)" hint="Zobrazí sa v záložke prehliadača a vo výsledkoch Google">
            <input className={inputClass} value={site.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field label="Farba akcentu" hint="Hex kód farby, napr. #ffd700">
            <div className="flex gap-3">
              <input
                className={`${inputClass} flex-1`}
                value={site.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
              />
              <span
                className="h-[52px] w-[52px] shrink-0 rounded-xl border border-white/15"
                style={{ backgroundColor: site.accentColor }}
                aria-hidden="true"
              />
            </div>
          </Field>
          <Field label="Meta popis" hint="Krátky text pod názvom vo vyhľadávaní Google">
            <textarea
              className={`${inputClass} min-h-28`}
              value={site.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field label="Kľúčové slová" hint="Oddeľte čiarkou, napr. fakturácia, účtovníctvo">
            <input
              className={inputClass}
              value={site.keywords.join(", ")}
              onChange={(e) =>
                update(
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                )
              }
            />
          </Field>
        </div>
      </Disclosure>

      <Disclosure
        title="Hlavný text stránky"
        description="Nadpis, podnadpis a tlačidlo výzvy k akcii"
        defaultOpen
        icon={<SectionIcon>✏️</SectionIcon>}
        badge="4 polia"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Hlavný nadpis (H1)">
            <input className={inputClass} value={site.h1} onChange={(e) => update("h1", e.target.value)} />
          </Field>
          <Field label="Podnadpis">
            <input className={inputClass} value={site.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
          </Field>
          <Field label="Text tlačidla">
            <input className={inputClass} value={site.ctaText} onChange={(e) => update("ctaText", e.target.value)} />
          </Field>
          <Field label="Odkaz tlačidla" hint="Kam má tlačidlo presmerovať návštevníka">
            <input className={inputClass} value={site.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} />
          </Field>
        </div>
      </Disclosure>

      <Disclosure
        title="Textové odseky"
        description="Hlavný obsah stránky rozdelený do sekcií"
        icon={<SectionIcon>📄</SectionIcon>}
        badge={`${site.paragraphs.length} odsekov`}
      >
        <div className="space-y-5">
          {site.paragraphs.map((paragraph, index) => (
            <Field key={`p-${index}`} label={`Odsek ${index + 1}`}>
              <textarea
                className={`${inputClass} min-h-32`}
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Disclosure>

      <Disclosure
        title="Výhody"
        description="Prečo si zákazník vybrať práve vás"
        icon={<SectionIcon>⭐</SectionIcon>}
        badge={`${site.benefits.length} položiek`}
      >
        <div className="space-y-5">
          {site.benefits.map((benefit, index) => (
            <div key={`b-${index}`} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Výhoda {index + 1}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Názov">
                  <input
                    className={inputClass}
                    value={benefit.title}
                    onChange={(e) => updateBenefit(index, "title", e.target.value)}
                  />
                </Field>
                <Field label="Popis">
                  <input
                    className={inputClass}
                    value={benefit.description}
                    onChange={(e) => updateBenefit(index, "description", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Disclosure>

      <Disclosure
        title="Často kladené otázky (FAQ)"
        description="Odpovede na najčastejšie otázky zákazníkov"
        icon={<SectionIcon>❓</SectionIcon>}
        badge={`${site.faqs.length} otázok`}
      >
        <div className="space-y-5">
          {site.faqs.map((faq, index) => (
            <div key={`f-${index}`} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Otázka {index + 1}
              </p>
              <div className="space-y-4">
                <Field label="Otázka">
                  <input
                    className={inputClass}
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                  />
                </Field>
                <Field label="Odpoveď">
                  <textarea
                    className={`${inputClass} min-h-28`}
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Disclosure>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0d0f]/95 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Po uložení sa zmeny automaticky zverejnia na stránke.
          </p>
          <Button size="lg" onClick={save} loading={saving} disabled={uploading}>
            {saving ? "Ukladám zmeny…" : "Uložiť zmeny"}
          </Button>
        </div>
      </div>
    </div>
  );
}