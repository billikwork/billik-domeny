import { notFound } from "next/navigation";
import { getSiteById } from "@billik/site-config";
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

  return (
    <AdminShell
      title={`www.${site.domain}`}
      subtitle="Úprava textov, obrázkov a SEO nastavení"
    >
      <SiteEditor initial={site} />
    </AdminShell>
  );
}