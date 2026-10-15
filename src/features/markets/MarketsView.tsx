"use client";

import { useMemo, useState } from "react";
import type { BiddingZone, PriceSeries } from "@/domain/types";
import { services } from "@/services";
import { useResource } from "@/hooks/useResource";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { SelectField, TextField } from "@/components/ui/Fields";
import { Panel } from "@/components/ui/Panel";
import { ResourceView, Skeleton } from "@/components/ui/States";
import { HourlyPatterns, type HourlySample } from "./HourlyPatterns";
import { InputCostTable } from "./InputCostTable";
import { Methodology } from "./Methodology";
import { MonthlyPriceChart } from "./MonthlyPriceChart";
import { ZoneKpis } from "./ZoneKpis";
import { ZoneRanking } from "./ZoneRanking";
import { ZoneSelector } from "./ZoneSelector";
import {
  defaultPeriod,
  fmtSec,
  initialSelection,
  monthSpan,
  parseBounded,
  periodOptions,
  periodStats,
  pointsInPeriod,
  toggleZone,
  type PeriodStats,
  type ZoneSlot,
} from "./marketMath";

const DEFAULT_ZONES = ["EE", "FI", "SE3", "NO2", "DE-LU"];
const DEFAULT_SEC = 55;
const DEFAULT_GRID_FEE = 8;
const SEC_RANGE = [30, 120] as const;
/** Quick picks for specific energy consumption (kWh/kg H₂); any value in SEC_RANGE can still be typed in the filter bar. */
const SEC_PRESETS = [45, 50, 52.5, 55, 57.5, 60, 65];
const GRID_FEE_RANGE = [0, 500] as const;

interface MarketData {
  zones: BiddingZone[];
  monthly: PriceSeries[];
  samples: HourlySample[];
  info: { compiledAt: string; coverage: string; notes: string };
}

async function loadMarketData(): Promise<MarketData> {
  const [zones, monthly, samples, info] = await Promise.all([
    services.energy.zones(),
    services.energy.monthly(),
    services.energy.hourlySamples(),
    services.energy.info(),
  ]);
  return { zones, monthly, samples, info };
}

/** /app/markets — Energy Market Intelligence. */
export function MarketsView() {
  const res = useResource("markets:dataset", loadMarketData);
  return (
    <>
      <PageHeader title="Energy Market Intelligence" />
      <PageBody>
        <ResourceView resource={res} loading={<MarketsSkeleton />}>
          {(data) => <MarketsDashboard data={data} />}
        </ResourceView>
      </PageBody>
    </>
  );
}

function MarketsSkeleton() {
  return (
    <div role="status" aria-label="Loading market data" className="space-y-6">
      <Skeleton className="h-44 w-full rounded-card" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-60 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-card" />
      <Skeleton className="h-[480px] w-full rounded-card" />
      <Skeleton className="h-[480px] w-full rounded-card" />
    </div>
  );
}

