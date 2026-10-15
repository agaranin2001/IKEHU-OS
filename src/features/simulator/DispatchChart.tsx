"use client";

import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART } from "@/components/charts/theme";
import { Legend, TooltipCard } from "@/components/charts/ChartTooltip";
import { fmtNum } from "@/lib/format";
import type { SimStep } from "./model";

const PRICE = "#101f1e";
const IN = "#16825f";
const OUT = "#7c18d3";

const stamp = (iso: string, multiDay: boolean) => {
  const d = new Date(iso);
  const hh = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return multiDay ? `${d.getUTCDate()} ${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })} ${hh}` : hh;
};

/** Market price (line, left axis) and dispatched power (bars, right axis) per interval. */
export function DispatchChart({ steps, inLabel, outLabel, height = 300 }: { steps: SimStep[]; inLabel: string; outLabel?: string; height?: number }) {
  const multiDay = steps.length > 1 && Date.parse(steps.at(-1)!.t) - Date.parse(steps[0].t) >= 86_400_000;
  const data = steps.map((s) => ({ t: s.t, price: s.price, mw: s.mw }));
  const legend = [
    { key: "price", label: "Day-ahead price · €/MWh", color: PRICE },
    { key: "in", label: `${inLabel} · MW`, color: IN },
    ...(outLabel ? [{ key: "out", label: `${outLabel} · MW`, color: OUT }] : []),
  ];

  return (
    <div>
      <Legend className="mb-3" items={legend} />
      <div style={{ height }} role="img" aria-label={`Chart of day-ahead price and ${inLabel.toLowerCase()} for ${steps.length} intervals`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: CHART.text, fontSize: CHART.font }}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
              tickFormatter={(v: string) => stamp(v, multiDay)}
              minTickGap={28}
            />
            <YAxis yAxisId="price" tick={{ fill: CHART.text, fontSize: CHART.font }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => fmtNum(v)} />
            <YAxis yAxisId="mw" orientation="right" tick={{ fill: CHART.text, fontSize: CHART.font }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => fmtNum(v)} />
            <ReferenceLine yAxisId="price" y={0} stroke={CHART.axis} strokeDasharray="2 3" />
            <Tooltip
              cursor={{ fill: "rgb(16 31 30 / 0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <TooltipCard
                    title={`${stamp(String(label), true)} UTC`}
                    rows={[
                      { key: "p", label: "Price", value: `${fmtNum(row.price, 2)} €/MWh`, color: PRICE },
                      { key: "m", label: row.mw < 0 ? outLabel ?? "Output" : inLabel, value: `${fmtNum(Math.abs(row.mw), 1)} MW`, color: row.mw < 0 ? OUT : IN },
                    ]}
                  />
                );
              }}
            />
            <Bar yAxisId="mw" dataKey="mw" maxBarSize={18} radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.t} fill={d.mw < 0 ? OUT : IN} fillOpacity={0.55} />
              ))}
            </Bar>
            <Line yAxisId="price" type="stepAfter" dataKey="price" stroke={PRICE} strokeWidth={1.75} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
