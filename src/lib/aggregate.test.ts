import { describe, expect, it } from "vitest";
import type { HydrogenProject } from "@/domain/types";
import { cheapestHoursAverage, mean, projectStats } from "./aggregate";

const base = {
  country: "SE", countryName: "Sweden", region: "Europe", location: { lat: 0, lon: 0, label: "x", precision: "approximate" },
  developer: "d", partners: [], technology: "PEM", pathway: "green", feedstock: "f", hydrogenOutputTpa: null, endUses: [],
  statusNote: "", finalInvestmentDecision: null, announcedYear: 2022, expectedCommissioning: null, investment: null,
  description: "", sources: [], verifiedAt: "2026-10-14", verification: "verified", confidence: "high",
} as const;
const mk = (id: string, status: HydrogenProject["status"], mw: number | null, extra: Partial<HydrogenProject> = {}): HydrogenProject =>
  ({ ...base, id, name: id, status, capacityMw: mw, ...extra }) as HydrogenProject;

describe("projectStats", () => {
  const ps = [
    mk("a", "operational", 20, { finalInvestmentDecision: true }),
    mk("b", "under-construction", 200, { country: "DE", finalInvestmentDecision: true }),
    mk("c", "cancelled", 1000),
    mk("d", "announced", null, { region: "Asia-Pacific", country: "CN" }),
  ];
  const s = projectStats(ps);
  it("counts records and countries", () => {
    expect(s.count).toBe(4);
    expect(s.countries).toBe(3);
    expect(s.withCapacity).toBe(3);
    expect(s.fidCount).toBe(2);
  });
  it("excludes cancelled capacity from pipeline total but keeps it by status", () => {
    expect(s.totalMw).toBe(220);
    expect(s.mwByStatus.cancelled).toBe(1000);
    expect(s.mwByStatus.operational).toBe(20);
  });
});

describe("price helpers", () => {
  it("mean and cheapest hours", () => {
    expect(mean([])).toBeNull();
    expect(mean([1, 2, 3])).toBe(2);
    expect(cheapestHoursAverage([50, 10, 30, 20], 2)).toBe(15);
  });
});
