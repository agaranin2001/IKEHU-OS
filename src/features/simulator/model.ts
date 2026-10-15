/**
 * Energy project simulator: an operating replay of a price series.
 *
 * Every interval is dispatched with simple, transparent rules (no optimisation, no
 * look-ahead). Results are operating margins only; the cost case adds an indicative
 * annualised view that scales the replayed period to 8,760 hours.
 */

export type SimTech = "electrolyser" | "battery" | "solar" | "wind";

export interface PricePoint {
  /** Interval start, ISO UTC. */
  t: string;
  /** Day-ahead price, €/MWh. */
  price: number;
  /** Optional uploaded generation profile, MW (solar / wind only). */
  genMw?: number;
}

export interface SimInputs {
  tech: SimTech;
  /** Electrolyser input, battery power or generator nameplate, MW. */
  capacityMw: number;
  /** Share of capacity available for dispatch, %. */
  availabilityPct: number;
  /** Grid fees and other per-MWh costs on purchased (or exported) energy, €/MWh. */
  gridFeesEurMwh: number;

  /* Electrolyser */
  specificEnergyKwhKg: number;
  auxKwhKg: number;
  h2PriceEurKg: number;
  /** Runs only in intervals where the day-ahead price is at or below this. */
  purchaseCeilingEurMwh: number;

  /* Battery */
  storageMwh: number;
  roundTripPct: number;
  buyBelowEurMwh: number;
  sellAboveEurMwh: number;

  /* Solar / wind */
  capacityFactorPct: number;
  lossesPct: number;
  ppaSharePct: number;
  ppaPriceEurMwh: number;
  curtailNegative: boolean;

  /* Cost case */
  capexEur: number;
  fixedOpexEurYr: number;
}

/** Battery state-of-charge window, as a share of nameplate storage. */
export const SOC_MIN = 0.05;
export const SOC_MAX = 0.95;

export const TECH_LABEL: Record<SimTech, string> = {
  electrolyser: "H₂ electrolyser",
  battery: "Battery",
  solar: "Solar",
  wind: "Onshore wind",
};

const COMMON = {
  availabilityPct: 97,
  specificEnergyKwhKg: 52,
  auxKwhKg: 3,
  h2PriceEurKg: 7,
  purchaseCeilingEurMwh: 80,
  storageMwh: 20,
  roundTripPct: 88,
  buyBelowEurMwh: 60,
  sellAboveEurMwh: 120,
  capacityFactorPct: 11,
  lossesPct: 3,
  ppaSharePct: 0,
  ppaPriceEurMwh: 60,
  curtailNegative: true,
};

/** Starting values per technology. Cost-case figures are illustrative allowances to be replaced. */
export const TECH_DEFAULTS: Record<SimTech, SimInputs> = {
  electrolyser: { ...COMMON, tech: "electrolyser", capacityMw: 20, gridFeesEurMwh: 8, capexEur: 48_000_000, fixedOpexEurYr: 1_440_000 },
  battery: { ...COMMON, tech: "battery", capacityMw: 10, gridFeesEurMwh: 5, capexEur: 6_000_000, fixedOpexEurYr: 120_000 },
  solar: { ...COMMON, tech: "solar", capacityMw: 10, gridFeesEurMwh: 1.5, capacityFactorPct: 11, capexEur: 6_000_000, fixedOpexEurYr: 100_000 },
  wind: { ...COMMON, tech: "wind", capacityMw: 10, gridFeesEurMwh: 1.5, capacityFactorPct: 30, capexEur: 13_000_000, fixedOpexEurYr: 400_000 },
};

export interface SimStep {
  t: string;
  price: number;
  /** Power at the grid connection, MW: + consumption/generation, − battery discharge. */
  mw: number;
  revenue: number;
  energyCost: number;
  gridCost: number;
  margin: number;
  /** Battery state of charge, MWh. */
  socMwh?: number;
  h2Kg?: number;
  curtailedMwh?: number;
}

export interface SimSummary {
  intervals: number;
  hoursPerInterval: number;
  periodHours: number;
  revenue: number;
  energyCost: number;
  gridCost: number;
  margin: number;
  /** Time-weighted market average, min, max, €/MWh. */
  marketAvg: number;
  marketMin: number;
  marketMax: number;
  negativeIntervals: number;
  /** Intervals with non-zero dispatch. */
  activeIntervals: number;
  /** MWh bought (electrolyser, battery charge). */
  boughtMwh: number;
  /** MWh sold (battery discharge, generation). */
  soldMwh: number;
  avgBuyPrice: number | null;
  avgSellPrice: number | null;
  h2Kg: number;
  curtailedMwh: number;
  /** Battery equivalent full cycles over the usable window. */
  cycles: number;
  /** Energy dispatched / (available capacity × period), %. */
  utilisationPct: number;
  /** PPA part of revenue (generators). */
  ppaRevenue: number;
}

