import { buildJsonLd } from "@billik/seo";
import { getAllSites } from "@billik/site-config";
import { LandingPage, PreviewPage } from "@billik/ui";
import { getCurrentSite, isLocalPreview } from "@/lib/get-site";

export default async function Home() {
  const showPreview = await isLocalPreview();

  if (showPreview) {
    return <PreviewPage sites={getAllSites()} />;
  }

  const site = await getCurrentSite();

  if (!site) {
    return <PreviewPage sites={getAllSites()} />;
  }

  const jsonLd = buildJsonLd(site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage site={site} />
    </>
  );
}