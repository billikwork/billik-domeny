export interface SiteFaq {
  question: string;
  answer: string;
}

export interface SiteBenefit {
  title: string;
  description: string;
}

/**
 * Set when a site no longer offers its service. The site then renders only a notice page
 * (no hero, benefits, FAQ or CTA), is marked noindex and is left out of the sitemap.
 */
export interface SiteClosed {
  heading: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
}

export interface SiteConfig {
  id: string;
  domain: string;
  locale: string;
  language: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  paragraphs: string[];
  benefits: SiteBenefit[];
  faqs: SiteFaq[];
  heroImage: string;
  heroAlt: string;
  ctaText: string;
  ctaUrl: string;
  accentColor: string;
  keywords: string[];
  closed?: SiteClosed;
}