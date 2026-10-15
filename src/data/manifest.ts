/**
 * Dataset manifest — bump `version` whenever records in a dataset change.
 * `compiledAt` is the research snapshot date shown beside aggregate metrics.
 */
export const DATASET_MANIFEST = {
  projects: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Curated sample of publicly documented hydrogen production projects, all regions" },
  suppliers: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Selected equipment manufacturers; specifications are vendor claims" },
  opportunities: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Selected EU and national funding calls, auctions and tenders; status as of compile date" },
  companies: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Selected hydrogen value-chain companies with publicly documented deals" },
  investors: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Selected investors and public funders with documented hydrogen investments" },
  insights: { version: "2026.10.1", compiledAt: "2026-10-14", scope: "Headline findings from public reports" },
} as const;
