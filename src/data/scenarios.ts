import type { EconomicScenario, LcohInputs } from "@/domain/types";
import { BENCHMARKS } from "./benchmarks";

/**
 * Preset LCOH scenarios. Every value is visible in the calculator's
 * assumptions panel — there are no hidden multipliers. Values are
 * illustrative assumptions chosen within the sourced benchmark ranges in
 * src/data/benchmarks.ts; they are NOT project results.
 */

const bm = (id: string) => BENCHMARKS.find((b) => b.id === id)?.source;

export const BASE_INPUTS: LcohInputs = {
  electricityPriceEurMwh: 60,
  gridFeesEurMwh: 8,
  capacityMw: 20,
  technology: "PEM",
  capexEurKw: 2400,
  efficiencyKwhKg: 55,
  operatingHours: 5000,
  fixedOmPct: 3,
  variableOmEurMwh: 1,
  waterLitresPerKg: 17.5,
  waterCostEurM3: 2,
  lifetimeYears: 20,
  discountRatePct: 7,
  stackLifetimeHours: 80000,
  stackReplacementPct: 15,
  degradationPctPer1000h: 0.15,
};

export const SCENARIOS: EconomicScenario[] = [
  {
    id: "conservative",
    name: "Conservative",
    description: "Higher power cost, first-of-a-kind CAPEX, grid-limited utilisation and a higher cost of capital.",
    inputs: {
      ...BASE_INPUTS,
      electricityPriceEurMwh: 75,
      gridFeesEurMwh: 12,
      capexEurKw: 2900,
      efficiencyKwhKg: 57,
      operatingHours: 4000,
      fixedOmPct: 3.5,
      discountRatePct: 9,
      stackLifetimeHours: 60000,
      stackReplacementPct: 20,
      degradationPctPer1000h: 0.19,
    },
    assumptions: [
      { field: "electricityPriceEurMwh", rationale: "Upper range of recent Central European monthly day-ahead averages (see Energy Markets)." },
      { field: "capexEurKw", rationale: "Above the 2024 European average installed cost, reflecting first-of-a-kind and small-scale risk.", source: bm("bm-capex-pem-europe") },
      { field: "efficiencyKwhKg", rationale: "Above the 2020 state-of-the-art PEM figure to allow for balance-of-plant and part-load losses.", source: bm("bm-efficiency-pem") },
      { field: "operatingHours", rationale: "Operation restricted to lower-priced hours and grid availability (~46 % capacity factor)." },
      { field: "degradationPctPer1000h", rationale: "Upper end of the PEM degradation range.", source: bm("bm-degradation-pem") },
      { field: "discountRatePct", rationale: "Merchant risk without long-term offtake; above the 8 % sensitivity case.", source: bm("bm-wacc-eho") },
    ],
  },
  {
    id: "base",
    name: "Base case",
    description: "Grid-connected PEM plant buying day-ahead power, priced at European 2024 installed-cost levels.",
    inputs: BASE_INPUTS,
    assumptions: [
      { field: "electricityPriceEurMwh", rationale: "Between recent Nordic and German monthly day-ahead averages." },
      { field: "capexEurKw", rationale: "Between the 2024 European average installed cost for alkaline (2,310 €/kW) and PEM (2,503 €/kW).", source: bm("bm-capex-pem-europe") },
      { field: "efficiencyKwhKg", rationale: "2020 state-of-the-art PEM system consumption.", source: bm("bm-efficiency-pem") },
      { field: "fixedOmPct", rationale: "IEA assumption for water electrolysis.", source: bm("bm-fixed-om-iea") },
      { field: "waterLitresPerKg", rationale: "PEM process water incl. treatment.", source: bm("bm-water-pem") },
      { field: "operatingHours", rationale: "~57 % capacity factor, avoiding the most expensive hours." },
      { field: "discountRatePct", rationale: "Between the 6 % default and 8 % sensitivity case.", source: bm("bm-wacc-eho") },
    ],
  },
  {
    id: "optimistic",
    name: "Optimistic",
    description: "Low-cost renewable supply, scaled manufacturing CAPEX and contracted offtake lowering financing cost.",
    inputs: {
      ...BASE_INPUTS,
      electricityPriceEurMwh: 40,
      gridFeesEurMwh: 5,
      capexEurKw: 1500,
      efficiencyKwhKg: 52,
      operatingHours: 6000,
      fixedOmPct: 2.5,
      discountRatePct: 6,
      stackLifetimeHours: 95000,
      stackReplacementPct: 12,
      degradationPctPer1000h: 0.12,
    },
    assumptions: [
      { field: "electricityPriceEurMwh", rationale: "Long-term wind/hydro PPA in a low-price Nordic bidding zone." },
      { field: "capexEurKw", rationale: "Assumes large plant and serial manufacturing; below today's European average — a forward-looking assumption, not an observed price.", source: bm("bm-capex-electrolysis-global-iea") },
      { field: "efficiencyKwhKg", rationale: "2024 PEM target value.", source: bm("bm-efficiency-pem") },
      { field: "stackLifetimeHours", rationale: "Upper end of the stack lifetime range.", source: bm("bm-stack-lifetime-iea") },
      { field: "operatingHours", rationale: "~68 % capacity factor with firmed renewable supply." },
      { field: "discountRatePct", rationale: "Investment-grade offtaker and public support.", source: bm("bm-wacc-eho") },
    ],
  },
];
