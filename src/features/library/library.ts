import type { MarketInsight } from "@/domain/types";

/**
 * R&D Library: the sourced market insights presented as articles. Every page
 * is built from the insight record itself — no text beyond the record.
 */

export type LibraryArticle = MarketInsight & { slug: string };

export function toArticle(insight: MarketInsight): LibraryArticle {
  return { ...insight, slug: insight.id.replace(/^ins-/, "") };
}

/** Newest first; month-only dates sort as the first of the month. */
export function sortArticles(items: LibraryArticle[]): LibraryArticle[] {
  const t = (iso: string) => new Date(iso.length === 7 ? `${iso}-01` : iso).getTime();
  return [...items].sort((a, b) => t(b.publishedAt) - t(a.publishedAt));
}

export function libraryHref(a: { slug: string }) {
  return `/library/${a.slug}`;
}

export const CATEGORY_LABEL: Record<MarketInsight["category"], string> = {
  supply: "Supply",
  demand: "Demand",
  cost: "Cost",
  policy: "Policy & funding",
  investment: "Investment",
  technology: "Technology",
  trade: "Trade",
};

/** Where in the product each category of finding can be put to work. */
export const CATEGORY_TOOL: Record<MarketInsight["category"], { href: string; label: string; body: string }> = {
  supply: { href: "/atlas", label: "Open the Project Atlas", body: "See the tracked projects behind the supply picture, by status, technology and country." },
  demand: { href: "/atlas", label: "Open the Project Atlas", body: "Explore the project pipeline and offtake status across tracked hydrogen projects." },
  cost: { href: "/calculator", label: "Run the LCOH calculator", body: "Test these cost levels against your own project assumptions with transparent inputs." },
  policy: { href: "/app/opportunities", label: "Open the Opportunity Radar", body: "Track funding calls, auctions and tenders with deadlines and eligibility." },
  investment: { href: "/app", label: "Open the platform", body: "Screen projects and counterparties against the investment picture." },
  technology: { href: "/app", label: "Open the platform", body: "Compare electrolyser technologies and suppliers with sourced specifications." },
  trade: { href: "/atlas", label: "Open the Project Atlas", body: "Locate export and import projects and the infrastructure they depend on." },
};

/** Publisher marks (files and origins: public/logos/SOURCES.md); others render as a wordmark. */
const PUBLISHER_LOGOS: { match: RegExp; src: string; width: number; height: number }[] = [
  { match: /International Energy Agency/, src: "/logos/iea.svg", width: 120, height: 40 },
  { match: /^European Commission/, src: "/logos/ec.svg", width: 162, height: 40 },
  { match: /European Hydrogen Observatory/, src: "/logos/eho.svg", width: 146, height: 40 },
];

const PUBLISHER_WORDMARK: { match: RegExp; text: string }[] = [
  { match: /ACER/, text: "ACER" },
  { match: /Court of Auditors/, text: "European Court of Auditors" },
  { match: /BloombergNEF/, text: "BloombergNEF" },
];

export function publisherMark(publisher: string): { kind: "logo"; src: string; width: number; height: number } | { kind: "text"; text: string } {
  const logo = PUBLISHER_LOGOS.find((l) => l.match.test(publisher));
  if (logo) return { kind: "logo", src: logo.src, width: logo.width, height: logo.height };
  return { kind: "text", text: PUBLISHER_WORDMARK.find((w) => w.match.test(publisher))?.text ?? publisher };
}

/** Same category first, then the most recent of the rest. */
export function relatedArticles(article: LibraryArticle, all: LibraryArticle[], n = 3): LibraryArticle[] {
  const others = sortArticles(all.filter((a) => a.id !== article.id));
  return [...others.filter((a) => a.category === article.category), ...others.filter((a) => a.category !== article.category)].slice(0, n);
}
