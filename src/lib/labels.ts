import type {
  CompanyCategory,
  EndUse,
  EquipmentCategory,
  InvestorType,
  OpportunityStatus,
  OpportunityType,
  ProductionPathway,
  ProjectStatus,
  VerificationStatus,
} from "@/domain/types";

type Tone = "ok" | "warn" | "bad" | "info" | "violet" | "neutral";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone; color: string; order: number }> = {
  operational: { label: "Operational", tone: "ok", color: "#16825f", order: 0 },
  "under-construction": { label: "Under construction", tone: "violet", color: "#7c18d3", order: 1 },
  planned: { label: "Planned", tone: "info", color: "#2b7bd6", order: 2 },
  announced: { label: "Announced", tone: "neutral", color: "#8b9593", order: 3 },
  delayed: { label: "Delayed / paused", tone: "warn", color: "#c47a0f", order: 4 },
  cancelled: { label: "Cancelled", tone: "bad", color: "#d04a3a", order: 5 },
};

export const PATHWAY: Record<ProductionPathway, string> = {
  green: "Renewable (electrolytic)",
  blue: "Fossil + CCS",
  "low-carbon-grid": "Grid electrolysis",
  other: "Other",
};

export const END_USE: Record<EndUse, string> = {
  ammonia: "Ammonia",
  methanol: "Methanol",
  refining: "Refining",
  steel: "Steel",
  mobility: "Mobility",
  "e-fuels": "e-Fuels",
  chemicals: "Chemicals",
  power: "Power",
  export: "Export",
  "grid-injection": "Grid injection",
  "industrial-heat": "Industrial heat",
};

export const EQUIPMENT_CATEGORY: Record<EquipmentCategory, string> = {
  "pem-electrolyser": "PEM electrolysers",
  "alkaline-electrolyser": "Alkaline electrolysers",
  "soec-electrolyser": "Solid oxide electrolysers",
  "aem-electrolyser": "AEM electrolysers",
  "fuel-cell": "Fuel cells",
  compressor: "Compressors",
  storage: "Storage vessels",
  purification: "Purification",
  "water-treatment": "Water treatment",
  "power-electronics": "Power electronics",
  "renewable-power": "Renewable power",
  "pipeline-distribution": "Pipelines & distribution",
  "safety-monitoring": "Safety & monitoring",
};

export const OPPORTUNITY_TYPE: Record<OpportunityType, string> = {
  "public-tender": "Public tender",
  "eu-funding": "EU funding",
  "national-fund": "National fund",
  "innovation-grant": "Innovation grant",
  auction: "Auction",
  "public-financing": "Public financing",
  partnership: "Partnership",
};

export const OPPORTUNITY_STATUS: Record<OpportunityStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "ok" },
  upcoming: { label: "Upcoming", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
  historical: { label: "Historical example", tone: "neutral" },
};

export const INVESTOR_TYPE: Record<InvestorType, string> = {
  "venture-capital": "Venture capital",
  "corporate-venture": "Corporate venture",
  "infrastructure-fund": "Infrastructure fund",
  "private-equity": "Private equity",
  "development-finance": "Development finance",
  "public-fund": "Public fund",
  strategic: "Strategic investor",
};

export const COMPANY_CATEGORY: Record<CompanyCategory, string> = {
  "electrolyser-manufacturer": "Electrolyser manufacturer",
  "fuel-cell-manufacturer": "Fuel-cell manufacturer",
  "storage-transport": "Storage & transport",
  "epc-contractor": "EPC contractor",
  "project-developer": "Project developer",
  "technology-startup": "Technology start-up",
  "industrial-offtaker": "Industrial offtaker",
};

export const VERIFICATION: Record<VerificationStatus, { label: string; tone: Tone; help: string }> = {
  verified: { label: "Verified", tone: "ok", help: "Confirmed against a primary source." },
  "partially-verified": { label: "Partially verified", tone: "info", help: "Core facts confirmed; some fields from secondary reporting." },
  "vendor-claim": { label: "Vendor claim", tone: "warn", help: "Figures published by the manufacturer, not independently tested." },
  unverified: { label: "Unverified", tone: "bad", help: "Not yet confirmed against a source." },
};

export type { Tone };
