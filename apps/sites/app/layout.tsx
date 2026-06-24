import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { buildMetadata } from "@billik/seo";
import { getCurrentSite, isPreviewDeployment } from "@/lib/get-site";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const isPreview = await isPreviewDeployment();
  const site = await getCurrentSite();

  if (isPreview) {
    if (site) {
      return {
        ...buildMetadata(site, { isPreview: true }),
        title: `Náhľad: ${site.title}`,
        robots: { index: false, follow: false },
      };
    }
    return {
      title: "Náhľad stránok | Billik Trade",
      robots: { index: false, follow: false },
    };
  }

  if (!site) {
    return { title: "Billik Trade" };
  }

  return buildMetadata(site);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getCurrentSite();
  const lang = site?.language ?? "sk";

  return (
    <html lang={lang} className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}