/**
 * Levelised Cost of Hydrogen (LCOH) — transparent, testable frontend model.
 *
 * METHOD (discounted levelised cost, real terms)
 *
 *            CAPEX₀ + Σₜ (OPEXₜ + REPLₜ) / (1 + r)ᵗ
 *   LCOH  =  ───────────────────────────────────────      [€/kg H₂]
 *                    Σₜ  H₂ₜ / (1 + r)ᵗ
 *
 *   t = 1 … N operating years, CAPEX₀ spent at t = 0.
 *   Capital recovery is captured ONCE by discounting the production
 *   denominator. Financing cost is the discount rate (WACC) — it is not
 *   added again as an interest line. The capital recovery factor (CRF) is
 *   reported for reference only (equivalent annuity) and never added on top.
 *
 *   Electricity:   P[MW] × hours × (energy price + grid fees)  [€/yr]
 *   Production:    P[MW] × hours × 1000 / SECₜ                  [kg/yr]
 *   SECₜ:          SEC₀ × (1 + d × hours since stack change / 1000 / 100)
 *                  — constant-power operation, so degradation lowers output
 *                    rather than raising electricity use.
 *   Stack change:  each time cumulative hours cross a multiple of the stack
 *                  lifetime (not in the final year), costing x% of CAPEX₀.
 *   Fixed O&M:     % of CAPEX₀ per year.
 *   Variable O&M:  €/MWh of electricity consumed (excl. energy & water).
 *   Water:         litres/kg × kg/1000 × €/m³.
 *
 * SCOPE: plant-gate production cost. Excludes compression, storage,
 * transport, land, grid connection capex (unless included in €/kW), taxes,
 * subsidies and by-product revenues (oxygen, heat).
 */

import type { LcohBreakdown, LcohInputs, LcohResult } from "@/domain/types";

export const HOURS_PER_YEAR = 8760;
/** Higher heating value of hydrogen — thermodynamic floor for SEC. */
export const H2_HHV_KWH_PER_KG = 39.41;
/** Lower electricity bound for SOEC, where external heat covers part of the energy demand. */
export const SOEC_MIN_SEC = 30;

export interface ValidationIssue {
  field: keyof LcohInputs;
  message: string;
}

const LIMITS: Partial<Record<keyof LcohInputs, [number, number, string]>> = {
  electricityPriceEurMwh: [-500, 1000, "€/MWh"],
  gridFeesEurMwh: [0, 300, "€/MWh"],
  capacityMw: [0.1, 10000, "MW"],
  capexEurKw: [100, 10000, "€/kW"],
  efficiencyKwhKg: [H2_HHV_KWH_PER_KG, 90, "kWh/kg"],
  operatingHours: [1, HOURS_PER_YEAR, "h/yr"],
  fixedOmPct: [0, 15, "%"],
  variableOmEurMwh: [0, 50, "€/MWh"],
  waterLitresPerKg: [0, 100, "L/kg"],
  waterCostEurM3: [0, 50, "€/m³"],
  lifetimeYears: [1, 40, "years"],
  discountRatePct: [0, 30, "%"],
  stackLifetimeHours: [1000, 200000, "h"],
  stackReplacementPct: [0, 100, "%"],
  degradationPctPer1000h: [0, 2, "%/1000 h"],
};

/** Returns validation issues; an empty array means the inputs are usable. */
export function validateLcohInputs(inputs: LcohInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [field, [baseMin, max, unit]] of Object.entries(LIMITS) as [keyof LcohInputs, [number, number, string]][]) {
    // SOEC can use less electricity than the HHV because steam/heat supplies part of the energy.
    const min = field === "efficiencyKwhKg" && inputs.technology === "SOEC" ? SOEC_MIN_SEC : baseMin;
    const value = inputs[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push({ field, message: "Enter a number." });
    } else if (value < min || value > max) {
      const extra =
        field === "efficiencyKwhKg" && value < min && inputs.technology !== "SOEC"
          ? ` Below the hydrogen HHV (${H2_HHV_KWH_PER_KG} kWh/kg) is physically impossible.`
          : "";
      issues.push({ field, message: `Must be between ${min} and ${max} ${unit}.${extra}` });
    }
  }
  return issues;
}

/** Capital recovery factor for rate r (fraction) over n years. */
export function capitalRecoveryFactor(rate: number, years: number): number {
  if (years <= 0) return 0;
  if (rate === 0) return 1 / years;
  const g = Math.pow(1 + rate, years);
  return (rate * g) / (g - 1);
}

export interface YearRow {
  year: number;
  hours: number;
  avgSecKwhKg: number;
  productionKg: number;
  electricityMwh: number;
  electricityEur: number;
  fixedOmEur: number;
  variableOmEur: number;
  waterEur: number;
  replacementEur: number;
  discountFactor: number;
}

