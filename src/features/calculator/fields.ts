import type { LcohInputs } from "@/domain/types";

export type FieldOrigin = "scenario" | "user" | "market" | "technology";

export interface FieldDef {
  key: Exclude<keyof LcohInputs, "technology">;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  help: string;
  /** Show a range slider in addition to the number input. */
  slider?: boolean;
}

export const FIELD_GROUPS: { id: string; title: string; fields: FieldDef[] }[] = [
  {
    id: "power",
    title: "Electricity supply",
    fields: [
      { key: "electricityPriceEurMwh", label: "Electricity price", unit: "€/MWh", min: 0, max: 200, step: 1, slider: true, help: "Average price paid for electricity during operating hours (energy component only)." },
      { key: "gridFeesEurMwh", label: "Grid fees & levies", unit: "€/MWh", min: 0, max: 60, step: 0.5, help: "Network tariffs, taxes and levies on consumed electricity. Zero for a behind-the-meter supply." },
    ],
  },
  {
    id: "electrolyser",
    title: "Electrolyser",
    fields: [
      { key: "capacityMw", label: "Electrolyser capacity", unit: "MW(e)", min: 1, max: 2000, step: 1, help: "Nameplate electrical input capacity. Not the capacity of the power plant supplying it." },
      { key: "capexEurKw", label: "Installed CAPEX", unit: "€/kW", min: 300, max: 5000, step: 50, slider: true, help: "Total installed system cost: stack, balance of plant, power electronics, EPC and owner's costs." },
      { key: "efficiencyKwhKg", label: "Specific energy consumption", unit: "kWh/kg", min: 30, max: 75, step: 0.5, slider: true, help: "System-level electricity use per kg H₂ at beginning of life, incl. balance of plant. Lower is better." },
    ],
  },
  {
    id: "operation",
    title: "Operation",
    fields: [
      { key: "operatingHours", label: "Full-load hours", unit: "h/yr", min: 500, max: 8760, step: 100, slider: true, help: "Equivalent full-load operating hours per year (capacity factor × 8,760)." },
      { key: "fixedOmPct", label: "Fixed O&M", unit: "% CAPEX/yr", min: 0, max: 8, step: 0.1, help: "Annual fixed operation & maintenance as a share of initial CAPEX." },
      { key: "variableOmEurMwh", label: "Variable O&M", unit: "€/MWh", min: 0, max: 20, step: 0.5, help: "Consumables and other variable costs per MWh consumed, excluding electricity and water." },
      { key: "waterLitresPerKg", label: "Water consumption", unit: "L/kg", min: 9, max: 40, step: 0.5, help: "Process water incl. treatment losses. Stoichiometric minimum is ~9 L/kg." },
      { key: "waterCostEurM3", label: "Water cost", unit: "€/m³", min: 0, max: 10, step: 0.1, help: "Purchased and treated water cost." },
    ],
  },
  {
    id: "finance",
    title: "Financial",
    fields: [
      { key: "lifetimeYears", label: "Economic lifetime", unit: "years", min: 5, max: 35, step: 1, help: "Period over which costs and production are levelised." },
      { key: "discountRatePct", label: "Discount rate (real WACC)", unit: "%", min: 0, max: 20, step: 0.25, slider: true, help: "Captures the cost of capital. Financing is not added separately to avoid double counting." },
    ],
  },
  {
    id: "stack",
    title: "Stack replacement & degradation",
    fields: [
      { key: "stackLifetimeHours", label: "Stack lifetime", unit: "h", min: 10000, max: 150000, step: 5000, help: "Operating hours before stack replacement." },
      { key: "stackReplacementPct", label: "Replacement cost", unit: "% of CAPEX", min: 0, max: 50, step: 1, help: "Cost of each stack replacement as a share of initial installed CAPEX." },
      { key: "degradationPctPer1000h", label: "Efficiency degradation", unit: "%/1,000 h", min: 0, max: 1.5, step: 0.01, help: "Increase in SEC per 1,000 operating hours; reset at stack replacement." },
    ],
  },
];

export const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);
export const FIELD_BY_KEY = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f])) as Record<FieldDef["key"], FieldDef>;

export const ORIGIN_LABEL: Record<FieldOrigin, string> = {
  scenario: "Preset",
  user: "Your input",
  market: "Market data",
  technology: "Tech default",
};

export const BREAKDOWN_PARTS = [
  { key: "electricityEurKg", label: "Electricity", color: "#16825f" },
  { key: "capexEurKg", label: "Capital (CAPEX)", color: "#7c18d3" },
  { key: "fixedOmEurKg", label: "Fixed O&M", color: "#c47a0f" },
  { key: "stackReplacementEurKg", label: "Stack replacement", color: "#2b7bd6" },
  { key: "variableOmEurKg", label: "Variable O&M", color: "#d04a3a" },
  { key: "waterEurKg", label: "Water", color: "#0b8fa0" },
] as const;
