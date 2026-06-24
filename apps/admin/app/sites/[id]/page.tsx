import { notFound } from "next/navigation";
import { getSiteById } from "@billik/site-config";
import { AdminShell } from "@/components/admin-shell";
import { SiteEditor } from "@/components/site-editor";
import { readSiteConfig } from "@/lib/github";
import { getSitesForDashboard } from "@/lib/sites-meta";

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

  const sites = await getSitesForDashboard();

  return (
    <AdminShell
      title={`www.${site.domain}`}
      subtitle="Úprava textov, obrázkov a SEO nastavení"
      sites={sites}
    >
      <SiteEditor initial={site} />
    </AdminShell>
  );
}