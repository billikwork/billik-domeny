import type { Metadata } from "next";
import type { SiteConfig } from "@billik/site-config";

function siteIconPath(site: SiteConfig, isPreview: boolean) {
  const base = isPreview ? `/favicon.ico?site=${site.id}` : "/favicon.ico";
  return {
    icon: [
      { url: base, type: "image/svg+xml" },
      { url: isPreview ? `/icon?site=${site.id}` : "/icon", type: "image/svg+xml", sizes: "32x32" },
    ],
    apple: isPreview ? `/apple-icon?site=${site.id}` : "/apple-icon",
    shortcut: base,
  };
}

export function buildMetadata(site: SiteConfig, options?: { isPreview?: boolean }): Metadata {
  const url = `https://www.${site.domain}`;
  const isPreview = options?.isPreview ?? false;

  return {
    title: site.title,
    description: site.description,
    keywords: site.keywords,
    alternates: { canonical: url },
    icons: siteIconPath(site, isPreview),
    openGraph: {
      title: site.title,
      description: site.description,
      url,
      siteName: "Billik Trade s.r.o.",
      locale: site.locale,
      type: "website",
      images: [
        {
          url: site.heroImage,
          width: 1200,
          height: 630,
          alt: site.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [site.heroImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildJsonLd(site: SiteConfig) {
  const url = `https://www.${site.domain}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Billik Trade s.r.o.",
        url: "https://www.billik.sk",
        logo: "https://www.billik.sk/favicon.ico",
        sameAs: ["https://www.billik.sk"],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Priemyselná 4",
          addressLocality: "Nitra",
          postalCode: "949 01",
          addressCountry: "SK",
        },
        telephone: "+4213776522106",
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: site.title,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: site.language,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: site.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}