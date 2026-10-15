import { describe, expect, it } from "vitest";
import type { PriceSeries } from "@/domain/types";
import { defaultPeriod, flexibleOperation, initialSelection, mergeRows, periodOptions, periodStats, pointsInPeriod, toggleZone } from "./marketMath";

const series = (zone: string, points: [string, number][]): PriceSeries => ({
  biddingZone: zone,
  resolution: "monthly",
  points: points.map(([t, v]) => ({ t, v })),
  source: { url: "https://example.org", title: "t", publisher: "p" },
  retrievedAt: "2026-10-14",
  origin: "sourced",
});

describe("zone slot selection", () => {
  it("keeps surviving colours when a zone is removed and reuses the freed slot", () => {
    let sel = initialSelection(["EE", "FI", "SE3"], new Set(["EE", "FI", "SE3", "DK1"]));
    sel = toggleZone(sel, "FI");
    expect(sel).toEqual([
      { code: "EE", slot: 0 },
      { code: "SE3", slot: 2 },
    ]);
    sel = toggleZone(sel, "DK1");
    expect(sel.find((s) => s.code === "DK1")?.slot).toBe(1);
  });

  it("refuses to exceed the maximum", () => {
    const sel = initialSelection(["A", "B"], new Set(["A", "B", "C"]), 2);
    expect(toggleZone(sel, "C", 2)).toBe(sel);
  });
});

describe("periods and stats", () => {
  const months2025 = Array.from({ length: 12 }, (_, i) => [`2025-${String(i + 1).padStart(2, "0")}-01T00:00:00Z`, i + 1] as [string, number]);
  const s = series("EE", [...months2025, ["2026-01-01T00:00:00Z", 50], ["2026-02-01T00:00:00Z", 70]]);

  it("derives years, marks incomplete years YTD and defaults to the latest full year", () => {
    const opts = periodOptions([s]);
    expect(opts.map((o) => o.label)).toEqual(["2025", "2026 YTD", "All"]);
    expect(defaultPeriod(opts)).toBe("2025");
  });

  it("computes mean, min and max months for a period", () => {
    const st = periodStats(pointsInPeriod(s, "2026"))!;
    expect(st.avg).toBe(60);
    expect(st.min.v).toBe(50);
    expect(st.max.t.startsWith("2026-02")).toBe(true);
    expect(periodStats(pointsInPeriod(s, "2030"))).toBeNull();
  });

  it("merges series into rows by timestamp", () => {
    const rows = mergeRows([series("A", [["2025-01-01", 1]]), series("B", [["2025-01-01", 2]])]);
    expect(rows).toEqual([{ t: "2025-01-01", A: 1, B: 2 }]);
  });
});

describe("flexible operation", () => {
  it("compares cheapest-hours average with the day average", () => {
    const day = series("EE", [
      ["h0", -10],
      ["h1", 10],
      ["h2", 30],
      ["h3", 50],
    ]);
    const r = flexibleOperation(day, 2)!;
    expect(r.dayAvg).toBe(20);
    expect(r.cheapestAvg).toBe(0);
    expect(r.delta).toBe(20);
    expect(r.negativeHours).toBe(1);
  });
});
