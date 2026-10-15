"use client";

import { useMemo } from "react";
import { Panel } from "@/components/ui/Panel";
import type { LcohInputs } from "@/domain/types";
import { buildCashflow } from "@/lib/economics/lcoh";
import { fmtNum } from "@/lib/format";

const k = (v: number) => fmtNum(v / 1000, 0);

/** Year-by-year operating profile used in the levelised calculation. */
export function CashflowTable({ inputs }: { inputs: LcohInputs }) {
  const rows = useMemo(() => buildCashflow(inputs), [inputs]);
  const capex = inputs.capexEurKw * inputs.capacityMw * 1000;
  return (
    <Panel title="Yearly operating profile" subtitle="Real terms, € thousands. Year 0 = initial investment. Used to compute the discounted LCOH." bodyClassName="p-0">
      <div className="scrollbar-thin max-h-[520px] overflow-auto">
        <table className="w-full min-w-[820px] text-[13px]">
          <thead className="sticky top-0 bg-paper-2 text-[11px] tracking-wide text-muted uppercase">
            <tr className="text-right">
              <th className="px-4 py-2 text-left font-medium">Year</th>
              <th className="px-3 py-2 font-medium">Avg SEC kWh/kg</th>
              <th className="px-3 py-2 font-medium">H₂ t</th>
              <th className="px-3 py-2 font-medium">Electricity</th>
              <th className="px-3 py-2 font-medium">Fixed O&M</th>
              <th className="px-3 py-2 font-medium">Var. O&M</th>
              <th className="px-3 py-2 font-medium">Water</th>
              <th className="px-3 py-2 font-medium">CAPEX / stack</th>
              <th className="px-4 py-2 font-medium">Discount factor</th>
            </tr>
          </thead>
          <tbody className="num text-right">
            <tr className="border-b border-line-2">
              <td className="px-4 py-1.5 text-left">0</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 text-faint">—</td>
              <td className="px-3 py-1.5 font-medium">{k(capex)}</td>
              <td className="px-4 py-1.5">1.0000</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.year} className={`border-b border-line-2 ${r.replacementEur > 0 ? "bg-info-soft/40" : ""}`}>
                <td className="px-4 py-1.5 text-left">{r.year}</td>
                <td className="px-3 py-1.5">{r.avgSecKwhKg.toFixed(2)}</td>
                <td className="px-3 py-1.5">{fmtNum(r.productionKg / 1000, 0)}</td>
                <td className="px-3 py-1.5">{k(r.electricityEur)}</td>
                <td className="px-3 py-1.5">{k(r.fixedOmEur)}</td>
                <td className="px-3 py-1.5">{k(r.variableOmEur)}</td>
                <td className="px-3 py-1.5">{k(r.waterEur)}</td>
                <td className="px-3 py-1.5">{r.replacementEur > 0 ? <span className="font-medium text-info">{k(r.replacementEur)}</span> : <span className="text-faint">—</span>}</td>
                <td className="px-4 py-1.5">{r.discountFactor.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line-2 px-5 py-3 text-xs text-muted">Highlighted rows include a stack replacement. Production falls between replacements because the plant runs at constant power while specific consumption rises.</p>
    </Panel>
  );
}
