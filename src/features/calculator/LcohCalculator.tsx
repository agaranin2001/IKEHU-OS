"use client";

import { AlertTriangle, Download, FileJson, Printer, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { MenuButton } from "@/components/ui/MenuButton";
import { StackedBar } from "@/components/charts/Bars";
import { Badge, OriginTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Segmented, SelectField } from "@/components/ui/Fields";
import { Panel, Stat } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/States";
import { cn } from "@/components/ui/cn";
import type { Benchmark, EconomicScenario, ElectrolyserTech, LcohInputs, PriceSeries } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { calculateLcoh, validateLcohInputs } from "@/lib/economics/lcoh";
import { tornado } from "@/lib/economics/sensitivity";
import { fmtDate, fmtEurCompact, fmtNum } from "@/lib/format";
import { services } from "@/services";
import { benchmarkFor } from "./benchmarkMap";
import { CashflowTable } from "./CashflowTable";
import { BREAKDOWN_PARTS, FIELD_GROUPS, type FieldOrigin } from "./fields";
import { MethodPanel } from "./MethodPanel";
import { NumberField } from "./NumberField";
import { buildCsv, downloadText } from "./report";
import { ScenarioCompare } from "./ScenarioCompare";
import { SensitivityPanel } from "./SensitivityPanel";
import { TECH_DEFAULTS } from "./techDefaults";

export interface CalculatorPrefill {
  price?: number;
  zone?: string;
  capacity?: number;
  technology?: ElectrolyserTech;
}

type Tab = "breakdown" | "scenarios" | "sensitivity" | "cashflow" | "method";
type Origins = Record<keyof LcohInputs, FieldOrigin>;

const eurKg = (v: number) => `€${v.toFixed(2)}`;

/** Last-12-month average for each zone, computed from the monthly dataset. */
function trailingAverages(series: PriceSeries[]) {
  return series.map((s) => {
    const last = s.points.slice(-12);
    const avg = last.reduce((a, p) => a + p.v, 0) / Math.max(last.length, 1);
    return { zone: s.biddingZone, avg, from: last[0]?.t, to: last.at(-1)?.t, source: s.source };
  });
}

const APP_TITLE = "Hydrogen cost calculator";

/** LCOH calculator. The "app" variant renders its own page header so the export/print actions sit in it. */
export function LcohCalculator({
  prefill,
  variant = "app",
  viewSwitch,
}: {
  prefill?: CalculatorPrefill;
  variant?: "app" | "public";
  /** Calculator/simulator switch shown under the app header. */
  viewSwitch?: ReactNode;
}) {
  const scenarios = useResource("scenarios", () => services.scenarios.presets());
  const zones = useResource("energy:zones", () => services.energy.zones());
  const monthly = useResource("energy:monthly:all", () => services.energy.monthly());
  const benchmarks = useResource("benchmarks", () => services.benchmarks.list());

  if (!scenarios.data) {
    const skeleton = (
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Skeleton className="h-[640px]" />
        <Skeleton className="h-[640px]" />
      </div>
    );
    if (variant === "public") return skeleton;
    return (
      <>
        <PageHeader title={APP_TITLE} />
        <PageBody>
          {viewSwitch && <div className="mb-5">{viewSwitch}</div>}
          {skeleton}
        </PageBody>
      </>
    );
  }
  return (
    <CalculatorInner
      variant={variant}
      prefill={prefill}
      scenarios={scenarios.data}
      zoneNames={zones.data ?? []}
      prices={monthly.data ? trailingAverages(monthly.data) : []}
      benchmarks={benchmarks.data ?? []}
      viewSwitch={viewSwitch}
    />
  );
}

function CalculatorInner({
  scenarios,
  prefill,
  zoneNames,
  prices,
  benchmarks,
  variant,
  viewSwitch,
}: {
  scenarios: EconomicScenario[];
  prefill?: CalculatorPrefill;
  zoneNames: { code: string; name: string }[];
  prices: ReturnType<typeof trailingAverages>;
  benchmarks: Benchmark[];
  variant: "app" | "public";
  viewSwitch?: ReactNode;
}) {
  const base = scenarios.find((s) => s.id === "base") ?? scenarios[0];

  const initial = useMemo(() => {
    const inputs: LcohInputs = { ...base.inputs };
    const origins = Object.fromEntries(Object.keys(inputs).map((k) => [k, "scenario"])) as Origins;
    if (prefill?.technology && TECH_DEFAULTS[prefill.technology]) {
      Object.assign(inputs, { technology: prefill.technology, ...TECH_DEFAULTS[prefill.technology].values });
      for (const k of Object.keys(TECH_DEFAULTS[prefill.technology].values)) origins[k as keyof LcohInputs] = "technology";
    }
    if (prefill?.capacity && prefill.capacity > 0) {
      inputs.capacityMw = prefill.capacity;
      origins.capacityMw = "user";
    }
    if (prefill?.price != null && Number.isFinite(prefill.price)) {
      inputs.electricityPriceEurMwh = prefill.price;
      origins.electricityPriceEurMwh = "market";
    }
    return { inputs, origins };
  }, [base, prefill]);

  const [inputs, setInputs] = useState<LcohInputs>(initial.inputs);
  const [origins, setOrigins] = useState<Origins>(initial.origins);
  const [scenarioId, setScenarioId] = useState<string>(prefill ? "custom" : base.id);
  const [zone, setZone] = useState<string>(prefill?.zone ?? "");
  const [tab, setTab] = useState<Tab>("breakdown");
  const [inputsOpen, setInputsOpen] = useState(false);

  const issues = useMemo(() => validateLcohInputs(inputs), [inputs]);
  const errorFor = (k: keyof LcohInputs) => issues.find((i) => i.field === k)?.message;
  const valid = issues.length === 0;
  const result = useMemo(() => (valid ? calculateLcoh(inputs) : null), [inputs, valid]);
  const bars = useMemo(() => (valid ? tornado(inputs) : []), [inputs, valid]);
  const range = bars.length ? { lo: Math.min(...bars.map((b) => Math.min(b.lowLcoh, b.highLcoh))), hi: Math.max(...bars.map((b) => Math.max(b.lowLcoh, b.highLcoh))) } : null;

  const setField = (k: keyof LcohInputs, v: number) => {
    setInputs((s) => ({ ...s, [k]: v }));
    setOrigins((o) => ({ ...o, [k]: "user" }));
    setScenarioId("custom");
  };

  const applyScenario = (id: string) => {
    const sc = scenarios.find((s) => s.id === id);
    if (!sc) return;
    setInputs({ ...sc.inputs, capacityMw: inputs.capacityMw });
    setOrigins((o) => Object.fromEntries(Object.keys(o).map((k) => [k, k === "capacityMw" ? o.capacityMw : "scenario"])) as Origins);
    setScenarioId(id);
    setZone("");
  };

  const applyTechnology = (t: ElectrolyserTech) => {
    const d = TECH_DEFAULTS[t];
    setInputs((s) => ({ ...s, technology: t, ...d.values }));
    setOrigins((o) => ({ ...o, technology: "user", ...Object.fromEntries(Object.keys(d.values).map((k) => [k, "technology"])) }));
    setScenarioId("custom");
  };

  const zonePrice = prices.find((p) => p.zone === zone);
  const applyZone = (code: string) => {
    setZone(code);
    const p = prices.find((x) => x.zone === code);
    if (p) {
      setInputs((s) => ({ ...s, electricityPriceEurMwh: Math.round(p.avg * 10) / 10 }));
      setOrigins((o) => ({ ...o, electricityPriceEurMwh: "market" }));
      setScenarioId("custom");
    }
  };

  const reset = () => {
    setInputs(base.inputs);
    setOrigins(Object.fromEntries(Object.keys(base.inputs).map((k) => [k, "scenario"])) as Origins);
    setScenarioId(base.id);
    setZone("");
  };

  const generatedAt = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
  const exportCsv = () => result && downloadText(`lcoh-preliminary-${Date.now()}.csv`, buildCsv(inputs, result, { title: "Preliminary LCOH estimate", generatedAt }));
  const exportJson = () =>
    downloadText(
      `lcoh-scenario-${Date.now()}.json`,
      JSON.stringify({ kind: "EconomicScenario", name: "Custom", inputs, calculated_lcoh_eur_kg: result?.lcohEurKg ?? null, generatedAt }, null, 2),
      "application/json",
    );

  const inputFields = (
    <>
      <div className="py-3">
        <SelectField
          label="Location / bidding zone (sets electricity price)"
          value={zone}
          onChange={(e) => applyZone(e.target.value)}
          options={[
            { value: "", label: "Custom — enter price manually" },
            ...zoneNames.map((z) => ({
              value: z.code,
              label: `${z.name}${prices.find((p) => p.zone === z.code) ? ` · ${fmtNum(prices.find((p) => p.zone === z.code)!.avg, 0)} €/MWh` : ""}`,
            })),
          ]}
        />
        {zonePrice && (
          <p className="mt-1.5 text-[11px] leading-snug text-faint">
            {Math.abs(inputs.electricityPriceEurMwh - zonePrice.avg) > 0.5
              ? `Using ${fmtNum(inputs.electricityPriceEurMwh, 1)} €/MWh; this zone's 12-month average (${fmtDate(zonePrice.from?.slice(0, 7))} – ${fmtDate(zonePrice.to?.slice(0, 7))}) is ${fmtNum(zonePrice.avg, 1)} €/MWh. `
              : `12-month average day-ahead price ${fmtDate(zonePrice.from?.slice(0, 7))} – ${fmtDate(zonePrice.to?.slice(0, 7))}. `}
            Source: {zonePrice.source.publisher}. Historical average across all hours — a plant operating only in cheaper hours would pay less.
          </p>
        )}
        <div className="mt-3">
          <div className="mb-1.5 text-[13px] font-medium text-ink-2">Electrolyser technology</div>
          <Segmented
            label="Electrolyser technology"
            size="sm"
            value={inputs.technology}
            onChange={(t) => applyTechnology(t)}
            options={(["PEM", "Alkaline", "SOEC", "AEM"] as const).map((t) => ({ value: t, label: t }))}
          />
          <p className="mt-1.5 text-[11px] leading-snug text-faint">{TECH_DEFAULTS[inputs.technology].note}</p>
        </div>
      </div>
      {FIELD_GROUPS.map((g) => (
        <fieldset key={g.id} className="py-2">
          <legend className="pt-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{g.title}</legend>
          {g.fields.map((f) => (
            <NumberField
              key={f.key}
              def={f}
              value={inputs[f.key]}
              origin={origins[f.key]}
              onChange={(v) => setField(f.key, v)}
              error={errorFor(f.key)}
              benchmark={benchmarkFor(f.key, inputs.technology, benchmarks)}
            />
          ))}
        </fieldset>
      ))}
    </>
  );
  const inputsCard = (
    <div className="rounded-card border border-line-2 bg-paper shadow-card lg:sticky lg:top-4">
      <div className="border-b border-line-2 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Inputs</h2>
          <span className="text-[11px] text-faint">All values editable</span>
        </div>
      </div>
      <div className="scrollbar-thin divide-y divide-line-2 px-5 lg:max-h-[calc(100dvh-140px)] lg:overflow-y-auto">{inputFields}</div>
    </div>
  );

  const content = (
    <div>
      {/* Print header */}
      <div className="print-only mb-6">
        <h1 className="text-2xl font-light">Preliminary LCOH estimate</h1>
        <p className="text-sm">Generated {generatedAt}. Indicative plant-gate production cost — not a quotation, market price or investment return.</p>
      </div>

      <div className="no-print mb-5 flex flex-wrap items-center gap-3">
        {viewSwitch && (
          <>
            {viewSwitch}
            <span aria-hidden className="hidden h-6 w-px bg-line sm:block" />
          </>
        )}
        <Segmented
          label="Scenario preset"
          value={scenarioId === "custom" ? ("custom" as string) : scenarioId}
          onChange={(v) => v !== "custom" && applyScenario(v)}
          options={[...scenarios.map((s) => ({ value: s.id, label: s.name })), ...(scenarioId === "custom" ? [{ value: "custom", label: "Custom" }] : [])]}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          {variant === "public" && (
            <>
              <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!result}>
                <Download className="size-3.5" /> CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={exportJson}>
                <FileJson className="size-3.5" /> JSON
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} disabled={!result}>
                <Printer className="size-3.5" /> Print report
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={variant === "public" ? "grid items-start gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]" : "grid gap-6"}>
        {/* INPUTS — beside the results on the public page; in a drawer ("Manage inputs") in the app */}
        {variant === "public" ? inputsCard : <div className="hidden print:block">{inputsCard}</div>}

        {/* RESULTS */}
        <div className="min-w-0 space-y-6">
          {!result ? (
            <div role="alert" className="rounded-card border border-bad/30 bg-bad-soft/50 p-6">
              <div className="flex items-center gap-2 font-medium text-bad">
                <AlertTriangle className="size-4" /> Check {issues.length} input{issues.length > 1 ? "s" : ""}
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink-2">
                {issues.map((i) => (
                  <li key={i.field}>{i.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
                <div className="grid gap-0">
                  <div className="bg-deep p-6 text-cream md:p-8">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-cream/70">Estimated LCOH</span>
                      <span className="rounded bg-cream/10 px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase">Preliminary</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="num text-[64px] leading-none font-light tracking-tight">{result.lcohEurKg.toFixed(2)}</span>
                      <span className="text-lg text-cream/70">€/kg H₂</span>
                    </div>
                    {range && (
                      <p className="mt-3 text-sm text-cream/75">
                        Sensitivity range{" "}
                        <span className="num text-white">
                          {eurKg(range.lo)} – {eurKg(range.hi)}
                        </span>
                        <span className="block text-xs text-cream/50">One-at-a-time swings of the six main drivers (see Sensitivity).</span>
                      </p>
                    )}
                    <div className="mt-6">
                      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full">
                        {BREAKDOWN_PARTS.map((p) =>
                          result.breakdown[p.key] > 0 ? (
                            <div
                              key={p.key}
                              style={{ width: `${(result.breakdown[p.key] / result.lcohEurKg) * 100}%`, background: p.key === "electricityEurKg" ? "#0fff87" : p.color }}
                            />
                          ) : null,
                        )}
                      </div>
                      <p className="mt-2 text-xs text-cream/60">
                        Electricity {((result.breakdown.electricityEurKg / result.lcohEurKg) * 100).toFixed(0)}% · Capital{" "}
                        {((result.breakdown.capexEurKg / result.lcohEurKg) * 100).toFixed(0)}% of the total
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-6 sm:grid-cols-3 md:p-8">
                    <Stat label="Annual H₂ production" value={fmtNum(result.annualProductionT, 0)} unit="t/yr" hint="Lifetime average incl. degradation" />
                    <Stat
                      label="Electricity use"
                      value={fmtNum(result.annualElectricityMwh / 1000, 1)}
                      unit="GWh/yr"
                      hint={`${fmtNum(result.avgEfficiencyKwhKg, 1)} kWh/kg average`}
                    />
                    <Stat label="Initial CAPEX" value={fmtEurCompact(result.initialCapexEur)} hint={`${fmtNum(inputs.capexEurKw)} €/kW × ${fmtNum(inputs.capacityMw)} MW`} />
                    <Stat label="Annual OPEX" value={fmtEurCompact(result.annualOpexEur)} hint="Incl. electricity, O&M, water; excl. stack changes" />
                    <Stat label="Annualised CAPEX" value={fmtEurCompact(result.annualisedCapexEur)} hint={`Reference only · CRF ${result.crf.toFixed(4)}`} />
                    <Stat
                      label="Capacity factor"
                      value={fmtNum(result.capacityFactorPct, 0)}
                      unit="%"
                      hint={`${result.stackReplacements} stack replacement${result.stackReplacements === 1 ? "" : "s"}`}
                    />
                  </div>
                </div>
                {result.warnings.length > 0 && (
                  <div className="border-t border-line-2 bg-warn-soft/50 px-6 py-3">
                    {result.warnings.map((w) => (
                      <p key={w} className="flex gap-2 text-xs text-warn">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {w}
                      </p>
                    ))}
                  </div>
                )}
              </section>

              <div className="no-print">
                <Segmented
                  label="Result views"
                  value={tab}
                  onChange={setTab}
                  className="max-w-full overflow-x-auto"
                  options={[
                    { value: "breakdown", label: "Cost breakdown" },
                    { value: "scenarios", label: "Scenarios" },
                    { value: "sensitivity", label: "Sensitivity" },
                    { value: "cashflow", label: "Yearly profile" },
                    { value: "method", label: "Method & sources" },
                  ]}
                />
              </div>

              <div className={cn(tab !== "breakdown" && "hidden print:block")}>
                <Panel title="Cost breakdown" subtitle="Each component levelised over discounted lifetime production, €/kg H₂">
                  <StackedBar format={eurKg} parts={BREAKDOWN_PARTS.map((p) => ({ key: p.key, label: p.label, value: result.breakdown[p.key], color: p.color }))} />
                  <div className="mt-6 grid gap-3 border-t border-line-2 pt-4 text-xs text-muted sm:grid-cols-3">
                    <p>
                      <b className="font-semibold text-ink-2">Included:</b> electrolyser system CAPEX as entered, stack replacements, fixed & variable O&M, electricity incl. grid
                      fees, water.
                    </p>
                    <p>
                      <b className="font-semibold text-ink-2">Financing:</b> captured once via the {inputs.discountRatePct}% discount rate — no separate interest line.
                    </p>
                    <p>
                      <b className="font-semibold text-ink-2">Excluded:</b> compression, storage, transport, land, taxes, subsidies, oxygen/heat revenue.
                    </p>
                  </div>
                </Panel>
              </div>
              <div className={cn(tab !== "scenarios" && "hidden print:block")}>
                <ScenarioCompare scenarios={scenarios} current={inputs} onLoad={applyScenario} />
              </div>
              <div className={cn(tab !== "sensitivity" && "hidden print:block")}>
                <SensitivityPanel inputs={inputs} bars={bars} base={result.lcohEurKg} />
              </div>
              <div className={cn(tab !== "cashflow" && "hidden print:block")}>
                <CashflowTable inputs={inputs} />
              </div>
              <div className={cn(tab !== "method" && "hidden print:block")}>
                <MethodPanel inputs={inputs} origins={origins} benchmarks={benchmarks} showAppLink={variant === "public"} />
              </div>

              <div className="no-print flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Value origin:</span>
                <Badge tone="neutral">Preset</Badge>
                <Badge tone="violet">Your input</Badge>
                <Badge tone="info">Market data</Badge>
                <Badge tone="ok">Tech default</Badge>
                <OriginTag origin="sourced" className="ml-2" />
                <span>benchmarks link to their source</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === "public") return content;
  return (
    <>
      <PageHeader
        title={APP_TITLE}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => setInputsOpen(true)} aria-haspopup="dialog">
              <SlidersHorizontal className="size-4" aria-hidden /> Manage inputs
            </Button>
            <MenuButton
              label="Download"
              size="md"
              items={[
                { key: "csv", label: "CSV", hint: "Inputs, cost breakdown and yearly cash flow", icon: <Download className="size-4" />, onSelect: exportCsv, disabled: !result },
                { key: "json", label: "JSON", hint: "Inputs and results", icon: <FileJson className="size-4" />, onSelect: exportJson },
                {
                  key: "pdf",
                  label: "PDF report",
                  hint: "Opens print — choose Save as PDF",
                  icon: <Printer className="size-4" />,
                  onSelect: () => window.print(),
                  disabled: !result,
                },
              ]}
            />
          </>
        }
      />
      <PageBody>{content}</PageBody>
      <Drawer
        open={inputsOpen}
        onClose={() => setInputsOpen(false)}
        width="max-w-md"
        title={
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-ink">Inputs</span>
            <span className="text-xs text-muted">All values editable</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={() => setInputsOpen(false)}>
              {result ? `Show results · ${fmtNum(result.lcohEurKg, 2)} €/kg` : "Show results"}
            </Button>
          </div>
        }
      >
        <div className="-my-2 divide-y divide-line-2">{inputFields}</div>
      </Drawer>
    </>
  );
}
