/**
 * Demo estimates for values the sources don't disclose. Each filler returns the
 * record with gaps filled and the filled field names listed in `estimated`, so
 * the UI can mark them (<Estimate>) and aggregates can keep treating them as
 * undisclosed. Values are deterministic per record id and derived from the
 * record's own facts where possible (e.g. output ⇄ capacity at 55 kWh/kg).
 *
 * Switch off in one place: set ESTIMATES_ENABLED to false.
 */
import type { Company, EquipmentProduct, HydrogenProject, Investor, MoneyAmount, Opportunity, ProductionTechnology, PublicDeal, TechnologySupplier } from "@/domain/types";
import { SNAPSHOT_DATE } from "@/lib/format";

export const ESTIMATES_ENABLED = true;

const SEC_KWH_PER_KG = 55;
const FULL_LOAD_HOURS = 5000;
const SNAPSHOT_YEAR = Number(SNAPSHOT_DATE.slice(0, 4));

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic 0–1 value for a record id + field. */
const rand = (id: string, field: string) => (hash(`${id}:${field}`) % 100000) / 100000;
const between = (id: string, field: string, lo: number, hi: number) => lo + rand(id, field) * (hi - lo);
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

function addDays(iso: string, days: number) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const ELECTROLYTIC: ProductionTechnology[] = ["PEM", "Alkaline", "SOEC", "AEM"];

/** Projects: technology, electrolyser capacity, H₂ output, commissioning, FID and investment. */
export function estimateProject(p: HydrogenProject): HydrogenProject {
  if (!ESTIMATES_ENABLED) return p;
  const out: HydrogenProject = { ...p };
  const est: string[] = [];
  const green = p.pathway === "green";

  if (green && p.technology === "Undisclosed") {
    out.technology = rand(p.id, "tech") < 0.55 ? "PEM" : "Alkaline";
    est.push("technology");
  }
  const electrolytic = green && (ELECTROLYTIC.includes(out.technology) || out.technology === "Undisclosed");

  if (electrolytic && p.capacityMw == null) {
    out.capacityMw =
      p.hydrogenOutputTpa != null
        ? Math.max(5, roundTo((p.hydrogenOutputTpa * 1000 * SEC_KWH_PER_KG) / 1000 / FULL_LOAD_HOURS, 5))
        : roundTo(between(p.id, "mw", 20, 320), 5);
    est.push("capacityMw");
  }
  if (p.hydrogenOutputTpa == null && out.capacityMw != null && electrolytic) {
    out.hydrogenOutputTpa = roundTo((out.capacityMw * FULL_LOAD_HOURS) / SEC_KWH_PER_KG, 10);
    est.push("hydrogenOutputTpa");
  }
  if (p.expectedCommissioning == null && p.status !== "cancelled") {
    const ahead = p.status === "operational" ? 0 : p.status === "under-construction" ? 1 + Math.floor(rand(p.id, "cod") * 2) : 2 + Math.floor(rand(p.id, "cod") * 4);
    out.expectedCommissioning = p.status === "operational" ? `${Math.min(SNAPSHOT_YEAR, Math.max(p.announcedYear + 2, SNAPSHOT_YEAR - 1))} (achieved)` : String(SNAPSHOT_YEAR + ahead);
    est.push("expectedCommissioning");
  }
  if (p.finalInvestmentDecision == null) {
    out.finalInvestmentDecision = p.status === "operational" || p.status === "under-construction";
    est.push("finalInvestmentDecision");
  }
  if (p.investment == null && out.capacityMw != null) {
    // ~€2.0–3.2m per MW all-in for electrolytic plants.
    out.investment = { amount: roundTo(out.capacityMw * between(p.id, "capex", 2.0, 3.2) * 1e6, 1e6), currency: "EUR" } satisfies MoneyAmount;
    est.push("investment");
  }
  return est.length ? { ...out, estimated: [...(p.estimated ?? []), ...est] } : p;
}

/** Opportunities: budget and (for open/upcoming calls) deadline. */
export function estimateOpportunity(o: Opportunity): Opportunity {
  if (!ESTIMATES_ENABLED) return o;
  const out: Opportunity = { ...o };
  const est: string[] = [];
  if (o.budget == null) {
    const range: [number, number] =
      o.type === "public-tender" ? [0.4, 12] : o.type === "innovation-grant" ? [2, 25] : o.type === "partnership" ? [1, 10] : [20, 400];
    const m = between(o.id, "budget", range[0], range[1]);
    out.budget = { amount: roundTo(m * 1e6, m < 5 ? 1e5 : 1e6), currency: "EUR" };
    est.push("budget");
  }
  if (o.deadline == null && (o.status === "open" || o.status === "upcoming")) {
    out.deadline = addDays(SNAPSHOT_DATE, 20 + Math.floor(rand(o.id, "deadline") * 100));
    est.push("deadline");
  }
  return est.length ? { ...out, estimated: [...(o.estimated ?? []), ...est] } : o;
}

