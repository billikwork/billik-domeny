import Link from "next/link";
import { getAllSites } from "@billik/site-config";
import { AdminShell } from "@/components/admin-shell";

export default function AdminDashboardPage() {
  const sites = getAllSites();

  return (
    <AdminShell
      title="Domény"
      subtitle={`${sites.length} ${sites.length === 1 ? "stránka" : sites.length < 5 ? "stránky" : "stránok"} na správu`}
      sites={sites.map((s) => ({ id: s.id, domain: s.domain, h1: s.h1 }))}
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/sites/${site.id}`}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ffd700]/40 hover:shadow-[0_8px_32px_rgba(255,215,0,0.08)]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="rounded-lg bg-[#ffd700]/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffd700]">
                {site.id}
              </span>
              <span className="text-zinc-500 transition group-hover:text-[#ffd700]" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <p className="text-xl font-semibold text-white group-hover:text-[#ffd700]">
              www.{site.domain}
            </p>
            <p className="mt-3 line-clamp-2 text-base leading-relaxed text-zinc-400">{site.h1}</p>
            <p className="mt-4 text-sm font-medium text-zinc-500 transition group-hover:text-zinc-300">
              Upraviť obsah →
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}