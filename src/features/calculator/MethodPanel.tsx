import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { SourceLink } from "@/components/ui/Sources";
import type { Benchmark, LcohInputs } from "@/domain/types";
import { ALL_FIELDS, ORIGIN_LABEL, type FieldOrigin } from "./fields";

export function MethodPanel({
  inputs,
  origins,
  benchmarks,
  showAppLink,
}: {
  inputs: LcohInputs;
  origins: Record<keyof LcohInputs, FieldOrigin>;
  benchmarks: Benchmark[];
  showAppLink?: boolean;
}) {
  const sources = [...new Map(benchmarks.map((b) => [b.source.url, b.source])).values()];
  return (
    <div className="space-y-6">
      <Panel title="Calculation method" subtitle="Discounted levelised cost, real terms">
        <div className="rounded-btn bg-paper-2 px-5 py-4 font-mono text-[13px] leading-relaxed text-ink">
          <div>LCOH = [ CAPEX₀ + Σₜ (OPEXₜ + Stackₜ) · (1+r)⁻ᵗ ] ÷ Σₜ H₂ₜ · (1+r)⁻ᵗ</div>
          <div className="mt-2 text-xs text-muted">t = 1…{inputs.lifetimeYears} · r = {inputs.discountRatePct}% · OPEX = electricity + grid fees + fixed O&M + variable O&M + water</div>
        </div>
        <ul className="mt-4 grid gap-3 text-sm text-ink-2 md:grid-cols-2">
          <li><b className="font-medium text-ink">Production</b> — MW × hours × 1000 ÷ SEC. Degradation raises SEC between stack changes, so output falls at constant power.</li>
          <li><b className="font-medium text-ink">Capital recovery</b> — applied once by discounting production. The capital recovery factor is shown for reference and never added on top.</li>
          <li><b className="font-medium text-ink">Stack replacement</b> — whenever cumulative hours pass the stack lifetime (not in the final year), at the stated % of initial CAPEX.</li>
          <li><b className="font-medium text-ink">Units</b> — €/MWh for energy, €/kW for CAPEX, kWh/kg for SEC, kg for hydrogen. Real euros, no inflation or tax.</li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          The calculation code is isolated in <code className="font-mono">src/lib/economics/lcoh.ts</code> and covered by unit tests. Full methodology:{" "}
          <Link href="/app/sources#lcoh-methodology" className="text-forest underline underline-offset-2">Sources & Methodology</Link>.
          {showAppLink && " Open the platform to compare against market data and projects."}
        </p>
      </Panel>
      <Panel title="Assumptions used in this run" subtitle="Where each value came from" bodyClassName="p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px]">
            <thead className="bg-paper-2 text-left text-[11px] tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-2 font-medium">Input</th>
                <th className="px-3 py-2 text-right font-medium">Value</th>
                <th className="px-5 py-2 font-medium">Origin</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line-2">
                <td className="px-5 py-1.5">Technology</td>
                <td className="px-3 py-1.5 text-right">{inputs.technology}</td>
                <td className="px-5 py-1.5 text-muted">{ORIGIN_LABEL[origins.technology]}</td>
              </tr>
              {ALL_FIELDS.map((f) => (
                <tr key={f.key} className="border-b border-line-2">
                  <td className="px-5 py-1.5">{f.label}</td>
                  <td className="num px-3 py-1.5 text-right">
                    {inputs[f.key]} <span className="text-faint">{f.unit}</span>
                  </td>
                  <td className="px-5 py-1.5 text-muted">{ORIGIN_LABEL[origins[f.key]]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Benchmark sources" subtitle="Shown under each input for comparison. Targets and averages are not project-specific values.">
        {sources.length ? sources.map((s) => <SourceLink key={s.url} source={s} />) : <p className="text-sm text-muted">No benchmarks loaded.</p>}
      </Panel>
    </div>
  );
}
