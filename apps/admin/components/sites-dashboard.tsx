"use client";

import { useMemo, useState } from "react";
import type { SiteListItem } from "@/lib/sites-meta";
import { useIsNavigatingTo, NavLink } from "@/components/nav-link";
import { inputClass } from "@/components/ui/field";


type SortKey = "name-asc" | "name-desc" | "edited-desc" | "edited-asc";

const sortLabels: Record<SortKey, string> = {
  "name-asc": "Názov A → Z",
  "name-desc": "Názov Z → A",
  "edited-desc": "Naposledy upravené",
  "edited-asc": "Najstaršie úpravy",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function sortSites(sites: SiteListItem[], sort: SortKey) {
  const copy = [...sites];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.domain.localeCompare(b.domain, "sk"));
    case "name-desc":
      return copy.sort((a, b) => b.domain.localeCompare(a.domain, "sk"));
    case "edited-desc":
      return copy.sort((a, b) => {
        const ta = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
        const tb = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
        return tb - ta;
      });
    case "edited-asc":
      return copy.sort((a, b) => {
        const ta = a.lastEdited ? new Date(a.lastEdited).getTime() : Infinity;
        const tb = b.lastEdited ? new Date(b.lastEdited).getTime() : Infinity;
        return ta - tb;
      });
  }
}

function SiteRow({ site }: { site: SiteListItem }) {
  const href = `/sites/${site.id}`;
  const isPending = useIsNavigatingTo(href);

  return (
    <tr
      className={`group border-b border-white/5 transition-colors ${
        isPending ? "bg-[#ffd700]/5" : "hover:bg-white/[0.03]"
      }`}
    >
      <td className="py-4 pr-4">
        <NavLink href={href} className="block cursor-pointer">
          <span
            className={`text-base font-semibold transition ${
              isPending ? "text-[#ffd700]" : "text-white group-hover:text-[#ffd700]"
            }`}
          >
            www.{site.domain}
          </span>
          <span className="mt-0.5 block text-xs text-zinc-600">{site.id}</span>
        </NavLink>
      </td>
      <td className="hidden max-w-xs py-4 pr-4 md:table-cell">
        <span className="line-clamp-2 text-sm text-zinc-400">{site.h1}</span>
      </td>
      <td className="whitespace-nowrap py-4 pr-4 text-sm text-zinc-400">
        {formatDate(site.lastEdited)}
      </td>
      <td className="py-4 text-right">
        <NavLink
          href={href}
          showSpinner
          className={`inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium transition ${
            isPending ? "text-[#ffd700]" : "text-zinc-500 hover:text-[#ffd700]"
          }`}
        >
          {isPending ? "Načítavam" : "Upraviť"}
          {!isPending ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </NavLink>
      </td>
    </tr>
  );
}

export function SitesDashboard({ sites }: { sites: SiteListItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("edited-desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? sites.filter(
          (s) =>
            s.domain.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.h1.toLowerCase().includes(q),
        )
      : sites;
    return sortSites(matched, sort);
  }, [sites, query, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadať doménu, názov alebo text…"
            className={`${inputClass} pl-11`}
            aria-label="Hľadať domény"
          />
        </div>

        <div className="flex items-center gap-3 sm:w-auto">
          <label htmlFor="sort" className="shrink-0 text-sm text-zinc-500">
            Zoradiť:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`${inputClass} w-full cursor-pointer sm:w-52`}
          >
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {query ? (
        <p className="text-sm text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "výsledok" : filtered.length < 5 ? "výsledky" : "výsledkov"}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-zinc-500">
              <th className="pb-3 pr-4 font-medium">Doména</th>
              <th className="hidden pb-3 pr-4 font-medium md:table-cell">Nadpis</th>
              <th className="pb-3 pr-4 font-medium">Posledná úprava</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-base text-zinc-500">
                  Žiadna doména nevyhovuje hľadaniu „{query}"
                </td>
              </tr>
            ) : (
              filtered.map((site) => <SiteRow key={site.id} site={site} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}