"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SiteBenefit, SiteConfig, SiteFaq } from "@billik/site-config";

function sitesPreviewBase() {
  return process.env.NEXT_PUBLIC_SITES_PREVIEW_URL || "http://localhost:3000";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#ffd700]/50 focus:ring-2 focus:ring-[#ffd700]/20";

export function SiteEditor({ initial }: { initial: SiteConfig }) {
  const [site, setSite] = useState<SiteConfig>(initial);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    const base = sitesPreviewBase().replace(/\/$/, "");
    return `${base}/?site=${site.id}`;
  }, [site.id]);

  const liveUrl = useMemo(() => `https://www.${site.domain}`, [site.domain]);

  const heroPreview = useMemo(() => {
    const base = sitesPreviewBase().replace(/\/$/, "");
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
    setStatus("");
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setStatus(data.error ?? "Uloženie zlyhalo");
      return;
    }
    const data = (await res.json()) as { mode?: string };
    setStatus(
      data.mode === "github"
        ? "Uložené do GitHubu. Vercel spustí nový deploy do ~1 minúty."
        : "Uložené lokálne.",
    );
  }

  async function uploadHero(file: File) {
    setUploading(true);
    setStatus("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/sites/${site.id}/hero`, { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setStatus(data.error ?? "Nahratie obrázka zlyhalo");
      return;
    }
    const data = (await res.json()) as { heroImage: string; mode?: string };
    update("heroImage", data.heroImage);
    setStatus(
      data.mode === "github"
        ? "Hero obrázok nahraný. Deploy sa spúšťa automaticky."
        : "Hero obrázok uložený lokálne.",
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-zinc-400 transition hover:text-white">
          ← Späť na zoznam
        </Link>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[#ffd700] hover:underline">
          Náhľad (?site=)
        </a>
        <a href={liveUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
          www.{site.domain}
        </a>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Hero obrázok</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <img
            src={heroPreview}
            alt={site.heroAlt}
            className="max-h-72 w-full rounded-xl border border-white/10 object-cover"
          />
          <div className="space-y-3">
            <Field label="Alt text">
              <input
                className={inputClass}
                value={site.heroAlt}
                onChange={(e) => update("heroAlt", e.target.value)}
              />
            </Field>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">Nahrať nový obrázok</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadHero(file);
                }}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-[#ffd700] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2">
        <Field label="SEO title">
          <input className={inputClass} value={site.title} onChange={(e) => update("title", e.target.value)} />
        </Field>
        <Field label="Accent color">
          <input className={inputClass} value={site.accentColor} onChange={(e) => update("accentColor", e.target.value)} />
        </Field>
        <Field label="Meta description">
          <textarea
            className={`${inputClass} min-h-24`}
            value={site.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label="Keywords (čiarkou oddelené)">
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
        <Field label="H1">
          <input className={inputClass} value={site.h1} onChange={(e) => update("h1", e.target.value)} />
        </Field>
        <Field label="Podnadpis">
          <input className={inputClass} value={site.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
        </Field>
        <Field label="CTA text">
          <input className={inputClass} value={site.ctaText} onChange={(e) => update("ctaText", e.target.value)} />
        </Field>
        <Field label="CTA URL">
          <input className={inputClass} value={site.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">Odseky</h2>
        {site.paragraphs.map((paragraph, index) => (
          <Field key={`p-${index}`} label={`Odsek ${index + 1}`}>
            <textarea
              className={`${inputClass} min-h-28`}
              value={paragraph}
              onChange={(e) => updateParagraph(index, e.target.value)}
            />
          </Field>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">Výhody</h2>
        {site.benefits.map((benefit, index) => (
          <div key={`b-${index}`} className="grid gap-3 md:grid-cols-2">
            <Field label={`Názov ${index + 1}`}>
              <input
                className={inputClass}
                value={benefit.title}
                onChange={(e) => updateBenefit(index, "title", e.target.value)}
              />
            </Field>
            <Field label={`Popis ${index + 1}`}>
              <input
                className={inputClass}
                value={benefit.description}
                onChange={(e) => updateBenefit(index, "description", e.target.value)}
              />
            </Field>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">FAQ</h2>
        {site.faqs.map((faq, index) => (
          <div key={`f-${index}`} className="space-y-3 rounded-xl border border-white/10 p-4">
            <Field label={`Otázka ${index + 1}`}>
              <input
                className={inputClass}
                value={faq.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
              />
            </Field>
            <Field label={`Odpoveď ${index + 1}`}>
              <textarea
                className={`${inputClass} min-h-24`}
                value={faq.answer}
                onChange={(e) => updateFaq(index, "answer", e.target.value)}
              />
            </Field>
          </div>
        ))}
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#111113]/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading}
          className="rounded-xl bg-[#ffd700] px-6 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Ukladám…" : "Uložiť zmeny"}
        </button>
        {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      </div>
    </div>
  );
}