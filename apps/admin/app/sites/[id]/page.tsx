import { notFound } from "next/navigation";
import { getSiteById } from "@billik/site-config";
import { AdminShell } from "@/components/admin-shell";
import { SiteEditor } from "@/components/site-editor";

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) notFound();

  return (
    <AdminShell
      title={`www.${site.domain}`}
      subtitle="Úprava textov, obrázkov a SEO nastavení"
    >
      <SiteEditor initial={site} />
    </AdminShell>
  );
}