export interface CostCase {
  annualisationFactor: number;
  annualMargin: number;
  netOperatingCash: number;
  /** Years, or null if net operating cash is not positive. */
  simplePaybackYears: number | null;
}

export interface SimResult {
  steps: SimStep[];
  summary: SimSummary;
  cost: CostCase;
}

export interface SimIssue {
  field: keyof SimInputs | "prices";
  message: string;
}

export function validateSimInputs(x: SimInputs, prices: PricePoint[]): SimIssue[] {
  const issues: SimIssue[] = [];
  const need = (field: keyof SimInputs, ok: boolean, message: string) => !ok && issues.push({ field, message });
  if (prices.length < 2) issues.push({ field: "prices", message: "Select or upload at least two price intervals." });
  need("capacityMw", x.capacityMw > 0, "Capacity must be above 0 MW.");
  need("availabilityPct", x.availabilityPct > 0 && x.availabilityPct <= 100, "Availability must be between 0 and 100 %.");
  need("gridFeesEurMwh", Number.isFinite(x.gridFeesEurMwh) && x.gridFeesEurMwh >= 0, "Grid costs cannot be negative.");
  need("capexEur", Number.isFinite(x.capexEur) && x.capexEur >= 0, "CAPEX cannot be negative.");
  need("fixedOpexEurYr", Number.isFinite(x.fixedOpexEurYr) && x.fixedOpexEurYr >= 0, "Fixed OPEX cannot be negative.");
  if (x.tech === "electrolyser") {
    need("specificEnergyKwhKg", x.specificEnergyKwhKg >= 33.3, "Specific energy cannot be below 33.3 kWh/kg (hydrogen's higher heating value).");
    need("auxKwhKg", Number.isFinite(x.auxKwhKg) && x.auxKwhKg >= 0, "Auxiliary energy cannot be negative.");
    need("h2PriceEurKg", Number.isFinite(x.h2PriceEurKg) && x.h2PriceEurKg >= 0, "H₂ price cannot be negative.");
    need("purchaseCeilingEurMwh", Number.isFinite(x.purchaseCeilingEurMwh), "Enter a purchase ceiling.");
  }
  if (x.tech === "battery") {
    need("storageMwh", x.storageMwh > 0, "Storage must be above 0 MWh.");
    need("roundTripPct", x.roundTripPct > 0 && x.roundTripPct <= 100, "Round-trip efficiency must be between 0 and 100 %.");
    need("sellAboveEurMwh", x.sellAboveEurMwh > x.buyBelowEurMwh, "Sell threshold must be above the buy threshold.");
  }
  if (x.tech === "solar" || x.tech === "wind") {
    need("capacityFactorPct", x.capacityFactorPct > 0 && x.capacityFactorPct <= 100, "Capacity factor must be between 0 and 100 %.");
    need("lossesPct", x.lossesPct >= 0 && x.lossesPct < 100, "Losses must be between 0 and 100 %.");
    need("ppaSharePct", x.ppaSharePct >= 0 && x.ppaSharePct <= 100, "PPA share must be between 0 and 100 %.");
    need("ppaPriceEurMwh", Number.isFinite(x.ppaPriceEurMwh), "Enter a PPA price.");
  }
  return issues;
}

/** Median spacing between interval starts, in hours (1 for hourly, 0.25 for 15-min). */
export function intervalHours(prices: PricePoint[]): number {
  const gaps: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const g = (Date.parse(prices[i].t) - Date.parse(prices[i - 1].t)) / 3_600_000;
    if (g > 0) gaps.push(g);
  }
  if (!gaps.length) return 1;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

/** Simplified clear-sky solar shape: a sine arc from 05:00 to 19:00 UTC, zero at night. */
export function solarShape(iso: string): number {
  const d = new Date(iso);
  const h = d.getUTCHours() + d.getUTCMinutes() / 60 + 0.5;
  return h > 5 && h < 19 ? Math.sin((Math.PI * (h - 5)) / 14) : 0;
}

/** Generation factor (share of nameplate) per interval, scaled so the period mean equals the capacity factor. */
function generationFactors(x: SimInputs, prices: PricePoint[]): number[] {
  if (prices.every((p) => p.genMw != null)) return prices.map((p) => Math.min(Math.max(p.genMw! / x.capacityMw, 0), 1));
  const shape = prices.map((p) => (x.tech === "solar" ? solarShape(p.t) : 1));
  const mean = shape.reduce((a, b) => a + b, 0) / shape.length;
  const cf = x.capacityFactorPct / 100;
  return shape.map((s) => (mean > 0 ? Math.min((s * cf) / mean, 1) : 0));
}

