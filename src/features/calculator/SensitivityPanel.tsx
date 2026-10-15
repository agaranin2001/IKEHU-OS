"use client";

import { useMemo, useState } from "react";
import { Tornado } from "@/components/charts/Bars";
import { LineChart } from "@/components/charts/LineChart";
import { Segmented } from "@/components/ui/Fields";
import { Panel } from "@/components/ui/Panel";
import type { LcohInputs } from "@/domain/types";
import { sweep, type TornadoBar } from "@/lib/economics/sensitivity";

const eurKg = (v: number) => `€${v.toFixed(2)}`;

const SWEEPS = {
  electricityPriceEurMwh: { label: "Electricity price", unit: "€/MWh", from: 0, to: 150, fmt: (x: number) => `${Math.round(x)}` },
  operatingHours: { label: "Full-load hours", unit: "h/yr", from: 1000, to: 8760, fmt: (x: number) => `${Math.round(x / 100) / 10}k` },
  capexEurKw: { label: "Installed CAPEX", unit: "€/kW", from: 500, to: 3500, fmt: (x: number) => `${Math.round(x)}` },
  efficiencyKwhKg: { label: "Specific energy consumption", unit: "kWh/kg", from: 45, to: 65, fmt: (x: number) => x.toFixed(0) },
} as const;
type SweepKey = keyof typeof SWEEPS;

export function SensitivityPanel({ inputs, bars, base }: { inputs: LcohInputs; bars: TornadoBar[]; base: number }) {
  const [key, setKey] = useState<SweepKey>("electricityPriceEurMwh");
  const cfg = SWEEPS[key];
  const data = useMemo(() => sweep(inputs, key, cfg.from, cfg.to, 30).map((p) => ({ x: Math.round(p.x * 100) / 100, lcoh: Math.round(p.lcoh * 1000) / 1000 })), [inputs, key, cfg]);

  return (
    <div className="space-y-6">
      <Panel title="What moves the number" subtitle="One input changed at a time around your current case; bars sorted by impact.">
        <Tornado base={base} format={eurKg} bars={bars.map((b) => ({ key: b.field, label: b.label, swing: b.swing, low: b.lowLcoh, high: b.highLcoh }))} />
        <p className="mt-4 text-xs text-muted">
          Interactions between inputs (e.g. cheaper power when running fewer hours) are not captured by one-at-a-time sensitivity. Use the scenarios to combine changes.
        </p>
      </Panel>
      <Panel
        title={`LCOH vs ${cfg.label.toLowerCase()}`}
        subtitle={`All other inputs held at your current values (current: ${inputs[key]} ${cfg.unit}).`}
        actions={
          <Segmented
            size="sm"
            label="Sweep variable"
            value={key}
            onChange={setKey}
            options={[
              { value: "electricityPriceEurMwh", label: "Power price" },
              { value: "operatingHours", label: "Hours" },
              { value: "capexEurKw", label: "CAPEX" },
              { value: "efficiencyKwhKg", label: "SEC" },
            ]}
          />
        }
      >
        <LineChart
          data={data}
          xKey="x"
          series={[{ key: "lcoh", label: "LCOH", color: "#16825f" }]}
          formatX={(v) => `${cfg.fmt(Number(v))}`}
          formatY={(v) => `€${v.toFixed(1)}`}
          formatValue={(v) => `€${v.toFixed(2)}/kg`}
          height={260}
          referenceX={{ x: data.reduce((best, p) => (Math.abs(p.x - inputs[key]) < Math.abs(best.x - inputs[key]) ? p : best), data[0]).x, label: "current" }}
        />
        <p className="mt-2 text-center text-xs text-muted">
          {cfg.label} ({cfg.unit})
        </p>
      </Panel>
    </div>
  );
}
