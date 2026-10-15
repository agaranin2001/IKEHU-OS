/**
 * Domain data contracts for the Hydrogen Intelligence & Engineering OS.
 *
 * These interfaces are the boundary between the UI and any data provider
 * (local mock datasets today, remote APIs later). UI components must only
 * depend on these types — never on the shape of a specific backend.
 */

/* ------------------------------------------------------------------ */
/* Provenance                                                          */
/* ------------------------------------------------------------------ */

/** How much the platform trusts a record. */
export type VerificationStatus =
  /** Confirmed against a primary source (developer, regulator, official portal). */
  | "verified"
  /** Core facts confirmed, some fields from secondary reporting. */
  | "partially-verified"
  /** Figures are the manufacturer's own claims, not independently tested. */
  | "vendor-claim"
  /** Not yet confirmed — shown with a warning. */
  | "unverified";

export type Confidence = "high" | "medium" | "low";

/** Distinguishes real-world sourced data from demonstration data. */
export type DataOrigin = "sourced" | "demo";

export interface SourceRef {
  /** Canonical URL of the source document. */
  url: string;
  /** Human-readable title of the page or document. */
  title: string;
  /** Publishing organisation, e.g. "European Commission". */
  publisher: string;
  /** ISO date (YYYY-MM-DD or YYYY-MM) the source was published, if known. */
  publishedAt?: string;
}

export interface RecordProvenance {
  sources: SourceRef[];
  /** ISO date the record was last checked against its sources. */
  verifiedAt: string;
  verification: VerificationStatus;
  confidence: Confidence;
  /** Free-text caveats, e.g. "capacity refers to phase 1 only". */
  notes?: string;
  /**
   * Fields whose values were filled in as estimates because the source does not
   * disclose them (see lib/estimates.ts). The UI marks them with <Estimate>;
   * aggregates treat them as undisclosed.
   */
  estimated?: string[];
}

export interface MoneyAmount {
  amount: number;
  currency: "EUR" | "USD" | "GBP" | "SEK" | "NOK" | "DKK" | "AUD" | "CNY" | "INR" | "SAR" | "JPY" | "CAD" | "CLP" | "EGP" | "OMR";
  /** What the figure covers, e.g. "total project cost incl. ammonia plant". */
  scope?: string;
}