export function simulate(x: SimInputs, prices: PricePoint[]): SimResult {
  const dt = intervalHours(prices);
  const pAvail = x.capacityMw * (x.availabilityPct / 100);
  const steps: SimStep[] = [];

  if (x.tech === "electrolyser") {
    const kwhKg = x.specificEnergyKwhKg + x.auxKwhKg;
    for (const p of prices) {
      const run = p.price <= x.purchaseCeilingEurMwh;
      const e = run ? pAvail * dt : 0;
      const h2Kg = (e * 1000) / kwhKg;
      const revenue = h2Kg * x.h2PriceEurKg;
      const energyCost = e * p.price;
      const gridCost = e * x.gridFeesEurMwh;
      steps.push({ t: p.t, price: p.price, mw: run ? pAvail : 0, revenue, energyCost, gridCost, margin: revenue - energyCost - gridCost, h2Kg });
    }
  } else if (x.tech === "battery") {
    const eta = Math.sqrt(x.roundTripPct / 100);
    const lo = x.storageMwh * SOC_MIN;
    const hi = x.storageMwh * SOC_MAX;
    let soc = lo;
    for (const p of prices) {
      let mw = 0;
      let revenue = 0;
      let energyCost = 0;
      let gridCost = 0;
      if (p.price >= x.sellAboveEurMwh && soc > lo) {
        const fromStore = Math.min((pAvail * dt) / eta, soc - lo);
        const delivered = fromStore * eta;
        soc -= fromStore;
        mw = -delivered / dt;
        revenue = delivered * p.price;
      } else if (p.price <= x.buyBelowEurMwh && soc < hi) {
        const intoStore = Math.min(pAvail * dt * eta, hi - soc);
        const drawn = intoStore / eta;
        soc += intoStore;
        mw = drawn / dt;
        energyCost = drawn * p.price;
        gridCost = drawn * x.gridFeesEurMwh;
      }
      steps.push({ t: p.t, price: p.price, mw, revenue, energyCost, gridCost, margin: revenue - energyCost - gridCost, socMwh: soc });
    }
  } else {
    const factors = generationFactors(x, prices);
    const share = x.ppaSharePct / 100;
    prices.forEach((p, i) => {
      const net = x.capacityMw * factors[i] * (x.availabilityPct / 100) * (1 - x.lossesPct / 100) * dt;
      const curtail = x.curtailNegative && p.price < 0;
      const sold = curtail ? 0 : net;
      const revenue = sold * (share * x.ppaPriceEurMwh + (1 - share) * p.price);
      const gridCost = sold * x.gridFeesEurMwh;
      steps.push({ t: p.t, price: p.price, mw: sold / dt, revenue, energyCost: 0, gridCost, margin: revenue - gridCost, curtailedMwh: curtail ? net : 0 });
    });
  }

  const summary = summarise(x, steps, dt);
  return { steps, summary, cost: costCase(x, summary) };
}

function summarise(x: SimInputs, steps: SimStep[], dt: number): SimSummary {
  const sum = (f: (s: SimStep) => number) => steps.reduce((a, s) => a + f(s), 0);
  const prices = steps.map((s) => s.price);
  const bought = steps.filter((s) => s.mw > 0 && x.tech !== "solar" && x.tech !== "wind");
  const sold = steps.filter((s) => s.mw < 0 || ((x.tech === "solar" || x.tech === "wind") && s.mw > 0));
  const boughtMwh = bought.reduce((a, s) => a + s.mw * dt, 0);
  const soldMwh = sold.reduce((a, s) => a + Math.abs(s.mw) * dt, 0);
  const periodHours = steps.length * dt;
  const avail = x.capacityMw * (x.availabilityPct / 100) * periodHours;
  const dispatched = x.tech === "electrolyser" ? boughtMwh : soldMwh;
  const share = x.ppaSharePct / 100;
  const ppaRevenue = x.tech === "solar" || x.tech === "wind" ? soldMwh * share * x.ppaPriceEurMwh : 0;
  return {
    intervals: steps.length,
    hoursPerInterval: dt,
    periodHours,
    revenue: sum((s) => s.revenue),
    energyCost: sum((s) => s.energyCost),
    gridCost: sum((s) => s.gridCost),
    margin: sum((s) => s.margin),
    marketAvg: prices.reduce((a, b) => a + b, 0) / Math.max(prices.length, 1),
    marketMin: Math.min(...prices),
    marketMax: Math.max(...prices),
    negativeIntervals: prices.filter((p) => p < 0).length,
    activeIntervals: steps.filter((s) => s.mw !== 0).length,
    boughtMwh,
    soldMwh,
    avgBuyPrice: boughtMwh > 0 ? bought.reduce((a, s) => a + s.mw * dt * s.price, 0) / boughtMwh : null,
    avgSellPrice: soldMwh > 0 ? sum((s) => s.revenue) / soldMwh : null,
    h2Kg: sum((s) => s.h2Kg ?? 0),
    curtailedMwh: sum((s) => s.curtailedMwh ?? 0),
    cycles: x.tech === "battery" ? soldMwh / Math.max(x.storageMwh * (SOC_MAX - SOC_MIN) * Math.sqrt(x.roundTripPct / 100), 1e-9) : 0,
    utilisationPct: avail > 0 ? (dispatched / avail) * 100 : 0,
    ppaRevenue,
  };
}

