import { headers } from "next/headers";
import { buildJsonLd } from "@billik/seo";
import { getAllSites, getSiteByHost } from "@billik/site-config";
import { ClosedPage, LandingPage, PreviewPage } from "@billik/ui";
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

  if (site.closed) {
    const requestHost = ((await headers()).get("host") ?? "").toLowerCase().split(":")[0];
    // Show the domain the visitor actually typed, but only if it really belongs to this site.
    const host = getSiteByHost(requestHost)?.id === site.id ? requestHost : site.domain;
    return <ClosedPage site={site} host={host} />;
  }

  const jsonLd = buildJsonLd(site);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={site.heroImage}
        type="image/webp"
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage site={site} />
    </>
  );
}