import { describe, expect, it } from "vitest";
import type { WorkspaceTask } from "@/domain/types";
import { SUPPLIERS } from "@/data/suppliers";
import { WORKSPACE_DEMO } from "@/data/workspace-demo";
import { budgetTotals, dayDiff, nextMilestone, phaseProgress, riskLevel, sortRisks } from "./model";

const t = (id: string, phase: WorkspaceTask["phase"], status: WorkspaceTask["status"]): WorkspaceTask => ({ id, title: id, phase, owner: "o", due: "2026-12-01", status });

describe("workspace model", () => {
  it("marks the first phase with open work as current", () => {
    const p = phaseProgress([t("a", "Feasibility", "done"), t("b", "Pre-FEED", "in-progress"), t("c", "FEED", "todo")]);
    expect(p.map((x) => x.state)).toEqual(["done", "current", "upcoming", "upcoming", "upcoming", "upcoming"]);
  });
  it("bands risk scores", () => {
    expect([4, 5, 10, 15, 25].map(riskLevel)).toEqual(["low", "medium", "high", "critical", "critical"]);
    const sorted = sortRisks([
      { id: "r1", title: "", category: "", likelihood: 2, impact: 2, mitigation: "", owner: "" },
      { id: "r2", title: "", category: "", likelihood: 3, impact: 5, mitigation: "", owner: "" },
    ]);
    expect(sorted[0].id).toBe("r2");
  });
  it("totals budget and finds the next milestone", () => {
    expect(budgetTotals([{ line: "a", budgetEur: 100, committedEur: 25 }]).committedPct).toBe(25);
    expect(nextMilestone([{ id: "m", title: "", date: "2026-12-01", status: "upcoming" }, { id: "n", title: "", date: "2026-01-01", status: "upcoming" }], "2026-10-14")?.id).toBe("m");
    expect(dayDiff("2026-10-15", "2026-10-14")).toBe(1);
  });
  it("demo budget breakdowns sum to their cost-line totals", () => {
    for (const line of WORKSPACE_DEMO.budget) {
      const t = budgetTotals(line.items);
      expect(t.budgetEur, line.line).toBe(line.budgetEur);
      expect(t.committedEur, line.line).toBe(line.committedEur);
    }
  });
  it("demo budget suppliers link to existing catalogue entries", () => {
    const suppliers: { name: string; supplierId?: string }[] = WORKSPACE_DEMO.budget.flatMap((b) => b.suppliers);
    for (const sup of suppliers) {
      if (!sup.supplierId) continue;
      expect(SUPPLIERS.find((x) => x.id === sup.supplierId)?.companyName, sup.supplierId).toBe(sup.name);
    }
  });
});
