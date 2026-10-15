import { describe, expect, it } from "vitest";
import { TECH_DEFAULTS, electrolyserBreakEven, intervalHours, parsePriceCsv, simulate, validateSimInputs, type PricePoint, type SimInputs } from "./model";

const hourly = (vals: number[], start = "2025-06-19T00:00:00Z"): PricePoint[] =>
  vals.map((price, i) => ({ t: new Date(Date.parse(start) + i * 3_600_000).toISOString(), price }));

describe("electrolyser", () => {
  const x: SimInputs = { ...TECH_DEFAULTS.electrolyser, capacityMw: 10, availabilityPct: 100, gridFeesEurMwh: 0, specificEnergyKwhKg: 50, auxKwhKg: 0, h2PriceEurKg: 5, purchaseCeilingEurMwh: 50 };

  it("runs only at or below the purchase ceiling", () => {
    const r = simulate(x, hourly([40, 60, 50]));
    expect(r.steps.map((s) => s.mw)).toEqual([10, 0, 10]);
    expect(r.summary.h2Kg).toBeCloseTo(400, 6); // 20 MWh / 50 kWh/kg
  });

  it("margin = H₂ revenue − electricity − grid fees", () => {
    const r = simulate({ ...x, gridFeesEurMwh: 10 }, hourly([40, 40]));
    // 20 MWh → 400 kg × 5 € = 2000; electricity 800; grid 200
    expect(r.summary.revenue).toBeCloseTo(2000, 6);
    expect(r.summary.energyCost).toBeCloseTo(800, 6);
    expect(r.summary.gridCost).toBeCloseTo(200, 6);
    expect(r.summary.margin).toBeCloseTo(1000, 6);
  });

  it("break-even power price is H₂ value per MWh less grid fees", () => {
    expect(electrolyserBreakEven({ ...x, gridFeesEurMwh: 10 })).toBeCloseTo(90, 6);
  });
});

describe("battery", () => {
  const x: SimInputs = { ...TECH_DEFAULTS.battery, capacityMw: 10, storageMwh: 20, roundTripPct: 100, availabilityPct: 100, gridFeesEurMwh: 0, buyBelowEurMwh: 50, sellAboveEurMwh: 100 };

  it("never charges and discharges in the same interval and respects the SOC window", () => {
    const r = simulate(x, hourly([10, 10, 10, 200, 200, 200]));
    for (const s of r.steps) expect(s.revenue > 0 && s.energyCost > 0).toBe(false);
    const socs = r.steps.map((s) => s.socMwh!);
    expect(Math.max(...socs)).toBeLessThanOrEqual(19 + 1e-9);
    expect(Math.min(...socs)).toBeGreaterThanOrEqual(1 - 1e-9);
    // Usable 18 MWh bought at 10 and sold at 200.
    expect(r.summary.margin).toBeCloseTo(18 * 190, 6);
    expect(r.summary.cycles).toBeCloseTo(1, 6);
  });

  it("applies round-trip losses", () => {
    const r = simulate({ ...x, roundTripPct: 81, storageMwh: 100 }, hourly([10, 200]));
    // Draw 10 MWh, store 9, deliver 8.1.
    expect(r.summary.boughtMwh).toBeCloseTo(10, 6);
    expect(r.summary.soldMwh).toBeCloseTo(8.1, 6);
  });

  it("flags a sell threshold at or below the buy threshold", () => {
    expect(validateSimInputs({ ...x, sellAboveEurMwh: 50 }, hourly([1, 2])).some((i) => i.field === "sellAboveEurMwh")).toBe(true);
  });
});

describe("generators", () => {
  it("wind output averages the capacity factor and curtails at negative prices", () => {
    const x: SimInputs = { ...TECH_DEFAULTS.wind, capacityMw: 10, capacityFactorPct: 30, availabilityPct: 100, lossesPct: 0, gridFeesEurMwh: 0, ppaSharePct: 0, curtailNegative: true };
    const r = simulate(x, hourly([50, -5, 50, 50]));
    expect(r.steps[1].mw).toBe(0);
    expect(r.summary.curtailedMwh).toBeCloseTo(3, 6);
    expect(r.summary.revenue).toBeCloseTo(3 * 3 * 50, 6);
  });

  it("solar is zero at night and blends PPA and spot prices", () => {
    const x: SimInputs = { ...TECH_DEFAULTS.solar, availabilityPct: 100, lossesPct: 0, gridFeesEurMwh: 0, ppaSharePct: 50, ppaPriceEurMwh: 100 };
    const r = simulate(x, hourly(Array(24).fill(20)));
    expect(r.steps[0].mw).toBe(0);
    expect(r.summary.soldMwh / (x.capacityMw * 24)).toBeCloseTo(x.capacityFactorPct / 100, 6);
    expect(r.summary.avgSellPrice).toBeCloseTo(60, 6);
  });

  it("uses an uploaded generation profile when every row has one", () => {
    const pts = hourly([50, 50]).map((p, i) => ({ ...p, genMw: i ? 4 : 2 }));
    const r = simulate({ ...TECH_DEFAULTS.solar, capacityMw: 10, availabilityPct: 100, lossesPct: 0, gridFeesEurMwh: 0 }, pts);
    expect(r.summary.soldMwh).toBeCloseTo(6, 6);
  });
});

describe("cost case", () => {
  it("annualises the replayed period and computes simple payback", () => {
    const x: SimInputs = { ...TECH_DEFAULTS.wind, capacityMw: 10, capacityFactorPct: 100, availabilityPct: 100, lossesPct: 0, gridFeesEurMwh: 0, capexEur: 1_000_000, fixedOpexEurYr: 0 };
    const r = simulate(x, hourly(Array(24).fill(10)));
    expect(r.cost.annualisationFactor).toBeCloseTo(365, 6);
    expect(r.cost.annualMargin).toBeCloseTo(2400 * 365, 6);
    expect(r.cost.simplePaybackYears).toBeCloseTo(1_000_000 / (2400 * 365), 6);
  });
});

describe("parsePriceCsv", () => {
  it("parses header, semicolons and decimal commas; sorts rows", () => {
    const { points, error } = parsePriceCsv("timestamp_utc;price_eur_mwh\n2025-01-01T01:00:00Z;12,5\n2025-01-01T00:00:00Z;10");
    expect(error).toBeUndefined();
    expect(points.map((p) => p.price)).toEqual([10, 12.5]);
  });

  it("detects 15-minute resolution", () => {
    const { points } = parsePriceCsv("2025-01-01T00:00:00Z,1\n2025-01-01T00:15:00Z,2\n2025-01-01T00:30:00Z,3");
    expect(intervalHours(points)).toBeCloseTo(0.25, 6);
  });

  it("rejects bad rows and over-long periods", () => {
    expect(parsePriceCsv("2025-01-01T00:00:00Z,abc\n2025-01-01T01:00:00Z,1").error).toMatch(/Row 1/);
    expect(parsePriceCsv("2024-01-01T00:00:00Z,1\n2025-06-01T00:00:00Z,1").error).toMatch(/limit/);
  });
});
