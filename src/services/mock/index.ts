/**
 * Mock data providers backed by the versioned local datasets in src/data.
 * They implement the same contracts as the HTTP providers, including async
 * behaviour and simulated latency, so loading states are exercised.
 */
import { ENV } from "@/config/env";
import type { DatasetInfo } from "@/domain/types";
import { BENCHMARKS } from "@/data/benchmarks";
import { COMPANIES } from "@/data/companies";
import { BIDDING_ZONES, HOURLY_SAMPLES, MONTHLY_PRICES, PRICE_DATASET_INFO } from "@/data/electricity-prices";
import { INSIGHTS } from "@/data/insights";
import { INVESTORS } from "@/data/investors";
import { DATASET_MANIFEST } from "@/data/manifest";
import { OPPORTUNITIES } from "@/data/opportunities";
import { PROJECTS } from "@/data/projects";
import { SCENARIOS } from "@/data/scenarios";
import { SUPPLIERS } from "@/data/suppliers";
import { WORKSPACE_DEMO } from "@/data/workspace-demo";
import { filterCompanies, filterInvestors, filterOpportunities, filterProducts, filterProjects, filterSuppliers } from "@/lib/filters";
import type { DataServices } from "../contracts";

const delay = <T,>(value: T, ms = ENV.mockLatencyMs): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), typeof window === "undefined" ? 0 : ms));

const info = (key: keyof typeof DATASET_MANIFEST, recordCount: number): DatasetInfo => ({
  ...DATASET_MANIFEST[key],
  recordCount,
  origin: "sourced",
});

const ref = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const allProducts = () =>
  SUPPLIERS.flatMap((s) => s.products.map((p) => ({ ...p, supplierName: s.companyName, supplierCountry: s.country })));

export const mockServices: DataServices = {
  projects: {
    list: (q) => delay(filterProjects(PROJECTS, q)),
    get: (id) => delay(PROJECTS.find((p) => p.id === id) ?? null),
    info: () => delay(info("projects", PROJECTS.length), 0),
  },
  suppliers: {
    list: (q) => delay(filterSuppliers(SUPPLIERS, q)),
    get: (id) => delay(SUPPLIERS.find((s) => s.id === id) ?? null),
    products: (q) => delay(filterProducts(allProducts(), q)),
    info: () => delay(info("suppliers", SUPPLIERS.length), 0),
  },
  procurement: {
    requestQuote: (req) => {
      if (!req.productIds.length) return Promise.reject(new Error("Select at least one product."));
      return delay({ reference: ref("RFQ"), transmitted: false as const, createdAt: new Date().toISOString() }, 700);
    },
  },
  companies: {
    list: (q) => delay(filterCompanies(COMPANIES, q)),
    get: (id) => delay(COMPANIES.find((c) => c.id === id) ?? null),
  },
  investors: {
    list: (q) => delay(filterInvestors(INVESTORS, q)),
    get: (id) => delay(INVESTORS.find((i) => i.id === id) ?? null),
  },
  opportunities: {
    list: (q) => delay(filterOpportunities(OPPORTUNITIES, q)),
    get: (id) => delay(OPPORTUNITIES.find((o) => o.id === id) ?? null),
    info: () => delay(info("opportunities", OPPORTUNITIES.length), 0),
  },
  insights: { list: () => delay(INSIGHTS) },
  benchmarks: { list: () => delay(BENCHMARKS) },
  energy: {
    zones: () => delay(BIDDING_ZONES),
    monthly: (zones) => delay(zones?.length ? MONTHLY_PRICES.filter((s) => zones.includes(s.biddingZone)) : MONTHLY_PRICES),
    hourlySamples: () => delay(HOURLY_SAMPLES),
    info: () => delay(PRICE_DATASET_INFO, 0),
  },
  scenarios: { presets: () => delay(SCENARIOS, 0) },
  workspace: { snapshot: () => delay(WORKSPACE_DEMO) },
  leads: {
    submitDemoRequest: () => delay({ reference: ref("DEMO"), transmitted: false as const }, 800),
  },
};
