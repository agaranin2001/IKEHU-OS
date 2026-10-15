"use client";

import { Info, Plus, TrendingDown } from "lucide-react";
import { useId, useState } from "react";
import type { BiddingZone, PriceSeries } from "@/domain/types";
import { LineChart } from "@/components/charts/LineChart";
import { Legend } from "@/components/charts/ChartTooltip";
import { Segmented } from "@/components/ui/Fields";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { fmtDate, fmtNum } from "@/lib/format";
import { electricityCostPerKg } from "@/lib/economics/lcoh";
import { MAX_ZONES, flexibleOperation, fmtSec, mergeRows, slotColor, type ZoneSlot } from "./marketMath";

export interface HourlySample {
  id: string;
  label: string;
  date: string;
  series: PriceSeries[];
}

const utcHour = (iso: string) => `${iso.slice(11, 13)}:00`;
const utcStamp = (iso: string) => `${fmtDate(iso, { day: "numeric", month: "short" })} ${utcHour(iso)} UTC`;

/** Hourly day-ahead profiles for a sample day plus a cheapest-hours flexible-operation illustration. */
export function HourlyPatterns({
  samples,
  selection,
  zoneByCode,
  sec,
  onAddZone,
}: {
  samples: HourlySample[];
  selection: ZoneSlot[];
  zoneByCode: Map<string, BiddingZone>;
  sec: number | null;
  onAddZone: (code: string) => void;
}) {
  const [sampleId, setSampleId] = useState(samples[0]?.id ?? "");
  const [hours, setHours] = useState(16);
  const sliderId = useId();
  const sample = samples.find((s) => s.id === sampleId) ?? samples[0];

  if (!sample) return <EmptyState title="No hourly samples in this dataset" />;

  const byZone = new Map(sample.series.map((s) => [s.biddingZone, s]));
  const shown = selection.filter((s) => byZone.has(s.code));
  const unavailable = selection.filter((s) => !byZone.has(s.code)).map((s) => s.code);
  const available = sample.series.map((s) => s.biddingZone);
  const shownSeries = shown.map((s) => byZone.get(s.code)!);
  const rows = mergeRows(shownSeries);
  const first = rows[0]?.t as string | undefined;
  const last = rows[rows.length - 1]?.t as string | undefined;
  const flex = shown.flatMap((s) => {
    const r = flexibleOperation(byZone.get(s.code)!, hours);
    return r ? [{ slot: s.slot, r }] : [];
  });
  const negatives = flex.filter((x) => x.r.negativeHours > 0);
  const chartSeries = shown.map((s) => ({ key: s.code, label: `${s.code} · ${zoneByCode.get(s.code)?.name ?? s.code}`, color: slotColor(s.slot) }));
  const canAdd = selection.length < MAX_ZONES;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-1 max-w-full overflow-x-auto px-1">
          <Segmented
            label="Sample delivery day"
            size="sm"
            value={sample.id}
            onChange={setSampleId}
            options={samples.map((s) => ({ value: s.id, label: fmtDate(s.date) }))}
          />
        </div>
        <Badge tone="violet">Single-day illustration — not an annual estimate</Badge>
      </div>
      <p className="mt-2 text-sm text-ink-2">{sample.label}</p>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No hourly sample for the selected zones on this day"
            body={`Hourly profiles exist for ${available.join(", ")}.${canAdd ? " Add one to compare." : ` Deselect a zone first (maximum ${MAX_ZONES}).`}`}
            action={
              canAdd ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {available.slice(0, 4).map((code) => (
                    <Button key={code} variant="secondary" size="sm" onClick={() => onAddZone(code)}>
                      <Plus className="size-3.5" aria-hidden /> {code}
                    </Button>
                  ))}
                </div>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <Legend className="mb-3" items={chartSeries} />
            <LineChart
              data={rows}
              xKey="t"
              series={chartSeries}
              height={280}
              yUnit="€/MWh"
              zeroLine
              showLegend={false}
              formatX={(v) => utcHour(String(v))}
              formatY={(v) => fmtNum(v, 0)}
              formatValue={(v) => `${fmtNum(v, 2)} €/MWh`}
            />
            <p className="mt-2 text-[11px] text-faint">
              €/MWh · x-axis: hour start in <strong className="font-semibold text-muted">UTC</strong>
              {first && last ? ` — this delivery day runs ${utcStamp(first)} to ${utcStamp(last)} (hour start), i.e. one local CET/CEST day.` : "."}
            </p>
          </div>

          {unavailable.length > 0 && (
            <p className="mt-3 flex items-start gap-2 text-xs text-muted">
              <Info className="mt-0.5 size-3.5 shrink-0 text-faint" aria-hidden />
              No hourly sample in this dataset for {unavailable.join(", ")}. Hourly profiles cover {available.join(", ")}.
            </p>
          )}

          <div className="mt-3 flex items-start gap-2 rounded-btn bg-paper-2 px-3 py-2.5 text-xs leading-relaxed text-ink-2">
            <TrendingDown className="mt-0.5 size-3.5 shrink-0 text-violet" aria-hidden />
            <p>
              {negatives.length > 0 ? (
                <>
                  Negative prices on this day:{" "}
                  {negatives.map((x, i) => (
                    <span key={x.r.zone}>
                      {i > 0 && "; "}
                      <span className="font-medium">{x.r.zone}</span> {x.r.negativeHours} h (min {fmtNum(x.r.minPrice, 2)} €/MWh)
                    </span>
                  ))}
                  .{" "}
                </>
              ) : (
                <>No negative prices among the zones shown on this day. </>
              )}
              Day-ahead prices turn negative when inflexible or subsidised generation (often solar or wind) exceeds demand and export capacity. A flexible electrolyser
              consuming in those hours is paid for its energy — but grid fees and taxes usually still apply.
            </p>
          </div>

          <section className="mt-5 rounded-card border border-line-2 bg-paper-2 p-4" aria-labelledby={`${sliderId}-h`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id={`${sliderId}-h`} className="text-sm font-semibold text-ink">
                Flexible operation
              </h3>
              <span className="text-[11px] text-faint">Same sample day · {fmtDate(sample.date)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Average price if the electrolyser only runs in the cheapest hours of this day, compared with running all 24 hours.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label htmlFor={sliderId} className="text-xs font-medium text-ink-2">
                Operating hours per day
              </label>
              <input
                id={sliderId}
                type="range"
                min={4}
                max={24}
                step={1}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="h-1.5 min-w-40 flex-1 cursor-pointer accent-forest"
                aria-valuetext={`${hours} hours`}
              />
              <span className="num w-14 text-right text-sm font-medium text-ink">{hours} h</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-[13px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] font-medium text-muted">
                    <th scope="col" className="py-2 pr-3 font-medium">Zone</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">24-h average €/MWh</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Cheapest {hours} h avg €/MWh</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Difference €/MWh</th>
                    <th scope="col" className="py-2 text-right font-medium">Implied saving €/kg H₂{sec != null ? ` at ${fmtSec(sec)} kWh/kg` : ""}</th>
                  </tr>
                </thead>
                <tbody>
                  {flex.map(({ slot, r }) => (
                    <tr key={r.zone} className="border-b border-line-2 last:border-0">
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-2 font-medium text-ink">
                          <span aria-hidden className="size-2 rounded-full" style={{ background: slotColor(slot) }} />
                          {r.zone}
                        </span>
                      </td>
                      <td className="num py-2 pr-3 text-right text-ink-2">{fmtNum(r.dayAvg, 2)}</td>
                      <td className="num py-2 pr-3 text-right text-ink">{fmtNum(r.cheapestAvg, 2)}</td>
                      <td className="num py-2 pr-3 text-right text-ink-2">{fmtNum(r.delta, 2)}</td>
                      <td className="num py-2 text-right font-medium text-forest">{sec != null ? fmtNum(electricityCostPerKg(r.delta, sec), 3) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-faint">
              Illustration for one delivery day only — not an annual estimate. Saving = (24-h average − cheapest-{hours}-h average) × SEC ÷ 1000. Assumes full load in the
              selected hours; ignores ramping limits, minimum load, storage and the higher capex share per kg from fewer operating hours.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
