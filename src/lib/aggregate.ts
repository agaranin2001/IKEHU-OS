/**
 * Aggregate metrics are ALWAYS computed from the dataset passed in —
 * never hard-coded — so every number on screen is traceable to records.
 */
import type { HydrogenProject, ProjectStatus } from "@/domain/types";

export interface ProjectStats {
  count: number;
  /** Projects with a disclosed electrolyser capacity. */
  withCapacity: number;
  totalMw: number;
  mwByStatus: Record<ProjectStatus, number>;
  countByStatus: Record<ProjectStatus, number>;
  countries: number;
  byRegion: { region: string; count: number; mw: number }[];
  byTechnology: { technology: string; count: number; mw: number }[];
  fidCount: number;
}

const STATUSES: ProjectStatus[] = ["announced", "planned", "under-construction", "operational", "delayed", "cancelled"];

export function projectStats(projects: HydrogenProject[]): ProjectStats {
  const mwByStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<ProjectStatus, number>;
  const countByStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<ProjectStatus, number>;
  const region = new Map<string, { count: number; mw: number }>();
  const tech = new Map<string, { count: number; mw: number }>();
  let totalMw = 0;
  let withCapacity = 0;
  let fidCount = 0;

  for (const p of projects) {
    // Estimated values (lib/estimates.ts) count as undisclosed in every aggregate.
    const sourcedMw = p.estimated?.includes("capacityMw") ? null : p.capacityMw;
    const mw = sourcedMw ?? 0;
    countByStatus[p.status]++;
    mwByStatus[p.status] += mw;
    if (sourcedMw != null) withCapacity++;
    if (p.finalInvestmentDecision && !p.estimated?.includes("finalInvestmentDecision")) fidCount++;
    // Cancelled capacity is excluded from the pipeline total.
    if (p.status !== "cancelled") totalMw += mw;
    const r = region.get(p.region) ?? { count: 0, mw: 0 };
    r.count++;
    r.mw += mw;
    region.set(p.region, r);
    const technology = p.estimated?.includes("technology") ? "Undisclosed" : p.technology;
    const t = tech.get(technology) ?? { count: 0, mw: 0 };
    t.count++;
    t.mw += mw;
    tech.set(technology, t);
  }

  return {
    count: projects.length,
    withCapacity,
    totalMw,
    mwByStatus,
    countByStatus,
    countries: new Set(projects.map((p) => p.country)).size,
    byRegion: [...region].map(([k, v]) => ({ region: k, ...v })).sort((a, b) => b.mw - a.mw),
    byTechnology: [...tech].map(([k, v]) => ({ technology: k, ...v })).sort((a, b) => b.count - a.count),
    fidCount,
  };
}

/** Mean of a series of points, or null if empty. */
export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Average price of the cheapest `n` hours in a day — a simple flexible-operation indicator. */
export function cheapestHoursAverage(values: number[], n: number): number | null {
  if (!values.length || n <= 0) return null;
  const sorted = [...values].sort((a, b) => a - b).slice(0, Math.min(n, values.length));
  return mean(sorted);
}
