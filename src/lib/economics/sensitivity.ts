/**
 * Sensitivity analysis helpers built on the pure LCOH model.
 * All perturbations are explicit, absolute or relative, and displayed in the UI.
 */
import type { LcohInputs } from "@/domain/types";
import { calculateLcoh, HOURS_PER_YEAR } from "./lcoh";

export interface SensitivityDriver {
  field: keyof LcohInputs;
  label: string;
  /** Human-readable description of the swing, e.g. "±20 €/MWh". */
  swing: string;
  low: (v: number) => number;
  high: (v: number) => number;
}

export const SENSITIVITY_DRIVERS: SensitivityDriver[] = [
  { field: "electricityPriceEurMwh", label: "Electricity price", swing: "±20 €/MWh", low: (v) => v - 20, high: (v) => v + 20 },
  { field: "operatingHours", label: "Operating hours", swing: "±1,500 h/yr", low: (v) => Math.min(v + 1500, HOURS_PER_YEAR), high: (v) => Math.max(v - 1500, 500) },
  { field: "capexEurKw", label: "Installed CAPEX", swing: "±30 %", low: (v) => v * 0.7, high: (v) => v * 1.3 },
  { field: "efficiencyKwhKg", label: "System efficiency", swing: "±4 kWh/kg", low: (v) => Math.max(v - 4, 40), high: (v) => v + 4 },
  { field: "discountRatePct", label: "Discount rate (WACC)", swing: "±2 pp", low: (v) => Math.max(v - 2, 0), high: (v) => v + 2 },
  { field: "fixedOmPct", label: "Fixed O&M", swing: "±1 pp of CAPEX", low: (v) => Math.max(v - 1, 0), high: (v) => v + 1 },
];

export interface TornadoBar {
  field: keyof LcohInputs;
  label: string;
  swing: string;
  lowLcoh: number;
  highLcoh: number;
  base: number;
  /** Absolute spread, €/kg — bars are sorted by this. */
  spread: number;
}

/** One-at-a-time sensitivity, sorted by impact (largest first). */
export function tornado(inputs: LcohInputs, drivers = SENSITIVITY_DRIVERS): TornadoBar[] {
  const base = calculateLcoh(inputs).lcohEurKg;
  return drivers
    .map((d) => {
      const v = inputs[d.field] as number;
      const lowLcoh = calculateLcoh({ ...inputs, [d.field]: d.low(v) }).lcohEurKg;
      const highLcoh = calculateLcoh({ ...inputs, [d.field]: d.high(v) }).lcohEurKg;
      return { field: d.field, label: d.label, swing: d.swing, lowLcoh, highLcoh, base, spread: Math.abs(highLcoh - lowLcoh) };
    })
    .sort((a, b) => b.spread - a.spread);
}

/** LCOH as a function of one input across a range — for line charts. */
export function sweep(inputs: LcohInputs, field: keyof LcohInputs, from: number, to: number, steps = 24): { x: number; lcoh: number }[] {
  const out: { x: number; lcoh: number }[] = [];
  for (let k = 0; k <= steps; k++) {
    const x = from + ((to - from) * k) / steps;
    out.push({ x, lcoh: calculateLcoh({ ...inputs, [field]: x }).lcohEurKg });
  }
  return out;
}
