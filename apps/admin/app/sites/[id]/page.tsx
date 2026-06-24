import { notFound } from "next/navigation";
import { getAllSites, getSiteById } from "@billik/site-config";
import { AdminShell } from "@/components/admin-shell";
import { SiteEditor } from "@/components/site-editor";
import { readSiteConfig } from "@/lib/github";

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const known = getSiteById(id);
  if (!known) notFound();

  let site = known;
  try {
    site = await readSiteConfig(id);
  } catch {
    site = known;
  }

  const sites = getAllSites();

  return (
    <AdminShell
      title={`www.${site.domain}`}
      subtitle="Úprava textov, obrázkov a SEO nastavení"
      sites={sites.map((s) => ({ id: s.id, domain: s.domain, h1: s.h1 }))}
    >
      <SiteEditor initial={site} />
    </AdminShell>
  );
}