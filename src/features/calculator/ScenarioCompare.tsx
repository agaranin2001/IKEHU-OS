"use client";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { EconomicScenario, LcohInputs } from "@/domain/types";
import { calculateLcoh } from "@/lib/economics/lcoh";
import { fmtNum } from "@/lib/format";
import { ALL_FIELDS, BREAKDOWN_PARTS, FIELD_BY_KEY } from "./fields";

const eurKg = (v: number) => `€${v.toFixed(2)}`;

/** Side-by-side comparison of preset scenarios and the current inputs. All assumptions visible. */
export function ScenarioCompare({ scenarios, current, onLoad }: { scenarios: EconomicScenario[]; current: LcohInputs; onLoad: (id: string) => void }) {
  const cols = [
    ...scenarios.map((s) => ({ id: s.id, name: s.name, inputs: { ...s.inputs, capacityMw: current.capacityMw }, preset: true, scenario: s })),
    { id: "current", name: "Your inputs", inputs: current, preset: false, scenario: undefined },
  ];
  const results = cols.map((c) => ({ ...c, r: calculateLcoh(c.inputs) }));
  const max = Math.max(...results.map((r) => r.r.lcohEurKg));

  return (
    <Panel title="Scenario comparison" subtitle="Presets use the capacity you entered so results compare like for like. Every assumption is listed below — no hidden multipliers.">
      <div className="space-y-5">
        {results.map((c) => (
          <div key={c.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-ink">{c.name}</span>
              <span className="num text-lg font-light text-ink">
                {eurKg(c.r.lcohEurKg)} <span className="text-xs text-muted">/kg</span>
              </span>
            </div>
            <div style={{ width: `${(c.r.lcohEurKg / max) * 100}%` }} className="min-w-[30%]">
              <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
                {BREAKDOWN_PARTS.map((p) =>
                  c.r.breakdown[p.key] > 0 ? <div key={p.key} title={`${p.label}: ${eurKg(c.r.breakdown[p.key])}`} style={{ width: `${(c.r.breakdown[p.key] / c.r.lcohEurKg) * 100}%`, background: p.color }} /> : null,
                )}
              </div>
            </div>
          </div>
        ))}
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          {BREAKDOWN_PARTS.map((p) => (
            <li key={p.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: p.color }} /> {p.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="scrollbar-thin -mx-5 mt-6 overflow-x-auto border-t border-line-2">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead>
            <tr className="bg-paper-2 text-left text-[11px] tracking-wide text-muted uppercase">
              <th className="px-5 py-2 font-medium">Assumption</th>
              {results.map((c) => (
                <th key={c.id} className="px-3 py-2 text-right font-medium">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line-2">
              <td className="px-5 py-2 text-ink-2">Technology</td>
              {results.map((c) => (
                <td key={c.id} className="px-3 py-2 text-right">
                  {c.inputs.technology}
                </td>
              ))}
            </tr>
            {ALL_FIELDS.map((f) => {
              const vals = results.map((c) => c.inputs[f.key]);
              const differs = new Set(vals).size > 1;
              return (
                <tr key={f.key} className="border-b border-line-2">
                  <td className="px-5 py-2 text-ink-2">
                    {FIELD_BY_KEY[f.key].label} <span className="text-faint">({f.unit})</span>
                  </td>
                  {results.map((c) => (
                    <td key={c.id} className={`num px-3 py-2 text-right ${differs ? "text-ink" : "text-faint"}`}>
                      {fmtNum(c.inputs[f.key], f.step < 1 ? 2 : 0)}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="bg-paper-2 font-medium">
              <td className="px-5 py-2.5">LCOH (€/kg)</td>
              {results.map((c) => (
                <td key={c.id} className="num px-3 py-2.5 text-right">
                  {c.r.lcohEurKg.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-2.5 text-ink-2">Annual production (t/yr)</td>
              {results.map((c) => (
                <td key={c.id} className="num px-3 py-2.5 text-right">
                  {fmtNum(c.r.annualProductionT)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-5 py-2" />
              {results.map((c) => (
                <td key={c.id} className="px-3 py-2 text-right">
                  {c.preset && (
                    <Button variant="link" size="sm" onClick={() => onLoad(c.id)}>
                      Load
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {scenarios.map((s) => (
          <div key={s.id} className="rounded-btn bg-paper-2 p-4">
            <div className="text-sm font-semibold text-ink">{s.name}</div>
            <p className="mt-1 text-xs text-muted">{s.description}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-ink-2">
              {s.assumptions.map((a) => (
                <li key={a.field}>
                  <b className="font-medium">{FIELD_BY_KEY[a.field as keyof typeof FIELD_BY_KEY]?.label ?? a.field}:</b> {a.rationale}
                  {a.source && (
                    <>
                      {" "}
                      <a href={a.source.url} target="_blank" rel="noopener noreferrer" className="text-forest underline decoration-line underline-offset-2">
                        {a.source.publisher}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