export interface GeoPoint {
  lat: number;
  lon: number;
  /** Human-readable location, e.g. "Boden, Norrbotten". */
  label: string;
  /** "exact" = site coordinates; "approximate" = town/region centroid. */
  precision: "exact" | "approximate";
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type ProjectStatus =
  | "announced"
  | "planned"
  | "under-construction"
  | "operational"
  | "delayed"
  | "cancelled";

export type ProductionPathway = "green" | "blue" | "low-carbon-grid" | "other";

export type ProductionTechnology =
  | "PEM"
  | "Alkaline"
  | "SOEC"
  | "AEM"
  | "SMR+CCS"
  | "ATR+CCS"
  | "Mixed"
  | "Undisclosed";

export type EndUse =
  | "ammonia"
  | "methanol"
  | "refining"
  | "steel"
  | "mobility"
  | "e-fuels"
  | "chemicals"
  | "power"
  | "export"
  | "grid-injection"
  | "industrial-heat";

export type RegionCode =
  | "Europe"
  | "Middle East"
  | "Africa"
  | "Asia-Pacific"
  | "North America"
  | "Latin America";

export interface HydrogenProject extends RecordProvenance {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  countryName: string;
  region: RegionCode;
  location: GeoPoint;
  developer: string;
  partners: string[];
  technology: ProductionTechnology;
  pathway: ProductionPathway;
  /** e.g. "Wind + solar PPA", "Grid electricity", "Natural gas". */
  feedstock: string;
  /** Electrolyser stack supplier, if publicly disclosed. */
  electrolyserSupplier?: string;
  /**
   * Electrolyser input capacity in MW (electrical). Null for non-electrolytic
   * projects or where undisclosed. Never a power-generation capacity.
   */
  capacityMw: number | null;
  /** Hydrogen output in tonnes per year, where disclosed. */
  hydrogenOutputTpa: number | null;
  endUses: EndUse[];
  status: ProjectStatus;
  /** Short explanation of current status, e.g. "FID taken March 2024". */
  statusNote: string;
  finalInvestmentDecision: boolean | null;
  /** Year the project was first publicly announced. */
  announcedYear: number;
  /** Developer's stated commissioning target (string to allow "2027" / "H2 2026"). */
  expectedCommissioning: string | null;
  investment: MoneyAmount | null;
  /** Grants / loans / public support publicly disclosed. */
  publicSupport?: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Suppliers & equipment                                               */
/* ------------------------------------------------------------------ */

export type EquipmentCategory =
  | "pem-electrolyser"
  | "alkaline-electrolyser"
  | "soec-electrolyser"
  | "aem-electrolyser"
  | "fuel-cell"
  | "compressor"
  | "storage"
  | "purification"
  | "water-treatment"
  | "power-electronics"
  | "renewable-power"
  | "pipeline-distribution"
  | "safety-monitoring";

export interface SpecValue {
  label: string;
  value: string;
  unit?: string;
  /** Spec values from datasheets are vendor claims unless stated. */
  basis: "vendor-claim" | "independently-tested" | "derived";
}

export interface PublicPrice {
  amount: number;
  currency: MoneyAmount["currency"];
  unit: string;
  source: SourceRef;
}

export interface EquipmentProduct {
  id: string;
  supplierId: string;
  model: string;
  category: EquipmentCategory;
  description: string;
  /** Rated capacity, e.g. { value: 20, unit: "MW" } or { value: 4000, unit: "Nm³/h" }. */
  capacity: { value: number; unit: string; note?: string } | null;
  /** Specific energy consumption at system level, kWh/kg H₂ (lower is better). */
  efficiencyKwhPerKg: number | null;
  /** Hydrogen output pressure in bar(g), if stated. */
  outputPressureBar: number | null;
  specs: SpecValue[];
  standards: string[];
  warranty: string | null;
  /** Only populated when a public source discloses a price. */
  publicPrice: PublicPrice | null;
  quotationRequired: boolean;
  source: SourceRef;
  verifiedAt: string;
  /** Fields filled in as estimates (see lib/estimates.ts). */
  estimated?: string[];
}

export interface TechnologySupplier extends RecordProvenance {
  id: string;
  companyName: string;
  country: string;
  countryName: string;
  headquarters: string;
  categories: EquipmentCategory[];
  description: string;
  website: string;
  /** e.g. "Listed (XETRA: NCH2)" / "Private" / "Subsidiary of Siemens Energy". */
  ownership: string;
  founded: number | null;
  /** Publicly stated manufacturing capacity, e.g. "1 GW/yr (Dortmund)". */
  manufacturingCapacity?: string;
  products: EquipmentProduct[];
}

/* ------------------------------------------------------------------ */
/* Investors, companies & deals                                        */
/* ------------------------------------------------------------------ */

export type InvestorType =
  | "venture-capital"
  | "corporate-venture"
  | "infrastructure-fund"
  | "private-equity"
  | "development-finance"
  | "public-fund"
  | "strategic";

export interface PublicDeal {
  id: string;
  /** Counterparty / target. */
  counterparty: string;
  year: number;
  kind: "equity" | "debt" | "grant" | "acquisition" | "joint-venture" | "partnership" | "offtake" | "supply-contract";
  description: string;
  amount: MoneyAmount | null;
  source: SourceRef;
  /** Fields filled in as estimates (see lib/estimates.ts). */
  estimated?: string[];
}

export interface Investor extends RecordProvenance {
  id: string;
  name: string;
  type: InvestorType;
  headquarters: string;
  country: string;
  geography: string[];
  investmentFocus: string[];
  stages: string[];
  description: string;
  officialUrl: string;
  /** Hydrogen-related investments that are publicly documented. */
  publicInvestments: PublicDeal[];
  /** Fund size or programme volume, only if publicly stated. */
  fundSize?: MoneyAmount;
}

export type CompanyCategory =
  | "electrolyser-manufacturer"
  | "fuel-cell-manufacturer"
  | "storage-transport"
  | "epc-contractor"
  | "project-developer"
  | "technology-startup"
  | "industrial-offtaker";

export interface Company extends RecordProvenance {
  id: string;
  name: string;
  categories: CompanyCategory[];
  country: string;
  countryName: string;
  headquarters: string;
  founded: number | null;
  ownership: string;
  technologyFocus: string[];
  description: string;
  website: string;
  /** Publicly documented deals: partnerships, investments, JVs, acquisitions. */
  deals: PublicDeal[];
  /** Links to supplier record when the company also appears in the catalogue. */
  supplierId?: string;
}

/* ------------------------------------------------------------------ */
/* Opportunities                                                       */
/* ------------------------------------------------------------------ */

export type OpportunityType =
  | "public-tender"
  | "eu-funding"
  | "national-fund"
  | "innovation-grant"
  | "auction"
  | "public-financing"
  | "partnership";

export type OpportunityStatus = "open" | "upcoming" | "closed" | "historical";

export interface Opportunity extends RecordProvenance {
  id: string;
  title: string;
  type: OpportunityType;
  /** ISO country code, or "EU" / "EEA" / "INT" for multi-country. */
  country: string;
  countryName: string;
  organization: string;
  /** Programme or framework, e.g. "Innovation Fund", "Horizon Europe — Clean Hydrogen Partnership". */
  programme: string;
  publishedAt: string | null;
  /** ISO date-time or date of submission deadline. Null if rolling. */
  deadline: string | null;
  status: OpportunityStatus;
  budget: MoneyAmount | null;
  /** Indicative max per project, if stated. */
  maxPerProject?: MoneyAmount | null;
  technologies: string[];
  eligibility: string[];
  requirements: string[];
  /** Documents typically requested in the application. */
  requiredDocuments: string[];
  summary: string;
  officialUrl: string;
}

/* ------------------------------------------------------------------ */
/* Market insights & benchmarks                                        */
/* ------------------------------------------------------------------ */

export interface MarketInsight extends RecordProvenance {
  id: string;
  title: string;
  category: "supply" | "demand" | "cost" | "policy" | "investment" | "technology" | "trade";
  region: string;
  summary: string;
  /** Headline figure quoted from the source. */
  metric?: { value: string; label: string };
  publishedAt: string;
  publisher: string;
}

/** A sourced benchmark range used to sanity-check user inputs. */
export interface Benchmark {
  id: string;
  parameter: string;
  unit: string;
  low: number;
  central?: number;
  high: number;
  scope: string;
  year: number;
  source: SourceRef;
}

/* ------------------------------------------------------------------ */
/* Energy prices                                                       */
/* ------------------------------------------------------------------ */

export interface BiddingZone {
  code: string;
  name: string;
  country: string;
  countryName: string;
  market: string;
}

export interface EnergyPrice {
  id: string;
  market: string;
  biddingZone: string;
  /** ISO timestamp marking the start of the period. */
  timestamp: string;
  priceEurPerMwh: number;
  dataSource: string;
  /** Resolution of the record. */
  dataPeriod: "hourly" | "daily" | "monthly" | "annual";
}

export interface PriceSeries {
  biddingZone: string;
  resolution: EnergyPrice["dataPeriod"];
  /** Start timestamps, ISO. */
  points: { t: string; v: number }[];
  source: SourceRef;
  retrievedAt: string;
  origin: DataOrigin;
}

/* ------------------------------------------------------------------ */
/* Economics                                                           */
/* ------------------------------------------------------------------ */

export type ElectrolyserTech = "PEM" | "Alkaline" | "SOEC" | "AEM";

/** All inputs to the LCOH model. Units are fixed and noted per field. */
export interface LcohInputs {
  /** Electricity price, €/MWh. */
  electricityPriceEurMwh: number;
  /** Grid fees and levies on top of the energy price, €/MWh. */
  gridFeesEurMwh: number;
  /** Electrolyser nameplate input capacity, MW(e). */
  capacityMw: number;
  technology: ElectrolyserTech;
  /** Installed system CAPEX (stack + BoP + EPC), €/kW(e). */
  capexEurKw: number;
  /** System specific energy consumption at beginning of life, kWh/kg H₂. */
  efficiencyKwhKg: number;
  /** Full-load-equivalent operating hours per year, h. */
  operatingHours: number;
  /** Fixed O&M as % of initial CAPEX per year. */
  fixedOmPct: number;
  /** Variable O&M (excl. electricity & water), €/MWh(e) consumed. */
  variableOmEurMwh: number;
  /** Water consumption, litres per kg H₂. */
  waterLitresPerKg: number;
  /** Water cost incl. treatment, €/m³. */
  waterCostEurM3: number;
  /** Plant economic lifetime, years. */
  lifetimeYears: number;
  /** Real discount rate (WACC), % per year. */
  discountRatePct: number;
  /** Stack lifetime in operating hours before replacement. */
  stackLifetimeHours: number;
  /** Stack replacement cost as % of initial CAPEX. */
  stackReplacementPct: number;
  /** Efficiency degradation, % per 1,000 operating hours (reset on stack replacement). */
  degradationPctPer1000h: number;
}

export interface LcohBreakdown {
  capexEurKg: number;
  stackReplacementEurKg: number;
  fixedOmEurKg: number;
  electricityEurKg: number;
  variableOmEurKg: number;
  waterEurKg: number;
}

export interface LcohResult {
  lcohEurKg: number;
  breakdown: LcohBreakdown;
  /** Average annual hydrogen production over lifetime, t/yr. */
  annualProductionT: number;
  /** Average annual electricity consumption, MWh/yr. */
  annualElectricityMwh: number;
  /** Average effective specific consumption incl. degradation, kWh/kg. */
  avgEfficiencyKwhKg: number;
  /** Initial investment, €. */
  initialCapexEur: number;
  /** Capital recovery factor used for annualisation. */
  crf: number;
  annualisedCapexEur: number;
  /** Annual OPEX incl. electricity, € (average over lifetime). */
  annualOpexEur: number;
  /** Number of stack replacements over lifetime. */
  stackReplacements: number;
  /** Discounted lifetime production, kg (denominator). */
  discountedProductionKg: number;
  capacityFactorPct: number;
  warnings: string[];
}

export interface EconomicScenario {
  id: string;
  name: string;
  description: string;
  inputs: LcohInputs;
  /** Each assumption shown to the user, with its origin. */
  assumptions: { field: keyof LcohInputs; rationale: string; source?: SourceRef }[];
}

/* ------------------------------------------------------------------ */
/* Demo workspace (project delivery preview)                           */
/* ------------------------------------------------------------------ */

export interface WorkspaceTask {
  id: string;
  title: string;
  phase: "Feasibility" | "Pre-FEED" | "FEED" | "Procurement" | "Construction" | "Commissioning";
  owner: string;
  due: string;
  status: "done" | "in-progress" | "blocked" | "todo";
}

export interface WorkspaceRisk {
  id: string;
  title: string;
  category: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
  owner: string;
}

export interface WorkspaceMilestone {
  id: string;
  title: string;
  date: string;
  status: "done" | "upcoming" | "at-risk";
}

/* ------------------------------------------------------------------ */
/* Generic async state                                                  */
/* ------------------------------------------------------------------ */

export interface DatasetInfo {
  /** Dataset version, bumped whenever the records change. */
  version: string;
  /** Date the dataset snapshot was compiled. */
  compiledAt: string;
  scope: string;
  recordCount: number;
  origin: DataOrigin;
}
