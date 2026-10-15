"use client";

import { AlertTriangle, Download, FileUp, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Checkbox, MultiSelectField, Segmented, SelectField } from "@/components/ui/Fields";
import { Panel, Stat } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/States";
import { cn } from "@/components/ui/cn";
import type { PriceSeries, SourceRef } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { fmtDate, fmtEurCompact, fmtNum } from "@/lib/format";
import { services } from "@/services";
import { downloadText } from "@/features/calculator/report";
import { DispatchChart } from "./DispatchChart";
import { BatteryIllustration, ElectrolyserIllustration, GenerationIllustration, ScopeIllustration } from "./MethodIllustrations";
import { EMPTY_STORE, loadStore, persistStore, sameScenario, type SavedScenario, type Scenario, type ScenarioStore } from "./scenarioStore";
import {
  CSV_TEMPLATE,
  MAX_DAYS,
  SOC_MAX,
  SOC_MIN,
  TECH_DEFAULTS,
  TECH_LABEL,
  electrolyserBreakEven,
  parsePriceCsv,
  simulate,
  stepsToCsv,
  validateSimInputs,
  type SimInputs,
  type SimResult,
  type SimTech,
} from "./model";

type Sample = { id: string; label: string; date: string; series: PriceSeries[] };
type Source = "sample" | "upload";
type NumKey = { [K in keyof SimInputs]: SimInputs[K] extends number ? K : never }[keyof SimInputs];

const TITLE = "Project simulator";
const ALL_DAYS = "all";
const eurMwh = (v: number | null) => (v == null ? "—" : `€${fmtNum(v, 1)}`);
const signedEur = (v: number) => (v < 0 ? `−${fmtEurCompact(-v)}` : fmtEurCompact(v));

/** `/app/calculator?view=simulator`: operating replay of hourly prices for an electrolyser, battery, solar or wind project. */
export function ProjectSimulator({ viewSwitch }: { viewSwitch?: ReactNode }) {
  const samples = useResource("energy:hourly-samples", () => services.energy.hourlySamples());
  const zones = useResource("energy:zones", () => services.energy.zones());

  if (!samples.data) {
    return (
      <>
        <PageHeader title={TITLE} />
        <PageBody>
          <div className="space-y-6">
            {viewSwitch}
            <Skeleton className="h-24" />
            <Skeleton className="h-[560px]" />
          </div>
        </PageBody>
      </>
    );
  }
  return <SimulatorInner samples={samples.data} zoneNames={zones.data ?? []} viewSwitch={viewSwitch} />;
}

/** Price series, label and sources for a scenario's market selection. */
function priceData(sc: Scenario, samples: Sample[]) {
  if (sc.source === "upload") {
    return { prices: sc.upload?.points ?? [], dataLabel: sc.upload ? `Upload · ${sc.upload.name}` : "No file", sources: [] as SourceRef[] };
  }
  const picked = sc.day === ALL_DAYS ? samples : samples.filter((s) => s.id === sc.day);
  const series = picked.map((s) => s.series.find((x) => x.biddingZone === sc.zone)).filter((s): s is PriceSeries => !!s);
  const prices = series.flatMap((s) => s.points.map((p) => ({ t: p.t, price: p.v }))).sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
  const when = sc.day === ALL_DAYS ? `${picked.length} sample days` : fmtDate(picked[0]?.date);
  const sources = [...new Map(series.map((s) => [s.source.url, s.source])).values()];
  return { prices, dataLabel: `${sc.zone} · ${when}`, sources };
}

