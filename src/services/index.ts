/**
 * Service locator. Components import `services` from here and never touch a
 * provider directly. Select the provider with NEXT_PUBLIC_DATA_PROVIDER.
 */
import { ENV } from "@/config/env";
import type { DataServices } from "./contracts";
import { httpServices } from "./http";
import { mockServices } from "./mock";
import { estimateCompany, estimateInvestor, estimateOpportunity, estimateProduct, estimateProject, estimateSupplier } from "@/lib/estimates";

/**
 * Fills undisclosed values with marked estimates (lib/estimates.ts) on the way
 * out. Provider-side filtering and sorting still run on sourced values only.
 */
function withEstimates(base: DataServices): DataServices {
  return {
    ...base,
    projects: { ...base.projects, list: async (q) => (await base.projects.list(q)).map(estimateProject), get: async (id) => mapOrNull(await base.projects.get(id), estimateProject) },
    opportunities: {
      ...base.opportunities,
      list: async (q) => (await base.opportunities.list(q)).map(estimateOpportunity),
      get: async (id) => mapOrNull(await base.opportunities.get(id), estimateOpportunity),
    },
    companies: { ...base.companies, list: async (q) => (await base.companies.list(q)).map(estimateCompany), get: async (id) => mapOrNull(await base.companies.get(id), estimateCompany) },
    investors: { ...base.investors, list: async (q) => (await base.investors.list(q)).map(estimateInvestor), get: async (id) => mapOrNull(await base.investors.get(id), estimateInvestor) },
    suppliers: {
      ...base.suppliers,
      list: async (q) => (await base.suppliers.list(q)).map(estimateSupplier),
      get: async (id) => mapOrNull(await base.suppliers.get(id), estimateSupplier),
      products: async (q) => (await base.suppliers.products(q)).map((p) => estimateProduct(p)),
    },
  };
}
const mapOrNull = <T,>(v: T | null, f: (v: T) => T) => (v == null ? v : f(v));

export const services: DataServices = withEstimates(ENV.dataProvider === "http" ? httpServices : mockServices);
export type * from "./contracts";
