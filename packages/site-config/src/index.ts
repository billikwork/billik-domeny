import type { SiteConfig } from "./types";

import billikCz from "../../../content/sites/billik-cz.json";
import billiktradeEu from "../../../content/sites/billiktrade-eu.json";
import billikweldingEu from "../../../content/sites/billikwelding-eu.json";
import billikweldingSk from "../../../content/sites/billikwelding-sk.json";
import invertoryEu from "../../../content/sites/invertory-eu.json";
import lakovanieEu from "../../../content/sites/lakovanie-eu.json";
import ochrannepracovneprostriedkySk from "../../../content/sites/ochrannepracovneprostriedky-sk.json";
import praskovanieEu from "../../../content/sites/praskovanie-eu.json";
import servoglasSk from "../../../content/sites/servoglas-sk.json";
import servoreEu from "../../../content/sites/servore-eu.json";
import zamocnickvyrobaEu from "../../../content/sites/zamocnickvyroba-eu.json";
import zamocnickvyrobaSk from "../../../content/sites/zamocnickvyroba-sk.json";
import zvaraciatechnikaEu from "../../../content/sites/zvaraciatechnika-eu.json";
import zvaraciestrojeSk from "../../../content/sites/zvaraciestroje-sk.json";
import zvarackyEu from "../../../content/sites/zvaracky-eu.json";

export type { SiteConfig, SiteBenefit, SiteFaq } from "./types";

const sites: SiteConfig[] = [
  billikCz as SiteConfig,
  billiktradeEu as SiteConfig,
  billikweldingEu as SiteConfig,
  billikweldingSk as SiteConfig,
  invertoryEu as SiteConfig,
  lakovanieEu as SiteConfig,
  ochrannepracovneprostriedkySk as SiteConfig,
  praskovanieEu as SiteConfig,
  servoglasSk as SiteConfig,
  servoreEu as SiteConfig,
  zamocnickvyrobaEu as SiteConfig,
  zamocnickvyrobaSk as SiteConfig,
  zvaraciatechnikaEu as SiteConfig,
  zvaraciestrojeSk as SiteConfig,
  zvarackyEu as SiteConfig,
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