/** Year-by-year operating profile — exposed for tables and exports. */
export function buildCashflow(i: LcohInputs): YearRow[] {
  const capex0 = i.capexEurKw * i.capacityMw * 1000;
  const r = i.discountRatePct / 100;
  const hours = Math.min(Math.max(i.operatingHours, 0), HOURS_PER_YEAR);
  const rows: YearRow[] = [];
  let hoursSinceChange = 0;

  for (let year = 1; year <= i.lifetimeYears; year++) {
    // Average degradation over this year's operating hours (linear).
    const start = hoursSinceChange;
    const end = hoursSinceChange + hours;
    let avgFactor: number;
    let replacementEur = 0;

    const crossesStackLife = end >= i.stackLifetimeHours && year < i.lifetimeYears;
    if (crossesStackLife) {
      // Split the year: hours before the change degrade from `start`,
      // hours after the change start fresh from zero.
      const before = Math.max(i.stackLifetimeHours - start, 0);
      const after = hours - before;
      const degBefore = 1 + (i.degradationPctPer1000h / 100) * ((start + i.stackLifetimeHours) / 2 / 1000);
      const degAfter = 1 + (i.degradationPctPer1000h / 100) * (after / 2 / 1000);
      avgFactor = hours > 0 ? (degBefore * before + degAfter * after) / hours : 1;
      hoursSinceChange = after;
      replacementEur = (i.stackReplacementPct / 100) * capex0;
    } else {
      avgFactor = 1 + (i.degradationPctPer1000h / 100) * ((start + end) / 2 / 1000);
      hoursSinceChange = end;
    }

    const avgSec = i.efficiencyKwhKg * avgFactor;
    const electricityMwh = i.capacityMw * hours;
    const productionKg = avgSec > 0 ? (electricityMwh * 1000) / avgSec : 0;

    rows.push({
      year,
      hours,
      avgSecKwhKg: avgSec,
      productionKg,
      electricityMwh,
      electricityEur: electricityMwh * (i.electricityPriceEurMwh + i.gridFeesEurMwh),
      fixedOmEur: (i.fixedOmPct / 100) * capex0,
      variableOmEur: electricityMwh * i.variableOmEurMwh,
      waterEur: ((productionKg * i.waterLitresPerKg) / 1000) * i.waterCostEurM3,
      replacementEur,
      discountFactor: 1 / Math.pow(1 + r, year),
    });
  }
  return rows;
}

/** Core LCOH calculation. Pure — no side effects, no rounding. */
export function calculateLcoh(i: LcohInputs): LcohResult {
  const warnings: string[] = [];
  const capex0 = i.capexEurKw * i.capacityMw * 1000;
  const rows = buildCashflow(i);
  const r = i.discountRatePct / 100;

  let pvProd = 0;
  const pv = { electricity: 0, fixedOm: 0, variableOm: 0, water: 0, replacement: 0 };
  let sumProd = 0;
  let sumElec = 0;
  let sumOpex = 0;
  let replacements = 0;

  for (const row of rows) {
    const df = row.discountFactor;
    pvProd += row.productionKg * df;
    pv.electricity += row.electricityEur * df;
    pv.fixedOm += row.fixedOmEur * df;
    pv.variableOm += row.variableOmEur * df;
    pv.water += row.waterEur * df;
    pv.replacement += row.replacementEur * df;
    sumProd += row.productionKg;
    sumElec += row.electricityMwh;
    sumOpex += row.electricityEur + row.fixedOmEur + row.variableOmEur + row.waterEur;
    if (row.replacementEur > 0) replacements++;
  }

  const n = Math.max(rows.length, 1);
  const per = (x: number) => (pvProd > 0 ? x / pvProd : 0);
  const breakdown: LcohBreakdown = {
    capexEurKg: per(capex0),
    stackReplacementEurKg: per(pv.replacement),
    fixedOmEurKg: per(pv.fixedOm),
    electricityEurKg: per(pv.electricity),
    variableOmEurKg: per(pv.variableOm),
    waterEurKg: per(pv.water),
  };
  const lcoh = Object.values(breakdown).reduce((a, b) => a + b, 0);

  if (i.operatingHours < 2000) warnings.push("Below ~2,000 full-load hours, capital cost dominates and LCOH rises steeply.");
  if (i.electricityPriceEurMwh < 0) warnings.push("A negative average electricity price is only realistic for a few hours per year, not as an annual average.");
  if (i.stackLifetimeHours < i.operatingHours) warnings.push("Stack lifetime is shorter than one year of operation — more than one replacement per year is not modelled.");
  if (i.technology === "SOEC") warnings.push("SOEC electricity consumption assumes an external steam/heat supply, which is not costed in this model.");
  if (i.technology !== "SOEC" && i.efficiencyKwhKg < 47) warnings.push("System SEC below ~47 kWh/kg is better than most published system-level figures for PEM/alkaline; check whether the value excludes balance of plant.");

  return {
    lcohEurKg: lcoh,
    breakdown,
    annualProductionT: sumProd / n / 1000,
    annualElectricityMwh: sumElec / n,
    avgEfficiencyKwhKg: sumProd > 0 ? (sumElec * 1000) / sumProd : i.efficiencyKwhKg,
    initialCapexEur: capex0,
    crf: capitalRecoveryFactor(r, i.lifetimeYears),
    annualisedCapexEur: capex0 * capitalRecoveryFactor(r, i.lifetimeYears),
    annualOpexEur: sumOpex / n,
    stackReplacements: replacements,
    discountedProductionKg: pvProd,
    capacityFactorPct: (Math.min(i.operatingHours, HOURS_PER_YEAR) / HOURS_PER_YEAR) * 100,
    warnings,
  };
}

/** Electricity-only cost component, €/kg — useful for market screens. */
export function electricityCostPerKg(priceEurMwh: number, secKwhKg: number): number {
  return (priceEurMwh * secKwhKg) / 1000;
}
