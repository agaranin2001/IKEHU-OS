import { describe, expect, it } from "vitest";
import type { Company, Investor, PublicDeal } from "@/domain/types";
import { buildDdChecklist, buildNameIndex, flattenDeals, lookupName } from "./model";

const src = { url: "https://example.org/a", title: "A", publisher: "Example" };
const deal = (id: string, over: Partial<PublicDeal> = {}): PublicDeal => ({ id, counterparty: "X", year: 2024, kind: "equity", description: "d", amount: null, source: src, ...over });
const prov = { sources: [src], verifiedAt: "2026-10-14", verification: "verified" as const, confidence: "high" as const };

const company = (over: Partial<Company> = {}): Company => ({
  id: "co-a",
  name: "Alpha GmbH",
  categories: ["technology-startup"],
  country: "DE",
  countryName: "Germany",
  headquarters: "Berlin",
  founded: null,
  ownership: "Private",
  technologyFocus: ["PEM"],
  description: "",
  website: "https://alpha.example",
  deals: [],
  ...prov,
  ...over,
});
const investor = (over: Partial<Investor> = {}): Investor => ({
  id: "inv-b",
  name: "Beta Ventures (BV Fund I)",
  type: "venture-capital",
  headquarters: "London",
  country: "GB",
  geography: [],
  investmentFocus: [],
  stages: [],
  description: "",
  officialUrl: "",
  publicInvestments: [],
  ...prov,
  ...over,
});

describe("flattenDeals", () => {
  it("merges a deal documented under both company and investor", () => {
    const c = company({ deals: [deal("d1", { counterparty: "Beta Ventures" })] });
    const i = investor({ publicInvestments: [deal("d2", { counterparty: "Alpha", amount: { amount: 5e6, currency: "EUR" } })] });
    const rows = flattenDeals([c], [i]);
    expect(rows).toHaveLength(1);
    expect(rows[0].recordedUnder.map((r) => r.id)).toEqual(["co-a", "inv-b"]);
    expect(rows[0].amount?.amount).toBe(5e6);
  });
  it("never merges two deals of the same record", () => {
    const c = company({ deals: [deal("d1"), deal("d2")] });
    expect(flattenDeals([c], [])).toHaveLength(2);
  });
});

describe("buildNameIndex", () => {
  it("matches legal suffixes and parenthetical aliases exactly", () => {
    const idx = buildNameIndex([company()], [investor()]);
    expect(lookupName(idx, "Alpha")?.id).toBe("co-a");
    expect(lookupName(idx, "Beta Ventures")?.id).toBe("inv-b");
    expect(lookupName(idx, "Alphabet")).toBeNull();
  });
});

describe("buildDdChecklist", () => {
  it("fills public facts and flags missing ones without inventing values", () => {
    const ws = buildDdChecklist(company({ deals: [deal("p", { kind: "partnership" })] }));
    const items = ws.flatMap((w) => w.items);
    expect(items.find((i) => i.id === "ownership")).toMatchObject({ state: "public", value: "Private" });
    expect(items.find((i) => i.id === "founded")?.state).toBe("missing");
    expect(items.find((i) => i.id === "partnerships")).toMatchObject({ state: "public", value: "1 documented" });
    expect(items.find((i) => i.id === "revenue")?.state).toBe("data-room");
    expect(ws.map((w) => w.title)).toEqual(["Corporate & ownership", "Technology & IP", "Commercial traction", "Manufacturing & supply chain", "Financial", "ESG & permits", "Legal"]);
  });
});
