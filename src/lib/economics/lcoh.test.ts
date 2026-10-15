import { describe, expect, it } from "vitest";
import type { LcohInputs } from "@/domain/types";
import { buildCashflow, calculateLcoh, capitalRecoveryFactor, electricityCostPerKg, validateLcohInputs } from "./lcoh";
import { sweep, tornado } from "./sensitivity";

/** Simple case with no degradation, no replacements, no fees. */
const SIMPLE: LcohInputs = {
  electricityPriceEurMwh: 50,
  gridFeesEurMwh: 0,
  capacityMw: 10,
  technology: "PEM",
  capexEurKw: 1000,
  efficiencyKwhKg: 50,
  operatingHours: 5000,
  fixedOmPct: 0,
  variableOmEurMwh: 0,
  waterLitresPerKg: 0,
  waterCostEurM3: 0,
  lifetimeYears: 20,
  discountRatePct: 0,
  stackLifetimeHours: 200000,
  stackReplacementPct: 0,
  degradationPctPer1000h: 0,
};

describe("capitalRecoveryFactor", () => {
  it("is 1/n at zero rate", () => {
    expect(capitalRecoveryFactor(0, 20)).toBeCloseTo(0.05, 10);
  });
  it("matches the textbook value for 8 % over 20 years", () => {
    expect(capitalRecoveryFactor(0.08, 20)).toBeCloseTo(0.10185, 4);
  });
});

