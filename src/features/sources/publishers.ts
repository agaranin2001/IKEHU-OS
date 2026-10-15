/** Pure aggregation of source publishers across all sourced datasets. */
import type { Company, HydrogenProject, Investor, MarketInsight, Opportunity, SourceRef, TechnologySupplier } from "@/domain/types";

export type PublisherDataset = "projects" | "suppliers" | "opportunities" | "companies" | "investors" | "insights";

export const PUBLISHER_DATASET_LABEL: Record<PublisherDataset, string> = {
  projects: "Projects",
  suppliers: "Suppliers",
  opportunities: "Opportunities",
  companies: "Companies",
  investors: "Investors",
  insights: "Insights",
};

export interface PublisherRow {
  publisher: string;
  /** Records citing this publisher at least once (record-level, not per citation). */
  records: number;
  /** Distinct source documents (URLs) from this publisher. */
  documents: number;
  byDataset: Partial<Record<PublisherDataset, number>>;
}

export interface PublisherInput {
  projects: HydrogenProject[];
  suppliers: TechnologySupplier[];
  opportunities: Opportunity[];
  companies: Company[];
  investors: Investor[];
  insights: MarketInsight[];
}

const clean = (p: string) => p.replace(/\s+/g, " ").trim();

/**
 * Counts, for every publisher, how many records cite it. Nested sources
 * (product datasheets, deal announcements) count towards their parent record.
 */
export function aggregatePublishers(input: PublisherInput): PublisherRow[] {
  const map = new Map<string, { records: number; docs: Set<string>; byDataset: Partial<Record<PublisherDataset, number>> }>();
  const addRecord = (dataset: PublisherDataset, sources: SourceRef[]) => {
    const seen = new Set<string>();
    for (const s of sources) {
      const name = clean(s.publisher || "Unknown publisher");
      let row = map.get(name);
      if (!row) map.set(name, (row = { records: 0, docs: new Set(), byDataset: {} }));
      row.docs.add(s.url);
      if (seen.has(name)) continue;
      seen.add(name);
      row.records++;
      row.byDataset[dataset] = (row.byDataset[dataset] ?? 0) + 1;
    }
  };
  for (const r of input.projects) addRecord("projects", r.sources);
  for (const r of input.suppliers) addRecord("suppliers", [...r.sources, ...r.products.map((p) => p.source)]);
  for (const r of input.opportunities) addRecord("opportunities", r.sources);
  for (const r of input.companies) addRecord("companies", [...r.sources, ...r.deals.map((d) => d.source)]);
  for (const r of input.investors) addRecord("investors", [...r.sources, ...r.publicInvestments.map((d) => d.source)]);
  for (const r of input.insights) addRecord("insights", r.sources);

  return [...map.entries()]
    .map(([publisher, v]) => ({ publisher, records: v.records, documents: v.docs.size, byDataset: v.byDataset }))
    .sort((a, b) => b.records - a.records || b.documents - a.documents || a.publisher.localeCompare(b.publisher));
}