function MarketsDashboard({ data }: { data: MarketData }) {
  const { zones, monthly, samples, info } = data;
  const zoneByCode = useMemo(() => new Map(zones.map((z) => [z.code, z])), [zones]);
  const seriesByCode = useMemo(() => new Map(monthly.map((s) => [s.biddingZone, s])), [monthly]);
  const periods = useMemo(() => periodOptions(monthly), [monthly]);
  const span = useMemo(() => monthSpan(monthly), [monthly]);
  const defaults = useMemo(() => initialSelection(DEFAULT_ZONES, new Set(zones.map((z) => z.code))), [zones]);

  const [selection, setSelection] = useState<ZoneSlot[]>(defaults);
  const [period, setPeriod] = useState(() => defaultPeriod(periods));
  const [secRaw, setSecRaw] = useState(String(DEFAULT_SEC));
  const [feeRaw, setFeeRaw] = useState(String(DEFAULT_GRID_FEE));

  const sec = parseBounded(secRaw, SEC_RANGE[0], SEC_RANGE[1]);
  const gridFee = parseBounded(feeRaw, GRID_FEE_RANGE[0], GRID_FEE_RANGE[1]);
  const periodOpt = periods.find((p) => p.key === period) ?? periods[periods.length - 1];
  const periodLabel = periodOpt?.label ?? "—";

  const statsByCode = useMemo(() => {
    const m = new Map<string, PeriodStats | null>();
    for (const z of zones) {
      const s = seriesByCode.get(z.code);
      m.set(z.code, s ? periodStats(pointsInPeriod(s, period)) : null);
    }
    return m;
  }, [zones, seriesByCode, period]);

  const toggle = (code: string) => setSelection((sel) => toggleZone(sel, code));
  const isDefault = selection.length === defaults.length && selection.every((s, i) => s.code === defaults[i].code && s.slot === defaults[i].slot);
  // No zones chosen means "all zones"; colours then cycle through the palette.
  const shown = useMemo(() => (selection.length ? selection : zones.map((z, slot) => ({ code: z.code, slot }))), [selection, zones]);
  // Clicking zone cards makes them "active"; every widget below then shows only the active zones.
  const [active, setActive] = useState<string[]>([]);
  const focused = useMemo(() => {
    const f = shown.filter((s) => active.includes(s.code));
    return f.length ? f : shown;
  }, [shown, active]);
  const hasFocus = focused.length < shown.length;
  const toggleActive = (code: string) => setActive((a) => (a.includes(code) ? a.filter((c) => c !== code) : [...a, code]));
  const restore = () => setSelection(defaults);

  return (
    <div className="space-y-6">
      {/* 2 · Filters */}
      <Panel bodyClassName="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <ZoneSelector zones={zones} selection={selection} onToggle={toggle} onReset={restore} onClear={() => setSelection([])} isDefault={isDefault} />
          <SelectField label="Period" value={period} onChange={(e) => setPeriod(e.target.value)} options={periods.map((p) => ({ value: p.key, label: p.label }))} triggerClassName="h-[42px]" />
          <TextField
            label="Specific energy consumption"
            hint="kWh/kg H₂"
            type="number"
            inputMode="decimal"
            min={SEC_RANGE[0]}
            max={SEC_RANGE[1]}
            step={0.5}
            value={secRaw}
            onChange={(e) => setSecRaw(e.target.value)}
            error={sec == null ? `Enter ${SEC_RANGE[0]}–${SEC_RANGE[1]} kWh/kg` : undefined}
          />
        </div>
      </Panel>

      {/* 3 · KPI tiles */}
      <section aria-labelledby="kpi-h">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="kpi-h" className="text-xl font-light text-ink">
            Selected zones · <span className="text-muted">{periodOpt?.long}</span>
          </h2>
          {hasFocus ? (
            <span className="flex items-center gap-3 text-[13px] text-muted" aria-live="polite">
              Showing {focused.map((f) => f.code).join(", ")} below
              <button type="button" onClick={() => setActive([])} className="font-medium text-forest hover:underline">
                Show all
              </button>
            </span>
          ) : (
            <span className="text-[13px] text-muted">Click zones to focus the charts below</span>
          )}
        </div>
        <ZoneKpis selection={shown} zoneByCode={zoneByCode} statsByCode={statsByCode} periodLabel={periodLabel} sec={sec} active={hasFocus ? focused.map((f) => f.code) : []} onToggle={toggleActive} />
      </section>

      {/* 4 · Monthly chart */}
      <Panel title="Monthly average day-ahead price" subtitle={`€/MWh · ${periodOpt?.long ?? ""} · selected zones`}>
        <MonthlyPriceChart selection={focused} seriesByCode={seriesByCode} zoneByCode={zoneByCode} period={period} />
      </Panel>

      <div className="space-y-6">
        {/* 5 · Ranking */}
        <Panel
          title="Bidding-zone comparison"
          bodyClassName="p-0"
          actions={
            <SelectField
              aria-label="Specific energy consumption for €/kg H₂"
              className="w-[190px]"
              value={secRaw}
              onChange={(e) => setSecRaw(e.target.value)}
              options={[...new Set([...SEC_PRESETS.map(String), secRaw])]
                .filter((v) => v.trim() !== "")
                .sort((a, b) => Number(a) - Number(b))
                .map((v) => ({ value: v, label: `at ${v} kWh/kg` }))}
            />
          }
          footer={<>Coloured bars are your selected zones. €/kg = electricity input only (price × SEC ÷ 1000).</>}
        >
          <ZoneRanking zones={zones} statsByCode={statsByCode} selection={hasFocus ? focused : selection} sec={sec} />
        </Panel>

        {/* 6 · Hourly patterns */}
        <Panel
          title="Daily price patterns"
          subtitle="Hourly day-ahead prices on sample delivery days · €/MWh · hours in UTC"
          footer={<>Hourly profiles exist only for the sample days and zones listed in the methodology — they illustrate intraday shape, not typical annual conditions.</>}
        >
          <HourlyPatterns samples={samples} selection={focused} zoneByCode={zoneByCode} sec={sec} onAddZone={toggle} />
        </Panel>
      </div>

      {/* 7 · Input cost table */}
      <Panel
        title="Estimated electricity input cost for hydrogen production"
        subtitle={`${periodOpt?.long ?? ""} · day-ahead average + grid fee input${sec != null ? ` · ${fmtSec(sec)} kWh/kg` : ""}`}
        actions={
          <TextField
            className="w-44"
            label="Grid fee input"
            hint="€/MWh"
            type="number"
            inputMode="decimal"
            min={GRID_FEE_RANGE[0]}
            max={GRID_FEE_RANGE[1]}
            step={0.5}
            value={feeRaw}
            onChange={(e) => setFeeRaw(e.target.value)}
            error={gridFee == null ? `Enter ${GRID_FEE_RANGE[0]}–${GRID_FEE_RANGE[1]} €/MWh` : undefined}
          />
        }
        footer={
          <>
            Electricity input only — excludes taxes, levies, supplier margins, capex, O&amp;M, water and stack replacement. The grid fee is your assumption, not sourced data. The
            calculator link passes the day-ahead average (rounded, without grid fee) and the zone code.
          </>
        }
      >
        <InputCostTable selection={focused} zoneByCode={zoneByCode} statsByCode={statsByCode} gridFee={gridFee} sec={sec} periodLabel={periodLabel} />
      </Panel>

      {/* 8 · Methodology */}
      <section aria-labelledby="method-h">
        <div className="mb-4">
          <h2 id="method-h" className="text-xl font-light text-ink">
            Methodology & sources
          </h2>
          <p className="mt-1 text-sm text-muted">How this page is built and where every number comes from</p>
        </div>
        <Methodology info={info} monthly={monthly} hourly={samples.flatMap((s) => s.series)} span={span} />
      </section>
    </div>
  );
}
