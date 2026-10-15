/**
 * Repository contracts — the only way UI code reads or writes data.
 *
 * Two implementations exist:
 *   - services/mock  : local, versioned datasets (src/data) with simulated latency
 *   - services/http  : REST client for the future platform API
 *
 * Swap providers with NEXT_PUBLIC_DATA_PROVIDER; components do not change.
 */
import type {
  Benchmark,
  BiddingZone,
  Company,
  DatasetInfo,
  EconomicScenario,
  EndUse,
  EquipmentCategory,
  EquipmentProduct,
  HydrogenProject,
  Investor,
  InvestorType,
  MarketInsight,
  Opportunity,
  OpportunityStatus,
  OpportunityType,
  PriceSeries,
  ProductionPathway,
  ProductionTechnology,
  ProjectStatus,
  RegionCode,
  TechnologySupplier,
  WorkspaceMilestone,
  WorkspaceRisk,
  WorkspaceTask,
} from "@/domain/types";

export interface ProjectQuery {
  search?: string;
  regions?: RegionCode[];
  countries?: string[];
  statuses?: ProjectStatus[];
  technologies?: ProductionTechnology[];
  pathways?: ProductionPathway[];
  endUses?: EndUse[];
  developer?: string;
  minMw?: number;
  maxMw?: number;
  announcedFrom?: number;
  announcedTo?: number;
  fidOnly?: boolean;
  sort?: "capacity-desc" | "capacity-asc" | "name" | "announced-desc";
}

export interface ProjectRepository {
  list(query?: ProjectQuery): Promise<HydrogenProject[]>;
  get(id: string): Promise<HydrogenProject | null>;
  info(): Promise<DatasetInfo>;
}

export interface SupplierQuery {
  search?: string;
  categories?: EquipmentCategory[];
  countries?: string[];
  priceAvailability?: "public" | "quotation";
}

export interface SupplierRepository {
  list(query?: SupplierQuery): Promise<TechnologySupplier[]>;
  get(id: string): Promise<TechnologySupplier | null>;
  products(query?: SupplierQuery): Promise<(EquipmentProduct & { supplierName: string; supplierCountry: string })[]>;
  info(): Promise<DatasetInfo>;
}

export interface QuoteRequest {
  productIds: string[];
  company: string;
  email: string;
  projectSizeMw?: number;
  timeline?: string;
  message?: string;
}

export interface QuoteRequestResult {
  reference: string;
  /** Demo only: requests are not transmitted to suppliers in this phase. */
  transmitted: false;
  createdAt: string;
}

export interface ProcurementRepository {
  requestQuote(req: QuoteRequest): Promise<QuoteRequestResult>;
}

export interface CompanyRepository {
  list(query?: { search?: string; categories?: Company["categories"] }): Promise<Company[]>;
  get(id: string): Promise<Company | null>;
}

export interface InvestorRepository {
  list(query?: { search?: string; types?: InvestorType[] }): Promise<Investor[]>;
  get(id: string): Promise<Investor | null>;
}

export interface OpportunityQuery {
  search?: string;
  types?: OpportunityType[];
  statuses?: OpportunityStatus[];
  countries?: string[];
  technology?: string;
  deadlineBefore?: string;
}

export interface OpportunityRepository {
  list(query?: OpportunityQuery): Promise<Opportunity[]>;
  get(id: string): Promise<Opportunity | null>;
  info(): Promise<DatasetInfo>;
}

export interface InsightRepository {
  list(): Promise<MarketInsight[]>;
}

export interface BenchmarkRepository {
  list(): Promise<Benchmark[]>;
}

export interface EnergyMarketRepository {
  zones(): Promise<BiddingZone[]>;
  monthly(zones?: string[]): Promise<PriceSeries[]>;
  hourlySamples(): Promise<{ id: string; label: string; date: string; series: PriceSeries[] }[]>;
  info(): Promise<{ compiledAt: string; coverage: string; notes: string }>;
}

export interface ScenarioRepository {
  presets(): Promise<EconomicScenario[]>;
}

export interface WorkspaceRepository {
  snapshot(): Promise<{
    projectName: string;
    tasks: WorkspaceTask[];
    risks: WorkspaceRisk[];
    milestones: WorkspaceMilestone[];
    budget: {
      line: string;
      budgetEur: number;
      committedEur: number;
      /** Suppliers engaged on the line; `supplierId` links to the supplier catalogue. Empty when not yet sourced. */
      suppliers: { name: string; supplierId?: string }[];
      /** Next commitment deadline for the line. */
      deadline: { date: string; label: string };
      /** Itemised breakdown; sums to the line totals. */
      items: { item: string; budgetEur: number; committedEur: number }[];
    }[];
    documents: { id: string; title: string; type: string; updated: string; status: string }[];
    suppliers: { name: string; scope: string; status: string }[];
  }>;
}

export interface DemoRequest {
  name: string;
  email: string;
  company: string;
  role: string;
  interest: string[];
  message?: string;
}

export interface LeadRepository {
  submitDemoRequest(req: DemoRequest): Promise<{ reference: string; transmitted: false }>;
}

export interface DataServices {
  projects: ProjectRepository;
  suppliers: SupplierRepository;
  procurement: ProcurementRepository;
  companies: CompanyRepository;
  investors: InvestorRepository;
  opportunities: OpportunityRepository;
  insights: InsightRepository;
  benchmarks: BenchmarkRepository;
  energy: EnergyMarketRepository;
  scenarios: ScenarioRepository;
  workspace: WorkspaceRepository;
  leads: LeadRepository;
}
