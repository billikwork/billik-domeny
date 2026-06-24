import Link from "next/link";
import { getAllSites } from "@billik/site-config";
import { AdminShell } from "@/components/admin-shell";
import { getPublishMode, getRepoInfo } from "@/lib/github";

export default function AdminDashboardPage() {
  const sites = getAllSites();
  const publishMode = getPublishMode();
  const repo = getRepoInfo();

  return (
    <AdminShell
      title="Domény"
      subtitle={`${sites.length} landing stránok · publish: ${publishMode}`}
    >
      {publishMode === "local" ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Lokálny režim: zmeny sa ukladajú do súborov na disku. Na produkcii nastavte{" "}
          <code className="rounded bg-black/30 px-1">GITHUB_TOKEN</code> pre auto-deploy.
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          GitHub publish: {repo.owner}/{repo.repo}@{repo.branch} — uloženie spustí Vercel redeploy.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/sites/${site.id}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#ffd700]/40 hover:bg-white/[0.05]"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{site.id}</p>
            <p className="mt-2 text-lg font-semibold text-white group-hover:text-[#ffd700]">
              www.{site.domain}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{site.h1}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}