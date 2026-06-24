import type { SiteConfig } from "./types";

import billikCz from "../../../content/sites/billik-cz.json";
import billiktradeEu from "../../../content/sites/billiktrade-eu.json";
import billikweldingEu from "../../../content/sites/billikwelding-eu.json";
import billikweldingSk from "../../../content/sites/billikwelding-sk.json";
import invertoryEu from "../../../content/sites/invertory-eu.json";
import lakovanieEu from "../../../content/sites/lakovanie-eu.json";
import ochrannepracovneprostriedkySk from "../../../content/sites/ochrannepracovneprostriedky-sk.json";

export type { SiteConfig, SiteBenefit, SiteFaq } from "./types";

const sites: SiteConfig[] = [
  billikCz as SiteConfig,
  billiktradeEu as SiteConfig,
  billikweldingEu as SiteConfig,
  billikweldingSk as SiteConfig,
  invertoryEu as SiteConfig,
  lakovanieEu as SiteConfig,
  ochrannepracovneprostriedkySk as SiteConfig,
];

const domainMap = new Map<string, SiteConfig>();

for (const site of sites) {
  domainMap.set(site.domain, site);
  domainMap.set(`www.${site.domain}`, site);
}

export function getAllSites(): SiteConfig[] {
  return sites;
}

export function getSiteByHost(host: string): SiteConfig | null {
  const normalized = host.toLowerCase().split(":")[0];
  return domainMap.get(normalized) ?? null;
}

export function getSiteById(id: string): SiteConfig | null {
  return sites.find((site) => site.id === id) ?? null;
}