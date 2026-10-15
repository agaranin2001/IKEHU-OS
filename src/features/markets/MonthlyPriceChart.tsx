"use client";

import type { BiddingZone, PriceSeries } from "@/domain/types";
import { LineChart } from "@/components/charts/LineChart";
import { Legend } from "@/components/charts/ChartTooltip";
import { fmtNum } from "@/lib/format";
import { fmtMonth, fmtMonthShort, mergeRows, pointsInPeriod, slotColor, type ZoneSlot } from "./marketMath";

/** Monthly average day-ahead price of the selected zones over the selected period (one y-axis, €/MWh). */
export function MonthlyPriceChart({
  selection,
  seriesByCode,
  zoneByCode,
  period,
}: {
  selection: ZoneSlot[];
  seriesByCode: Map<string, PriceSeries>;
  zoneByCode: Map<string, BiddingZone>;
  period: string;
}) {
  const chosen = selection.map((s) => seriesByCode.get(s.code)).filter((s): s is PriceSeries => !!s);
  const rows = mergeRows(chosen, (s) => pointsInPeriod(s, period));
  const series = selection.map((s) => ({ key: s.code, label: `${s.code} · ${zoneByCode.get(s.code)?.name ?? s.code}`, color: slotColor(s.slot) }));

  return (
    <div>
      <Legend className="mb-3" items={series} />
      <LineChart
        data={rows}
        xKey="t"
        series={series}
        height={300}
        yUnit="€/MWh"
        zeroLine
        showLegend={false}
        formatX={(v) => (rows.length > 14 ? fmtMonthShort(String(v)) : fmtMonth(String(v)))}
        formatY={(v) => fmtNum(v, 0)}
        formatValue={(v) => `${fmtNum(v, 2)} €/MWh`}
      />
      <p className="mt-2 text-[11px] text-faint">€/MWh · monthly arithmetic mean of hourly day-ahead prices · dashed line marks 0 €/MWh</p>
    </div>
  );
}