/** Companies: founding year and deal amounts. */
export function estimateCompany(c: Company): Company {
  if (!ESTIMATES_ENABLED) return c;
  const deals = c.deals.map((d) => estimateDeal(d));
  if (c.founded != null) return { ...c, deals };
  return { ...c, deals, founded: 2004 + Math.floor(rand(c.id, "founded") * 18), estimated: [...(c.estimated ?? []), "founded"] };
}

/** Typical system-level ranges per electrolyser technology. */
const ELECTROLYSER_SPECS: Partial<Record<EquipmentProduct["category"], { sec: [number, number]; bar: number[]; mw: [number, number] }>> = {
  "pem-electrolyser": { sec: [52, 56], bar: [30, 35], mw: [1, 20] },
  "alkaline-electrolyser": { sec: [50, 54], bar: [1, 16, 30], mw: [2, 20] },
  "soec-electrolyser": { sec: [39, 42], bar: [1], mw: [0.5, 5] },
  "aem-electrolyser": { sec: [52, 56], bar: [35], mw: [0.5, 2] },
};

/** Equipment products: electrolyser capacity, efficiency, output pressure and warranty. Prices are never estimated. */
export function estimateProduct<T extends EquipmentProduct>(pr: T): T {
  const spec = ELECTROLYSER_SPECS[pr.category];
  if (!ESTIMATES_ENABLED || !spec) return pr;
  const out: T = { ...pr };
  const est: string[] = [];
  if (pr.capacity == null) {
    const mw = between(pr.id, "mw", spec.mw[0], spec.mw[1]);
    out.capacity = { value: mw < 2 ? Math.round(mw * 10) / 10 : Math.round(mw), unit: "MW" };
    est.push("capacity");
  }
  if (pr.efficiencyKwhPerKg == null) {
    out.efficiencyKwhPerKg = Math.round(between(pr.id, "sec", spec.sec[0], spec.sec[1]) * 10) / 10;
    est.push("efficiencyKwhPerKg");
  }
  if (pr.outputPressureBar == null) {
    out.outputPressureBar = spec.bar[Math.floor(rand(pr.id, "bar") * spec.bar.length)];
    est.push("outputPressureBar");
  }
  if (pr.warranty == null) {
    out.warranty = rand(pr.id, "warranty") < 0.5 ? "2 years" : "3 years";
    est.push("warranty");
  }
  return est.length ? { ...out, estimated: [...(pr.estimated ?? []), ...est] } : pr;
}

/** Suppliers: founding year and product specs. */
export function estimateSupplier(s: TechnologySupplier): TechnologySupplier {
  if (!ESTIMATES_ENABLED) return s;
  const products = s.products.map((p) => estimateProduct(p));
  if (s.founded != null) return { ...s, products };
  return { ...s, products, founded: 1995 + Math.floor(rand(s.id, "founded") * 25), estimated: [...(s.estimated ?? []), "founded"] };
}

const DEAL_RANGE: Record<PublicDeal["kind"], [number, number]> = {
  equity: [5, 80],
  debt: [20, 300],
  grant: [1, 50],
  acquisition: [20, 400],
  "joint-venture": [10, 150],
  partnership: [1, 20],
  offtake: [10, 200],
  "supply-contract": [5, 120],
};

/** Deals (company deals, investor investments): amount. */
export function estimateDeal<T extends PublicDeal>(d: T): T {
  if (!ESTIMATES_ENABLED || d.amount != null) return d;
  const [lo, hi] = DEAL_RANGE[d.kind] ?? [5, 50];
  const m = between(d.id, "amount", lo, hi);
  return { ...d, amount: { amount: roundTo(m * 1e6, m < 10 ? 1e5 : 1e6), currency: "EUR" }, estimated: [...(d.estimated ?? []), "amount"] };
}

export const estimateInvestor = (i: Investor): Investor => (ESTIMATES_ENABLED ? { ...i, publicInvestments: i.publicInvestments.map((d) => estimateDeal(d)) } : i);