function SimulatorInner({ samples, zoneNames, viewSwitch }: { samples: Sample[]; zoneNames: { code: string; name: string }[]; viewSwitch?: ReactNode }) {
  const zoneCodes = useMemo(() => [...new Set(samples.flatMap((s) => s.series.map((x) => x.biddingZone)))].sort(), [samples]);
  const zoneName = (code: string) => zoneNames.find((z) => z.code === code)?.name ?? code;

  const defaultScenario = useMemo<Scenario>(
    () => ({ source: "sample", zone: zoneCodes.includes("EE") ? "EE" : zoneCodes[0], day: samples[0]?.id ?? ALL_DAYS, upload: null, inputs: TECH_DEFAULTS.electrolyser }),
    [zoneCodes, samples],
  );
  const makeSaved = (sc: Scenario): SavedScenario => ({
    id: `sc-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: `${TECH_LABEL[sc.inputs.tech]} · ${fmtNum(sc.inputs.capacityMw)} MW${sc.inputs.tech === "battery" ? ` / ${fmtNum(sc.inputs.storageMwh)} MWh` : ""} · ${priceData(sc, samples).dataLabel}`,
    savedAt: new Date().toISOString(),
    scenario: sc,
  });

  // Every run is saved in this browser; the first visit starts with the default scenario.
  const [store, setStore] = useState<ScenarioStore>(() => {
    const loaded = typeof window === "undefined" ? EMPTY_STORE : loadStore();
    if (loaded.scenarios.length) return loaded;
    const first = makeSaved(defaultScenario);
    return { scenarios: [first], currentId: first.id, compareIds: [] };
  });
  useEffect(() => persistStore(store), [store]);

  // Scenario being edited in the modal; applied (and saved) only on "Run simulation".
  const [draft, setDraft] = useState<Scenario | null>(null);
  const closeModal = useCallback(() => setDraft(null), []);

  const current = store.scenarios.find((x) => x.id === store.currentId);
  const scenario = current && !current.uploadDropped ? current.scenario : defaultScenario;
  const { inputs } = scenario;
  const { prices, dataLabel, sources } = useMemo(() => priceData(scenario, samples), [scenario, samples]);
  const issues = useMemo(() => validateSimInputs(inputs, prices), [inputs, prices]);
  const result = useMemo(() => (issues.length === 0 ? simulate(inputs, prices) : null), [inputs, prices, issues]);

  const exportRun = () => result && downloadText(`simulator-${inputs.tech}-${Date.now()}.csv`, stepsToCsv(inputs, result.steps));

  const run = (sc: Scenario) => {
    const fresh = makeSaved(sc);
    setStore((st) => {
      const existing = st.scenarios.find((x) => sameScenario(x.scenario, sc));
      return existing ? { ...st, currentId: existing.id } : { ...st, scenarios: [...st.scenarios, fresh], currentId: fresh.id };
    });
  };
  const loadSaved = (id: string) => setStore((st) => ({ ...st, currentId: id }));
  const removeSaved = (id: string) =>
    setStore((st) => {
      const scenarios = st.scenarios.filter((x) => x.id !== id);
      return { scenarios, compareIds: st.compareIds.filter((x) => x !== id), currentId: st.currentId === id ? (scenarios.at(-1)?.id ?? null) : st.currentId };
    });

  // Comparison rows: the selected saved scenarios (all when none selected), re-simulated.
  const compared = useMemo(() => {
    const picked = store.compareIds.length ? store.scenarios.filter((x) => store.compareIds.includes(x.id)) : store.scenarios;
    return picked.map((sv) => {
      if (sv.uploadDropped) return { sv, data: "Price file not stored", result: null };
      const pd = priceData(sv.scenario, samples);
      const ok = validateSimInputs(sv.scenario.inputs, pd.prices).length === 0;
      return { sv, data: pd.dataLabel, result: ok ? simulate(sv.scenario.inputs, pd.prices) : null };
    });
  }, [store.scenarios, store.compareIds, samples]);

  const summary: { label: string; value: string | undefined }[] = [
    { label: "Asset", value: TECH_LABEL[inputs.tech] },
    { label: "Capacity", value: `${fmtNum(inputs.capacityMw)} MW${inputs.tech === "battery" ? ` / ${fmtNum(inputs.storageMwh)} MWh` : ""}` },
    { label: "Price zone", value: scenario.source === "sample" ? `${zoneName(scenario.zone)} (${scenario.zone})` : "Uploaded prices" },
    {
      label: scenario.source === "sample" ? "Price days" : "Price file",
      value: scenario.source === "sample" ? (scenario.day === ALL_DAYS ? `All ${samples.length} sample days` : samples.find((d) => d.id === scenario.day)?.label) : scenario.upload?.name,
    },
  ];

  return (
    <>
      <PageHeader
        title={TITLE}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={exportRun} disabled={!result}>
              <Download className="size-4" aria-hidden /> Export run
            </Button>
            <Button size="md" onClick={() => setDraft(scenario)} aria-haspopup="dialog">
              <Plus className="size-4" aria-hidden /> Create scenario
            </Button>
          </>
        }
      />
      <PageBody className="space-y-6">
        {viewSwitch}
        {/* Current scenario, one card per setting */}
        <section aria-label="Current scenario" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summary.map((item, i) => (
            <div key={item.label} className="min-w-0 rounded-card border border-line-2 bg-paper p-5 shadow-card">
              <div className="text-xs font-medium text-muted">{item.label}</div>
              <div className="mt-1 text-[17px] leading-snug text-ink">{item.value ?? "—"}</div>
              {i === summary.length - 1 && sources.length > 0 && (
                <p className="mt-1.5 text-[11px] text-faint">
                  Day-ahead prices ·{" "}
                  {sources.map((src, k) => (
                    <span key={src.url}>
                      {k > 0 && ", "}
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-forest">
                        {src.publisher}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          ))}
        </section>

        {!result ? (
          <div role="alert" className="rounded-card border border-bad/30 bg-bad-soft/50 p-6">
            <div className="flex items-center gap-2 font-medium text-bad">
              <AlertTriangle className="size-4" aria-hidden /> Check {issues.length} input{issues.length > 1 ? "s" : ""}
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-2">
              {issues.map((i) => (
                <li key={i.field}>{i.message}</li>
              ))}
            </ul>
          </div>
        ) : (
          <Results inputs={inputs} result={result} dataLabel={dataLabel} />
        )}

        <Panel
          title="Compare your scenarios"
          subtitle="Every scenario you run is saved in this browser. Choose which ones to compare."
          actions={
            <MultiSelectField
              className="w-72 max-w-full"
              placeholder={`All saved scenarios (${store.scenarios.length})`}
              value={store.compareIds}
              onChange={(ids) => setStore((st) => ({ ...st, compareIds: ids }))}
              options={store.scenarios.map((x) => ({ value: x.id, label: x.name }))}
              emptyText="No saved scenarios yet"
            />
          }
          bodyClassName="p-0"
        >
          {compared.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">No saved scenarios yet. Create a scenario and run it — it is saved here automatically.</p>
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-[13px]">
                <thead className="bg-paper-2 text-xs text-muted">
                  <tr className="border-b border-line-2">
                    <th scope="col" className="px-5 py-2.5 font-medium">Scenario</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Price data</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Period</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Operating margin</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Annualised</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Net of fixed OPEX</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Simple payback</th>
                    <th scope="col" className="px-5 py-2.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compared.map(({ sv, data, result: r }) => {
                    const isCurrent = sv.id === store.currentId;
                    return (
                      <tr key={sv.id} className={cn("border-b border-line-2 last:border-0", isCurrent && "bg-mint-soft/40")}>
                        <td className="px-5 py-3 text-ink">
                          {sv.name}
                          {isCurrent && (
                            <Badge tone="ok" className="ml-2">
                              Current
                            </Badge>
                          )}
                          <div className="text-[11px] text-faint">Saved {fmtDate(sv.savedAt.slice(0, 10))}</div>
                        </td>
                        <td className={cn("px-3 py-3", sv.uploadDropped ? "text-warn" : "text-ink-2")}>{data}</td>
                        {r ? (
                          <>
                            <td className="num px-3 py-3 text-right text-ink-2">{fmtNum(r.summary.periodHours)} h</td>
                            <td className={cn("num px-3 py-3 text-right", r.summary.margin < 0 ? "text-bad" : "text-ink")}>{signedEur(r.summary.margin)}</td>
                            <td className="num px-3 py-3 text-right text-ink-2">{signedEur(r.cost.annualMargin)}</td>
                            <td className={cn("num px-3 py-3 text-right", r.cost.netOperatingCash < 0 ? "text-bad" : "text-ink-2")}>{signedEur(r.cost.netOperatingCash)}</td>
                            <td className="num px-3 py-3 text-right text-ink-2">{r.cost.simplePaybackYears == null ? "Not reached" : `${fmtNum(r.cost.simplePaybackYears, 1)} yrs`}</td>
                          </>
                        ) : (
                          <td colSpan={5} className="px-3 py-3 text-right text-xs text-muted">
                            {sv.uploadDropped ? "Re-upload the price file to run this scenario." : "Inputs no longer valid."}
                          </td>
                        )}
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => loadSaved(sv.id)} disabled={isCurrent || sv.uploadDropped}>
                              Load
                            </Button>
                            <button type="button" onClick={() => removeSaved(sv.id)} className="rounded p-1.5 text-faint hover:text-ink" aria-label={`Delete ${sv.name}`}>
                              <X className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <MethodNotes />
      </PageBody>

      {draft && (
        <ScenarioModal
          draft={draft}
          onChange={setDraft}
          samples={samples}
          zoneCodes={zoneCodes}
          zoneName={zoneName}
          onClose={closeModal}
          onRun={() => {
            run(draft);
            setDraft(null);
          }}
        />
      )}
    </>
  );
}

function ScenarioModal({
  draft,
  onChange,
  samples,
  zoneCodes,
  zoneName,
  onClose,
  onRun,
}: {
  draft: Scenario;
  onChange: (s: Scenario) => void;
  samples: Sample[];
  zoneCodes: string[];
  zoneName: (code: string) => string;
  onClose: () => void;
  onRun: () => void;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { inputs } = draft;
  const { prices, dataLabel, sources } = useMemo(() => priceData(draft, samples), [draft, samples]);
  const issues = useMemo(() => validateSimInputs(inputs, prices), [inputs, prices]);
  const errorFor = (k: keyof SimInputs) => issues.find((i) => i.field === k)?.message;

  const patch = (p: Partial<Scenario>) => onChange({ ...draft, ...p });
  const set = <K extends keyof SimInputs>(k: K, v: SimInputs[K]) => patch({ inputs: { ...inputs, [k]: v } });
  const resetCosts = () => patch({ inputs: { ...inputs, capexEur: TECH_DEFAULTS[inputs.tech].capexEur, fixedOpexEurYr: TECH_DEFAULTS[inputs.tech].fixedOpexEurYr } });

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    const { points, error } = parsePriceCsv(await file.text());
    if (error) {
      setUploadError(error);
      return;
    }
    setUploadError(null);
    patch({ upload: { name: file.name, points } });
  };

  const field = (k: NumKey, label: string, unit: string, opts: { help?: string; scale?: number } = {}) => (
    <SimField key={k} label={label} unit={unit} value={inputs[k]} onChange={(v) => set(k, v)} error={errorFor(k)} {...opts} />
  );
  const isGen = inputs.tech === "solar" || inputs.tech === "wind";

  return (
    <Drawer
      open
      side="center"
      width="max-w-xl"
      onClose={onClose}
      title={<span className="text-base font-semibold text-ink">Create scenario</span>}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={cn("text-xs", issues.length ? "text-bad" : "text-muted")}>
            {issues.length ? `Fix ${issues.length} input${issues.length > 1 ? "s" : ""} to run` : `${fmtNum(prices.length)} intervals · ${dataLabel}`}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onRun} disabled={issues.length > 0}>
              Run simulation
            </Button>
          </div>
        </div>
      }
    >
      <div className="-my-4 divide-y divide-line-2">
        <Step n="01" title="Market & time">
          <Segmented<Source>
            label="Price source"
            fill
            value={draft.source}
            onChange={(v) => patch({ source: v })}
            options={[
              { value: "sample", label: "Published hourly prices" },
              { value: "upload", label: "Upload CSV" },
            ]}
          />
          {draft.source === "sample" ? (
            <div className="mt-3 space-y-3">
              <SelectField label="Bidding zone" value={draft.zone} onChange={(e) => patch({ zone: e.target.value })} options={zoneCodes.map((c) => ({ value: c, label: `${zoneName(c)} (${c})` }))} />
              <SelectField
                label="Period · UTC"
                value={draft.day}
                onChange={(e) => patch({ day: e.target.value })}
                options={[...samples.map((s) => ({ value: s.id, label: s.label })), { value: ALL_DAYS, label: `All ${samples.length} sample days · ${samples.length * 24} h` }]}
              />
              {sources.length > 0 && (
                <p className="text-[11px] leading-snug text-faint">
                  Day-ahead prices ·{" "}
                  {sources.map((src, i) => (
                    <span key={src.url}>
                      {i > 0 && ", "}
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-forest">
                        {src.publisher}
                      </a>
                    </span>
                  ))}
                  . Zones are kept separate.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => readFile(e.target.files?.[0])} aria-label="Price history file" />
              <Button variant="secondary" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
                <FileUp className="size-4" aria-hidden /> {draft.upload ? "Replace price file" : "Choose price history CSV"}
              </Button>
              {draft.upload && (
                <p className="text-xs text-ink-2">
                  {draft.upload.name} · <span className="num">{fmtNum(draft.upload.points.length)}</span> intervals
                  {draft.upload.points.every((p) => p.genMw != null) ? " · includes generation profile" : ""}
                </p>
              )}
              {uploadError && <p className="text-xs text-bad">{uploadError}</p>}
              <p className="text-[11px] leading-snug text-faint">
                Columns: <code>timestamp_utc, price_eur_mwh</code> and optionally <code>generation_mw</code> (replaces the illustrative solar/wind profile). Up to {MAX_DAYS} days; hourly or
                15-minute. Processed in your browser, never uploaded.{" "}
                <button type="button" className="text-forest underline-offset-2 hover:underline" onClick={() => downloadText("price-history-template.csv", CSV_TEMPLATE)}>
                  Download CSV template
                </button>
              </p>
            </div>
          )}
        </Step>

        <Step n="02" title="Build a scenario">
          <Segmented<SimTech>
            label="Technology"
            size="sm"
            fill
            value={inputs.tech}
            onChange={(t) => patch({ inputs: TECH_DEFAULTS[t] })}
            options={(Object.keys(TECH_LABEL) as SimTech[]).map((t) => ({ value: t, label: TECH_LABEL[t] }))}
          />
          <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
            {inputs.tech === "electrolyser" && (
              <>
                {field("capacityMw", "Electrolyser capacity", "MW(e)")}
                {field("h2PriceEurKg", "H₂ sale price", "€/kg")}
                {field("specificEnergyKwhKg", "Electrolyser electricity", "kWh/kg", { help: "System specific energy at the stack and balance of plant." })}
                {field("auxKwhKg", "Compression & auxiliaries", "kWh/kg", { help: "Allowance added for every kilogram produced." })}
                {field("purchaseCeilingEurMwh", "Run when price is at or below", "€/MWh", { help: `Break-even at these inputs: €${fmtNum(electrolyserBreakEven(inputs), 1)}/MWh.` })}
              </>
            )}
            {inputs.tech === "battery" && (
              <>
                {field("capacityMw", "Power", "MW")}
                {field("storageMwh", "Storage", "MWh", { help: `Usable window ${SOC_MIN * 100}–${SOC_MAX * 100} % of nameplate.` })}
                {field("roundTripPct", "Round-trip efficiency", "%")}
                {field("buyBelowEurMwh", "Charge at or below", "€/MWh")}
                {field("sellAboveEurMwh", "Discharge at or above", "€/MWh")}
              </>
            )}
            {isGen && (
              <>
                {field("capacityMw", "Nameplate capacity", "MW")}
                {field("capacityFactorPct", "Illustrative capacity factor", "%", {
                  help: inputs.tech === "solar" ? "Shapes a simplified UTC daylight curve. An uploaded generation_mw column replaces it." : "Flat output. An uploaded generation_mw column replaces it.",
                })}
                {field("lossesPct", "Losses", "%")}
                {field("ppaSharePct", "PPA share of output", "%")}
                {inputs.ppaSharePct > 0 && field("ppaPriceEurMwh", "PPA price", "€/MWh")}
              </>
            )}
            {field("gridFeesEurMwh", isGen ? "Grid & balancing costs" : "Grid & purchase costs", "€/MWh")}
            {field("availabilityPct", "Availability", "%", { help: "Reduces dispatchable power in every interval." })}
          </div>
          {isGen && (
            <div className="pt-1">
              <Checkbox checked={inputs.curtailNegative} onChange={(v) => set("curtailNegative", v)} label="Curtail at negative prices" />
            </div>
          )}
        </Step>

        <Step
          n="03"
          title="Cost case"
          action={
            <button type="button" onClick={resetCosts} className="inline-flex items-center gap-1 text-xs text-forest hover:underline">
              <RotateCcw className="size-3" aria-hidden /> Reset cost defaults
            </button>
          }
        >
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field("capexEur", "Installed CAPEX · entered budget", "€m", { scale: 1e6 })}
            {field("fixedOpexEurYr", "Year-one fixed OPEX", "€k/yr", { scale: 1e3 })}
          </div>
          <p className="text-[11px] leading-snug text-faint">Defaults are illustrative allowances excluding recoverable VAT — replace them with your budget.</p>
        </Step>
      </div>
    </Drawer>
  );
}

function Results({ inputs, result, dataLabel }: { inputs: SimInputs; result: SimResult; dataLabel: string }) {
  const { summary: s, cost } = result;
  const isGen = inputs.tech === "solar" || inputs.tech === "wind";
  const activeHours = s.activeIntervals * s.hoursPerInterval;

  const stats: ReactNode[] =
    inputs.tech === "electrolyser"
      ? [
          <Stat key="h2" label="H₂ produced" value={fmtNum(s.h2Kg / 1000, s.h2Kg < 10_000 ? 2 : 1)} unit="t" hint={`${fmtNum(s.boughtMwh)} MWh electricity`} />,
          <Stat key="run" label="Running hours" value={fmtNum(activeHours, activeHours % 1 ? 1 : 0)} unit={`of ${fmtNum(s.periodHours)} h`} hint={`${fmtNum(s.utilisationPct)} % utilisation`} />,
          <Stat key="paid" label="Avg power price paid" value={eurMwh(s.avgBuyPrice)} unit="/MWh" hint={`Market average ${eurMwh(s.marketAvg)}/MWh`} />,
          <Stat key="be" label="Break-even power price" value={eurMwh(electrolyserBreakEven(inputs))} unit="/MWh" hint={`At €${fmtNum(inputs.h2PriceEurKg, 2)}/kg H₂`} />,
        ]
      : inputs.tech === "battery"
        ? [
            <Stat key="out" label="Energy discharged" value={fmtNum(s.soldMwh, 1)} unit="MWh" hint={`${fmtNum(s.boughtMwh, 1)} MWh charged`} />,
            <Stat key="cyc" label="Equivalent cycles" value={fmtNum(s.cycles, 2)} hint={`Over ${fmtNum(s.periodHours)} h`} />,
            <Stat key="buy" label="Avg buy / sell price" value={`${eurMwh(s.avgBuyPrice)} / ${eurMwh(s.avgSellPrice)}`} hint="€/MWh, energy-weighted" />,
            <Stat
              key="spread"
              label="Spread captured"
              value={s.avgBuyPrice != null && s.avgSellPrice != null ? eurMwh(s.avgSellPrice - s.avgBuyPrice) : "—"}
              unit="/MWh"
              hint={`Market range ${eurMwh(s.marketMin)} – ${eurMwh(s.marketMax)}`}
            />,
          ]
        : [
            <Stat key="gen" label="Energy sold" value={fmtNum(s.soldMwh, 1)} unit="MWh" hint={`${fmtNum(s.utilisationPct, 1)} % of available capacity`} />,
            <Stat
              key="cap"
              label="Captured price"
              value={eurMwh(s.avgSellPrice)}
              unit="/MWh"
              hint={s.avgSellPrice != null && s.marketAvg > 0 ? `${fmtNum((s.avgSellPrice / s.marketAvg) * 100)} % of market average ${eurMwh(s.marketAvg)}` : undefined}
            />,
            <Stat key="cur" label="Curtailed" value={fmtNum(s.curtailedMwh, 1)} unit="MWh" hint={`${s.negativeIntervals} negative-price interval${s.negativeIntervals === 1 ? "" : "s"}`} />,
            <Stat key="rev" label="Revenue" value={fmtEurCompact(s.revenue)} hint={inputs.ppaSharePct > 0 ? `${fmtEurCompact(s.ppaRevenue)} from the PPA` : "All at spot"} />,
          ];

  const bridge = isGen
    ? [
        { key: "spot", label: "Spot revenue", value: s.revenue - s.ppaRevenue },
        ...(inputs.ppaSharePct > 0 ? [{ key: "ppa", label: "PPA revenue", value: s.ppaRevenue }] : []),
        { key: "grid", label: "Grid & balancing costs", value: -s.gridCost },
      ]
    : [
        { key: "rev", label: inputs.tech === "electrolyser" ? "H₂ sales" : "Discharge revenue", value: s.revenue },
        { key: "energy", label: "Electricity purchases", value: -s.energyCost },
        { key: "grid", label: "Grid & purchase costs", value: -s.gridCost },
      ];
  const maxAbs = Math.max(...bridge.map((b) => Math.abs(b.value)), Math.abs(s.margin), 1);

  return (
    <>
      <section className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="bg-deep p-6 text-cream md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-cream/70">Operating margin · this run</span>
              <span className="rounded bg-cream/10 px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase">Replay</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="num text-[56px] leading-none font-light tracking-tight">{signedEur(s.margin)}</span>
            </div>
            <p className="mt-3 text-sm text-cream/75">
              {TECH_LABEL[inputs.tech]} · {dataLabel} · <span className="num">{fmtNum(s.periodHours, s.periodHours % 1 ? 2 : 0)} h</span>
              <span className="block text-xs text-cream/50">
                {fmtNum(s.intervals)} intervals of {s.hoursPerInterval === 1 ? "1 hour" : `${fmtNum(s.hoursPerInterval * 60)} minutes`}. Capital, finance and tax excluded.
              </span>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-cream/10 pt-4 text-sm">
              <div>
                <div className="text-xs text-cream/60">Scaled to a year</div>
                <div className="num mt-0.5 text-lg text-white">{signedEur(cost.annualMargin)}</div>
              </div>
              <div>
                <div className="text-xs text-cream/60">Revenue · this run</div>
                <div className="num mt-0.5 text-lg text-white">{fmtEurCompact(s.revenue)}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 content-start gap-x-6 gap-y-5 p-6 md:p-8">{stats}</div>
        </div>
      </section>

      <Panel
        title="Market price & dispatch"
        subtitle="Day-ahead price and the power the scenario draws or delivers in each interval, UTC."
      >
        <DispatchChart
          steps={result.steps}
          inLabel={inputs.tech === "electrolyser" ? "Electrolyser load" : inputs.tech === "battery" ? "Charging" : "Generation sold"}
          outLabel={inputs.tech === "battery" ? "Discharging" : undefined}
        />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Follow the money" subtitle="Operating cash bridge for this run">
          <ul className="space-y-3">
            {bridge.map((b) => (
              <BridgeRow key={b.key} label={b.label} value={b.value} share={Math.abs(b.value) / maxAbs} />
            ))}
            <li className="border-t border-line-2 pt-3">
              <BridgeRow label="Operating margin" value={s.margin} share={Math.abs(s.margin) / maxAbs} strong />
            </li>
          </ul>
        </Panel>
        <Panel title="What this run tells you">
          <ul className="space-y-2.5 text-sm leading-relaxed text-ink-2">
            {insights(inputs, result).map((t) => (
              <li key={t} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Investment view" subtitle="Indicative: the replayed period scaled to 8,760 hours" actions={<Badge tone="warn">Indicative</Badge>}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <Stat label="Annualised operating margin" value={signedEur(cost.annualMargin)} hint={`× ${fmtNum(cost.annualisationFactor, 1)} of this run`} />
          <Stat label="Fixed OPEX" value={fmtEurCompact(inputs.fixedOpexEurYr)} unit="/yr" hint="Year one, as entered" />
          <Stat label="Net operating cash" value={signedEur(cost.netOperatingCash)} unit="/yr" />
          <Stat
            label="Simple payback"
            value={cost.simplePaybackYears == null ? "Not reached" : fmtNum(cost.simplePaybackYears, 1)}
            unit={cost.simplePaybackYears == null ? undefined : "yrs"}
            hint={`On ${fmtEurCompact(inputs.capexEur)} installed CAPEX`}
          />
        </div>
      </Panel>
    </>
  );
}

function insights(x: SimInputs, r: SimResult): string[] {
  const s = r.summary;
  const out: string[] = [];
  if (x.tech === "electrolyser") {
    const be = electrolyserBreakEven(x);
    out.push(
      s.activeIntervals
        ? `Ran in ${s.activeIntervals} of ${s.intervals} intervals, paying ${eurMwh(s.avgBuyPrice)}/MWh on average against a market average of ${eurMwh(s.marketAvg)}/MWh.`
        : `Prices never fell to the ${eurMwh(x.purchaseCeilingEurMwh)}/MWh ceiling, so the electrolyser stayed off.`,
    );
    if (s.h2Kg > 0) out.push(`Electricity and grid costs came to €${fmtNum((s.energyCost + s.gridCost) / s.h2Kg, 2)} per kg against a €${fmtNum(x.h2PriceEurKg, 2)}/kg sale price.`);
    if (x.purchaseCeilingEurMwh > be + 0.5) out.push(`The ceiling is above the ${eurMwh(be)}/MWh break-even, so some running hours lose money. Lowering it to break-even maximises operating margin.`);
    else if (x.purchaseCeilingEurMwh < be - 0.5) out.push(`Raising the ceiling towards the ${eurMwh(be)}/MWh break-even adds running hours that still earn a margin — but more hours also spread fixed costs.`);
  } else if (x.tech === "battery") {
    if (!s.boughtMwh) out.push(`Prices never fell to the ${eurMwh(x.buyBelowEurMwh)}/MWh charge threshold (minimum ${eurMwh(s.marketMin)}).`);
    else if (!s.soldMwh) out.push(`The battery charged but prices never reached the ${eurMwh(x.sellAboveEurMwh)}/MWh discharge threshold (maximum ${eurMwh(s.marketMax)}).`);
    else
      out.push(
        `Bought ${fmtNum(s.boughtMwh, 1)} MWh at ${eurMwh(s.avgBuyPrice)} and sold ${fmtNum(s.soldMwh, 1)} MWh at ${eurMwh(s.avgSellPrice)} — ${fmtNum(s.boughtMwh - s.soldMwh, 1)} MWh lost to round-trip efficiency or left in store.`,
      );
    out.push(`The day's price range was ${eurMwh(s.marketMin)} to ${eurMwh(s.marketMax)}/MWh; thresholds inside that range decide how many cycles are possible.`);
    out.push("Purchased energy is fully expensed and energy left in the battery at the end has no resale credit.");
  } else {
    if (s.avgSellPrice != null) out.push(`Captured ${eurMwh(s.avgSellPrice)}/MWh against a time-weighted market average of ${eurMwh(s.marketAvg)}/MWh.`);
    if (s.negativeIntervals)
      out.push(
        x.curtailNegative
          ? `Curtailed ${fmtNum(s.curtailedMwh, 1)} MWh across ${s.negativeIntervals} negative-price interval${s.negativeIntervals === 1 ? "" : "s"}.`
          : `${s.negativeIntervals} interval${s.negativeIntervals === 1 ? " had" : "s had"} negative prices; output was sold anyway because curtailment is off.`,
      );
    if (x.ppaSharePct > 0) out.push(`The PPA fixed ${fmtNum(x.ppaSharePct)} % of output at ${eurMwh(x.ppaPriceEurMwh)}/MWh.`);
    out.push(x.tech === "solar" ? "Solar follows a simplified UTC daylight curve; weather and location are not modelled." : "Wind output is flat at the capacity factor; upload a generation profile for a realistic shape.");
  }
  return out;
}

function BridgeRow({ label, value, share, strong }: { label: string; value: number; share: number; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-x-4 gap-y-1 sm:grid-cols-[180px_minmax(0,1fr)_96px]">
      <span className={cn("text-sm", strong ? "font-semibold text-ink" : "text-ink-2")}>{label}</span>
      <div className="order-last col-span-2 h-2 rounded-full bg-paper-2 sm:order-none sm:col-span-1">
        <div className={cn("h-full rounded-full", value < 0 ? "bg-bad/60" : strong ? "bg-forest" : "bg-ok/70")} style={{ width: `${Math.max(share * 100, value ? 1 : 0)}%` }} />
      </div>
      <span className={cn("num text-right text-sm", value < 0 ? "text-bad" : "text-ink", strong && "font-semibold")}>{signedEur(value)}</span>
    </div>
  );
}

const METHOD_ITEMS: { key: string; title: string; art: ReactNode; body: ReactNode }[] = [
  {
    key: "electrolyser",
    title: "Electrolyser",
    art: <ElectrolyserIllustration />,
    body: "Runs at available capacity in every interval where the day-ahead price is at or below the ceiling. Electricity per kg is the electrolyser figure plus the compression and auxiliaries allowance. Minimum load, ramps and outages are not simulated.",
  },
  {
    key: "battery",
    title: "Battery",
    art: <BatteryIllustration />,
    body: `Charges at or below the buy threshold and discharges at or above the sell threshold, within a ${SOC_MIN * 100}–${SOC_MAX * 100} % state-of-charge window. Losses are split evenly between charge and discharge, and it never buys and sells in the same interval. Rule-based, not an optimisation.`,
  },
  {
    key: "generation",
    title: "Solar and wind",
    art: <GenerationIllustration />,
    body: (
      <>
        Output follows an uploaded <code className="text-[13px]">generation_mw</code> profile, or an illustrative shape scaled to the capacity factor, then availability and losses. The PPA share
        blends a fixed price with spot. Negative-price curtailment applies to total output.
      </>
    ),
  },
  {
    key: "scope",
    title: "Scope",
    art: <ScopeIllustration />,
    body: "Operating margins only: revenue less electricity and grid costs. The investment view scales the period to a year and subtracts fixed OPEX — no financing, tax, escalation, degradation or replacements.",
  },
];

function MethodNotes() {
  return (
    <Panel title="How the model works">
      <ul className="grid gap-4 md:grid-cols-2">
        {METHOD_ITEMS.map((m) => (
          <li key={m.key} className="flex flex-col overflow-hidden rounded-card border border-line-2">
            <div className="border-b border-line-2 bg-paper-2 px-4 pt-3 pb-2" aria-hidden>
              {m.art}
            </div>
            <div className="p-5">
              <h3 className="text-[17px] font-medium text-ink">{m.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{m.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Step({ n, title, action, children }: { n: string; title: string; action?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id={id} className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
          <span className="num text-faint">{n} · </span>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Numeric input with unit; `scale` shows e.g. € as €m while storing raw values. */
function SimField({
  label,
  unit,
  value,
  onChange,
  error,
  help,
  scale = 1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
  help?: string;
  scale?: number;
}) {
  const id = useId();
  const shown = Number((value / scale).toFixed(4));
  const [text, setText] = useState(String(shown));
  // Sync on external changes (technology switch, cost reset) without fighting typing.
  const [last, setLast] = useState(value);
  if (last !== value && !(Number.isNaN(last) && Number.isNaN(value))) {
    setLast(value);
    if (Number(text) !== shown && Number.isFinite(value)) setText(String(shown));
  }
  return (
    <div className="py-2">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value.trim() === "" ? Number.NaN : Number(e.target.value) * scale);
          }}
          aria-invalid={!!error}
          aria-describedby={error || help ? `${id}-d` : undefined}
          className="num h-9 w-full rounded-btn border border-line bg-paper pr-[72px] pl-3 text-sm text-ink focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none aria-[invalid=true]:border-bad"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-faint">{unit}</span>
      </div>
      {(error || help) && (
        <p id={`${id}-d`} className={cn("mt-1 text-[11px] leading-snug", error ? "text-xs text-bad" : "text-faint")}>
          {error ?? help}
        </p>
      )}
    </div>
  );
}