describe("calculateLcoh", () => {
  it("electricity component equals price × SEC / 1000", () => {
    const r = calculateLcoh(SIMPLE);
    expect(r.breakdown.electricityEurKg).toBeCloseTo(2.5, 10); // 50 €/MWh × 50 kWh/kg
    expect(electricityCostPerKg(50, 50)).toBeCloseTo(2.5, 10);
  });

  it("annual production = MW × h × 1000 / SEC", () => {
    const r = calculateLcoh(SIMPLE);
    expect(r.annualProductionT).toBeCloseTo((10 * 5000 * 1000) / 50 / 1000, 6); // 1,000 t
    expect(r.annualElectricityMwh).toBeCloseTo(50000, 6);
  });

  it("undiscounted capex component = CAPEX / lifetime production", () => {
    const r = calculateLcoh(SIMPLE);
    // 10 M€ / (1,000,000 kg × 20 yr) = 0.5 €/kg
    expect(r.breakdown.capexEurKg).toBeCloseTo(0.5, 10);
    expect(r.lcohEurKg).toBeCloseTo(3.0, 10);
  });

  it("with constant output, discounted method equals CRF annuity (no double counting)", () => {
    const i = { ...SIMPLE, discountRatePct: 8 };
    const r = calculateLcoh(i);
    const annualKg = 1_000_000;
    const expectedCapex = (10_000_000 * capitalRecoveryFactor(0.08, 20)) / annualKg;
    expect(r.breakdown.capexEurKg).toBeCloseTo(expectedCapex, 8);
    // Electricity cost per kg is unaffected by discounting when constant.
    expect(r.breakdown.electricityEurKg).toBeCloseTo(2.5, 8);
    expect(r.lcohEurKg).toBeCloseTo(expectedCapex + 2.5, 8);
  });

  it("fixed O&M as % of capex per year", () => {
    const r = calculateLcoh({ ...SIMPLE, fixedOmPct: 2 });
    // 200 k€/yr / 1,000 t = 0.2 €/kg
    expect(r.breakdown.fixedOmEurKg).toBeCloseTo(0.2, 10);
  });

  it("water cost from litres per kg and €/m³", () => {
    const r = calculateLcoh({ ...SIMPLE, waterLitresPerKg: 20, waterCostEurM3: 2 });
    expect(r.breakdown.waterEurKg).toBeCloseTo(0.04, 10);
  });

  it("grid fees add linearly to electricity cost", () => {
    const r = calculateLcoh({ ...SIMPLE, gridFeesEurMwh: 10 });
    expect(r.breakdown.electricityEurKg).toBeCloseTo(3.0, 10);
  });

  it("schedules stack replacements on cumulative hours, not in the final year", () => {
    // 5,000 h/yr × 20 yr = 100,000 h; stack life 40,000 h → changes in years 8 and 16.
    const rows = buildCashflow({ ...SIMPLE, stackLifetimeHours: 40000, stackReplacementPct: 20 });
    const years = rows.filter((x) => x.replacementEur > 0).map((x) => x.year);
    expect(years).toEqual([8, 16]);
    const r = calculateLcoh({ ...SIMPLE, stackLifetimeHours: 40000, stackReplacementPct: 20 });
    expect(r.stackReplacements).toBe(2);
    // 2 × 2 M€ / 20,000 t undiscounted = 0.2 €/kg
    expect(r.breakdown.stackReplacementEurKg).toBeCloseTo(0.2, 10);
  });

  it("degradation lowers output and raises average SEC", () => {
    const r = calculateLcoh({ ...SIMPLE, degradationPctPer1000h: 0.1 });
    expect(r.avgEfficiencyKwhKg).toBeGreaterThan(50);
    expect(r.annualProductionT).toBeLessThan(1000);
    expect(r.lcohEurKg).toBeGreaterThan(3.0);
  });

  it("breakdown sums to the total", () => {
    const r = calculateLcoh({ ...SIMPLE, discountRatePct: 7, fixedOmPct: 2.5, waterLitresPerKg: 15, waterCostEurM3: 2, stackLifetimeHours: 60000, stackReplacementPct: 15, degradationPctPer1000h: 0.12, variableOmEurMwh: 1 });
    const sum = Object.values(r.breakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(r.lcohEurKg, 10);
  });
});

describe("validateLcohInputs", () => {
  it("accepts reasonable inputs", () => {
    expect(validateLcohInputs(SIMPLE)).toEqual([]);
  });
  it("rejects SEC below the HHV of hydrogen", () => {
    const issues = validateLcohInputs({ ...SIMPLE, efficiencyKwhKg: 35 });
    expect(issues.map((x) => x.field)).toContain("efficiencyKwhKg");
  });
  it("allows SOEC below the HHV (external heat) but not below 30 kWh/kg", () => {
    expect(validateLcohInputs({ ...SIMPLE, technology: "SOEC", efficiencyKwhKg: 38 })).toEqual([]);
    expect(validateLcohInputs({ ...SIMPLE, technology: "SOEC", efficiencyKwhKg: 25 }).map((x) => x.field)).toContain("efficiencyKwhKg");
  });
  it("rejects more than 8,760 hours", () => {
    expect(validateLcohInputs({ ...SIMPLE, operatingHours: 9000 }).map((x) => x.field)).toContain("operatingHours");
  });
  it("flags non-numeric values", () => {
    expect(validateLcohInputs({ ...SIMPLE, capexEurKw: Number.NaN }).map((x) => x.field)).toContain("capexEurKw");
  });
});

describe("sensitivity", () => {
  it("electricity price has linear impact of 20 €/MWh × SEC", () => {
    const bars = tornado(SIMPLE);
    const elec = bars.find((b) => b.field === "electricityPriceEurMwh")!;
    expect(elec.highLcoh - elec.lowLcoh).toBeCloseTo((40 * 50) / 1000, 8);
  });
  it("bars are sorted by spread", () => {
    const bars = tornado({ ...SIMPLE, discountRatePct: 7 });
    for (let k = 1; k < bars.length; k++) expect(bars[k - 1].spread).toBeGreaterThanOrEqual(bars[k].spread);
  });
  it("sweep returns steps + 1 points and is monotonic in price", () => {
    const pts = sweep(SIMPLE, "electricityPriceEurMwh", 0, 100, 10);
    expect(pts).toHaveLength(11);
    for (let k = 1; k < pts.length; k++) expect(pts[k].lcoh).toBeGreaterThan(pts[k - 1].lcoh);
  });
});
