import type { Benchmark, ElectrolyserTech, LcohInputs } from "@/domain/types";

/**
 * Maps calculator fields to sourced benchmark records (src/data/benchmarks.ts).
 * Technology-specific entries take precedence over generic ones.
 */
const MAP: Partial<Record<keyof LcohInputs, Partial<Record<ElectrolyserTech | "any", string[]>>>> = {
  capexEurKw: { PEM: ["bm-capex-pem-europe"], Alkaline: ["bm-capex-alkaline-europe"], any: ["bm-capex-pem-europe"] },
  efficiencyKwhKg: { PEM: ["bm-efficiency-pem"], Alkaline: ["bm-efficiency-alkaline"], SOEC: ["bm-efficiency-soec"] },
  stackLifetimeHours: { any: ["bm-stack-lifetime-iea"] },
  degradationPctPer1000h: { PEM: ["bm-degradation-pem"], Alkaline: ["bm-degradation-alkaline"] },
  fixedOmPct: { any: ["bm-fixed-om-iea"] },
  waterLitresPerKg: { PEM: ["bm-water-pem"], Alkaline: ["bm-water-alkaline"] },
  discountRatePct: { any: ["bm-wacc-eho"] },
};

export function benchmarkFor(field: keyof LcohInputs, tech: ElectrolyserTech, list: Benchmark[]): Benchmark | undefined {
  const entry = MAP[field];
  if (!entry) return undefined;
  const ids = [...(entry[tech] ?? []), ...(entry.any ?? [])];
  for (const id of ids) {
    const b = list.find((x) => x.id === id);
    if (b) return b;
  }
  return undefined;
}

export const BENCHMARK_FIELD_MAP = MAP;
