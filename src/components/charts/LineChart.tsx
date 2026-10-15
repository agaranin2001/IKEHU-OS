"use client";

import { CartesianGrid, Line, LineChart as RLineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART } from "./theme";
import { Legend, TooltipCard } from "./ChartTooltip";

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

/**
 * Multi-series line chart. One y-axis only. Data is an array of rows keyed
 * by `xKey` plus one numeric field per series key.
 */
export function LineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 280,
  yUnit,
  formatX,
  formatY = (v) => String(Math.round(v)),
  formatValue,
  zeroLine,
  showLegend = true,
  referenceX,
}: {
  data: T[];
  xKey: keyof T & string;
  series: LineSeries[];
  height?: number;
  yUnit?: string;
  formatX?: (v: string | number) => string;
  formatY?: (v: number) => string;
  formatValue?: (v: number) => string;
  zeroLine?: boolean;
  showLegend?: boolean;
  referenceX?: { x: number | string; label: string };
}) {
  const fv = formatValue ?? ((v: number) => `${v.toFixed(2)}${yUnit ? ` ${yUnit}` : ""}`);
  return (
    <div>
      {showLegend && series.length > 1 && <Legend className="mb-3" items={series} />}
      <div style={{ height }} role="img" aria-label={`Line chart of ${series.map((s) => s.label).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey={xKey as never}
              tick={{ fill: CHART.text, fontSize: CHART.font }}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
              tickFormatter={formatX}
              minTickGap={24}
            />
            <YAxis tick={{ fill: CHART.text, fontSize: CHART.font }} tickLine={false} axisLine={false} tickFormatter={formatY} width={48} />
            {zeroLine && <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="2 3" />}
            {referenceX && <ReferenceLine x={referenceX.x} stroke={CHART.ink} strokeDasharray="3 3" label={{ value: referenceX.label, position: "insideTopRight", fill: CHART.text, fontSize: 10 }} />}
            <Tooltip
              cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={formatX ? formatX(label as string) : String(label)}
                    rows={payload.map((p) => {
                      const s = series.find((x) => x.key === p.dataKey);
                      return { key: String(p.dataKey), label: s?.label ?? String(p.dataKey), value: typeof p.value === "number" ? fv(p.value) : "—", color: s?.color };
                    })}
                  />
                ) : null
              }
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