/** Indicative: scales the replayed period to a year. Excludes financing, tax, degradation and replacements. */
export function costCase(x: SimInputs, s: SimSummary): CostCase {
  const annualisationFactor = s.periodHours > 0 ? 8760 / s.periodHours : 0;
  const annualMargin = s.margin * annualisationFactor;
  const netOperatingCash = annualMargin - x.fixedOpexEurYr;
  return { annualisationFactor, annualMargin, netOperatingCash, simplePaybackYears: netOperatingCash > 0 ? x.capexEur / netOperatingCash : null };
}

/** Price at which one more MWh of electrolysis breaks even: H₂ value per MWh minus grid costs. */
export function electrolyserBreakEven(x: SimInputs): number {
  return (x.h2PriceEurKg * 1000) / (x.specificEnergyKwhKg + x.auxKwhKg) - x.gridFeesEurMwh;
}

/* ------------------------------------------------------------------ */
/* CSV                                                                 */
/* ------------------------------------------------------------------ */

export const MAX_DAYS = 366;

export const CSV_TEMPLATE = [
  "timestamp_utc,price_eur_mwh,generation_mw",
  "2025-06-19T00:00:00Z,42.10,",
  "2025-06-19T01:00:00Z,38.75,",
  "2025-06-19T02:00:00Z,35.20,",
].join("\n");

/**
 * Parses `timestamp_utc, price_eur_mwh[, generation_mw]` (comma or semicolon separated, header
 * optional). Rows are sorted by time; at most MAX_DAYS are accepted.
 */
export function parsePriceCsv(text: string): { points: PricePoint[]; error?: string } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { points: [], error: "The file is empty." };
  const sep = lines[0].includes(";") ? ";" : ",";
  const rows = lines.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")));
  const body = Number.isNaN(Date.parse(rows[0][0])) ? rows.slice(1) : rows;
  const points: PricePoint[] = [];
  for (let i = 0; i < body.length; i++) {
    const [t, price, gen] = body[i];
    const ms = Date.parse(t);
    const v = Number(price?.replace(",", "."));
    if (Number.isNaN(ms) || !Number.isFinite(v)) return { points: [], error: `Row ${i + 1}: expected an ISO timestamp and a numeric price.` };
    const g = gen ? Number(gen.replace(",", ".")) : undefined;
    if (g != null && !Number.isFinite(g)) return { points: [], error: `Row ${i + 1}: generation_mw is not a number.` };
    points.push({ t: new Date(ms).toISOString(), price: v, ...(g != null ? { genMw: g } : {}) });
  }
  if (points.length < 2) return { points: [], error: "At least two price rows are needed." };
  points.sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
  const days = (Date.parse(points.at(-1)!.t) - Date.parse(points[0].t)) / 86_400_000;
  if (days > MAX_DAYS) return { points: [], error: `The file covers ${Math.ceil(days)} days; the limit is ${MAX_DAYS} per run.` };
  // A partially filled generation column is ignored rather than mixed with the illustrative profile.
  if (!points.every((p) => p.genMw != null)) for (const p of points) delete p.genMw;
  return { points };
}

export function stepsToCsv(x: SimInputs, steps: SimStep[]): string {
  const head = ["timestamp_utc", "price_eur_mwh", "power_mw", "revenue_eur", "energy_cost_eur", "grid_cost_eur", "margin_eur"];
  if (x.tech === "electrolyser") head.push("h2_kg");
  if (x.tech === "battery") head.push("soc_mwh");
  if (x.tech === "solar" || x.tech === "wind") head.push("curtailed_mwh");
  const r2 = (v: number) => String(Math.round(v * 100) / 100);
  const rows = steps.map((s) => {
    const row = [s.t, r2(s.price), r2(s.mw), r2(s.revenue), r2(s.energyCost), r2(s.gridCost), r2(s.margin)];
    if (x.tech === "electrolyser") row.push(r2(s.h2Kg ?? 0));
    if (x.tech === "battery") row.push(r2(s.socMwh ?? 0));
    if (x.tech === "solar" || x.tech === "wind") row.push(r2(s.curtailedMwh ?? 0));
    return row.join(",");
  });
  return [head.join(","), ...rows].join("\n");
}
