import type { LcohInputs, LcohResult } from "@/domain/types";
import { buildCashflow } from "@/lib/economics/lcoh";
import { ALL_FIELDS, BREAKDOWN_PARTS } from "./fields";

/** CSV export of a preliminary calculation: inputs, results and yearly profile. */
export function buildCsv(inputs: LcohInputs, result: LcohResult, meta: { title: string; generatedAt: string }): string {
  const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: string[] = [];
  lines.push(esc(meta.title));
  lines.push(`${esc("Generated")},${esc(meta.generatedAt)}`);
  lines.push(esc("Preliminary estimate — not a quotation, market price or investment return."));
  lines.push("");
  lines.push(`${esc("Input")},${esc("Value")},${esc("Unit")}`);
  lines.push(`${esc("Technology")},${esc(inputs.technology)},`);
  for (const f of ALL_FIELDS) lines.push(`${esc(f.label)},${inputs[f.key]},${esc(f.unit)}`);
  lines.push("");
  lines.push(`${esc("Result")},${esc("Value")},${esc("Unit")}`);
  lines.push(`${esc("LCOH")},${result.lcohEurKg.toFixed(3)},${esc("€/kg H2")}`);
  for (const p of BREAKDOWN_PARTS) lines.push(`${esc(p.label)},${result.breakdown[p.key].toFixed(3)},${esc("€/kg H2")}`);
  lines.push(`${esc("Average annual production")},${result.annualProductionT.toFixed(1)},${esc("t/yr")}`);
  lines.push(`${esc("Annual electricity consumption")},${result.annualElectricityMwh.toFixed(0)},${esc("MWh/yr")}`);
  lines.push(`${esc("Initial CAPEX")},${result.initialCapexEur.toFixed(0)},${esc("EUR")}`);
  lines.push(`${esc("Average annual OPEX incl. electricity")},${result.annualOpexEur.toFixed(0)},${esc("EUR/yr")}`);
  lines.push("");
  lines.push(["Year", "Hours", "Avg SEC kWh/kg", "Production kg", "Electricity MWh", "Electricity EUR", "Fixed O&M EUR", "Variable O&M EUR", "Water EUR", "Stack replacement EUR", "Discount factor"].map(esc).join(","));
  for (const r of buildCashflow(inputs)) {
    lines.push([r.year, r.hours, r.avgSecKwhKg.toFixed(2), r.productionKg.toFixed(0), r.electricityMwh.toFixed(0), r.electricityEur.toFixed(0), r.fixedOmEur.toFixed(0), r.variableOmEur.toFixed(0), r.waterEur.toFixed(0), r.replacementEur.toFixed(0), r.discountFactor.toFixed(4)].join(","));
  }
  return lines.join("\n");
}

export function downloadText(filename: string, text: string, type = "text/csv") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
