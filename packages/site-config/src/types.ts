export interface SiteFaq {
  question: string;
  answer: string;
}

export interface SiteBenefit {
  title: string;
  description: string;
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
}