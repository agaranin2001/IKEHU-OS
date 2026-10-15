"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { LcohInputs } from "@/domain/types";
import { calculateLcoh } from "@/lib/economics/lcoh";

const PARTS = [
  { k: "electricityEurKg", l: "Electricity", c: "#0fff87" },
  { k: "capexEurKg", l: "Capital", c: "#b07cf0" },
  { k: "fixedOmEurKg", l: "Fixed O&M", c: "#e3a33a" },
  { k: "stackReplacementEurKg", l: "Stack", c: "#5aa2f0" },
] as const;

/** Three-slider live LCOH widget on the homepage; full model in /calculator. */
export function CalculatorTeaser({ base }: { base: LcohInputs }) {
  const [price, setPrice] = useState(base.electricityPriceEurMwh);
  const [hours, setHours] = useState(base.operatingHours);
  const [capex, setCapex] = useState(base.capexEurKw);
  const r = useMemo(() => calculateLcoh({ ...base, electricityPriceEurMwh: price, operatingHours: hours, capexEurKw: capex }), [base, price, hours, capex]);

  const sliders = [
    { id: "price", label: "Electricity price", unit: "€/MWh", v: price, set: setPrice, min: 0, max: 150, step: 1 },
    { id: "hours", label: "Full-load hours", unit: "h/yr", v: hours, set: setHours, min: 1000, max: 8760, step: 100 },
    { id: "capex", label: "Installed CAPEX", unit: "€/kW", v: capex, set: setCapex, min: 500, max: 3500, step: 50 },
  ];

  return (
    <div className="grid overflow-hidden rounded-panel bg-deep text-cream lg:grid-cols-2" data-header="dark">
      <div className="p-8 md:p-12">
        <div className="eyebrow text-mint">Hydrogen economics</div>
        <h2 className="mt-4 text-[34px] leading-[1.1] font-light text-white md:text-[44px]">What will your hydrogen actually cost?</h2>
        <div className="mt-8 space-y-6">
          {sliders.map((s) => (
            <div key={s.id}>
              <div className="flex items-baseline justify-between text-sm">
                <label htmlFor={`t-${s.id}`} className="text-cream/80">
                  {s.label}
                </label>
                <span className="num text-white">
                  {s.v.toLocaleString("en-GB")} <span className="text-cream/50">{s.unit}</span>
                </span>
              </div>
              <input
                id={`t-${s.id}`}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.v}
                onChange={(e) => s.set(Number(e.target.value))}
                style={{ "--fill": `${((s.v - s.min) / (s.max - s.min)) * 100}%` } as CSSProperties}
                className="range-dark mt-2 w-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex flex-col justify-between border-t border-cream/10 bg-deep-2 p-8 md:p-12 lg:border-t-0 lg:border-l">
        <div>
          <div className="text-sm text-cream/60">Estimated LCOH · 20 MW PEM, base-case assumptions</div>
          <div className="mt-2 flex items-baseline gap-2" aria-live="polite">
            <span className="num text-[80px] leading-none font-light tracking-tight text-white md:text-[96px]">{r.lcohEurKg.toFixed(2)}</span>
            <span className="text-xl text-cream/60">€/kg</span>
          </div>
          <div className="mt-8 flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
            {PARTS.map((p) => (
              <div key={p.k} style={{ width: `${(r.breakdown[p.k] / r.lcohEurKg) * 100}%`, background: p.c }} className="transition-[width] duration-300" />
            ))}
            <div className="flex-1 bg-cream/20" />
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-cream/75">
            {PARTS.map((p) => (
              <li key={p.k} className="flex items-center gap-2">
                <span className="size-2 rounded-sm" style={{ background: p.c }} />
                {p.l}
                <span className="num ml-auto text-white">€{r.breakdown[p.k].toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10">
          <ButtonLink href={`/calculator?price=${price}`} variant="mint" size="lg">
            Open the full calculator
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
