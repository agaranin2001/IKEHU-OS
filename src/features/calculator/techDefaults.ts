import type { ElectrolyserTech, LcohInputs } from "@/domain/types";

/**
 * Typical technology parameters applied when the user switches technology.
 * Illustrative mid-range assumptions — compare with sourced benchmarks shown
 * under each field and replace with vendor data for a real project.
 */
export const TECH_DEFAULTS: Record<ElectrolyserTech, { values: Partial<LcohInputs>; note: string }> = {
  PEM: {
    values: { efficiencyKwhKg: 55, stackLifetimeHours: 80000, degradationPctPer1000h: 0.12 },
    note: "Fast ramping and compact; suits variable renewable supply.",
  },
  Alkaline: {
    values: { efficiencyKwhKg: 53, stackLifetimeHours: 90000, degradationPctPer1000h: 0.1 },
    note: "Most mature technology with lower stack cost; slower dynamic response.",
  },
  SOEC: {
    values: { efficiencyKwhKg: 41, stackLifetimeHours: 30000, degradationPctPer1000h: 0.5 },
    note: "High electrical efficiency when steam/waste heat is available. Heat input is not costed in this model.",
  },
  AEM: {
    values: { efficiencyKwhKg: 53, stackLifetimeHours: 35000, degradationPctPer1000h: 0.3 },
    note: "Emerging modular technology; limited long-term field data.",
  },
};
