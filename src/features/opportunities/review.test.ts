import { describe, expect, it } from "vitest";
import { OPPORTUNITIES } from "@/data/opportunities";
import type { Opportunity } from "@/domain/types";
import { EMPTY_RADAR_FILTERS, deadlineInfo, effectiveStatus, refineOpportunities, statusCounts } from "./model";
import { analyseOpportunity, outlineToMarkdown, themeOf } from "./review";

const base: Opportunity = {
  id: "t",
  title: "Test call",
  type: "innovation-grant",
  country: "EU",
  countryName: "European Union",
  organization: "Org",
  programme: "Prog",
  publishedAt: "2026-01-01",
  deadline: "2026-11-13",
  status: "open",
  budget: { amount: 50_000_000, currency: "EUR" },
  technologies: ["PEM"],
  eligibility: ["Consortium of at least three legal entities", "SME participation"],
  requirements: ["Minimum 10 MW electrolyser capacity", "Co-financing of at least 40%", "GHG emission reduction of 70%", "Report KPIs annually"],
  requiredDocuments: ["Business plan", "Financial statements"],
  summary: "",
  officialUrl: "https://example.org/call",
  sources: [],
  verifiedAt: "2026-10-14",
  verification: "verified",
  confidence: "high",
};

describe("effective status", () => {
  it("closes open records whose deadline passed before the snapshot", () => {
    expect(effectiveStatus({ status: "open", deadline: "2026-10-01" })).toBe("closed");
    expect(effectiveStatus({ status: "open", deadline: "2026-10-20" })).toBe("open");
    expect(effectiveStatus({ status: "historical", deadline: null })).toBe("historical");
  });
  it("labels deadlines", () => {
    expect(deadlineInfo({ status: "open", deadline: "2026-10-20" }).label).toBe("7 days left");
    expect(deadlineInfo({ status: "closed", deadline: "2026-02-19" }).label).toMatch(/^Closed on /);
    expect(deadlineInfo({ status: "upcoming", deadline: null }).label).toBe("Deadline not yet announced");
  });
});

describe("refineOpportunities", () => {
  it("applies budget floors to EUR budgets only", () => {
    const usd = { ...base, id: "u", budget: { amount: 5e9, currency: "USD" as const } };
    const out = refineOpportunities([base, usd], { ...EMPTY_RADAR_FILTERS, budget: "10000000" });
    expect(out.map((o) => o.id)).toEqual(["t"]);
  });
  it("filters by deadline window and eligibility keyword", () => {
    expect(refineOpportunities([{ ...base, deadline: "2026-11-01" }], { ...EMPTY_RADAR_FILTERS, deadline: "30" })).toHaveLength(1);
    expect(refineOpportunities([{ ...base, deadline: "2027-06-01" }], { ...EMPTY_RADAR_FILTERS, deadline: "30" })).toHaveLength(0);
    expect(refineOpportunities([base], { ...EMPTY_RADAR_FILTERS, eligibility: "sme" })).toHaveLength(1);
    expect(refineOpportunities([base], { ...EMPTY_RADAR_FILTERS, eligibility: "university" })).toHaveLength(0);
  });
});

describe("tender review rules", () => {
  it("classifies requirement themes", () => {
    expect(themeOf("Minimum 10 MW electrolyser capacity")).toBe("technical");
    expect(themeOf("Co-financing of at least 40%")).toBe("financial");
    expect(themeOf("GHG emission reduction of 70%")).toBe("environmental");
    expect(themeOf("Report KPIs annually")).toBe("reporting");
  });
  it("is deterministic and maps every requirement into the outline", () => {
    const a = analyseOpportunity(base);
    expect(analyseOpportunity(base)).toEqual(a);
    const points = a.outline.flatMap((s) => s.points);
    for (const r of base.requirements) expect(points).toContain(`Address: ${r}`);
    expect(a.outline.at(-1)?.points).toEqual(base.requiredDocuments);
    expect(outlineToMarkdown(base, a)).toContain("not by an AI model");
  });
  it("handles every record in the dataset", () => {
    for (const o of OPPORTUNITIES) {
      const r = analyseOpportunity(o);
      expect(r.compliance.length).toBeGreaterThan(0);
      expect(new Set(r.compliance.map((c) => c.id)).size).toBe(r.compliance.length);
    }
    const counts = statusCounts(OPPORTUNITIES);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(OPPORTUNITIES.length);
  });
});
