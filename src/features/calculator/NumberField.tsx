"use client";

import { Info } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { Benchmark } from "@/domain/types";
import { fmtNum } from "@/lib/format";
import { ORIGIN_LABEL, type FieldDef, type FieldOrigin } from "./fields";

const originStyle: Record<FieldOrigin, string> = {
  user: "bg-violet-soft text-violet",
  scenario: "bg-stone text-ink-2",
  market: "bg-info-soft text-info",
  technology: "bg-mint-soft text-forest",
};

/**
 * Numeric input with unit, optional slider, origin tag (where the value came
 * from), sourced benchmark hint and inline validation message.
 */
export function NumberField({
  def,
  value,
  origin,
  onChange,
  error,
  benchmark,
}: {
  def: FieldDef;
  value: number;
  origin: FieldOrigin;
  onChange: (v: number) => void;
  error?: string;
  benchmark?: Benchmark;
}) {
  const id = useId();
  const [text, setText] = useState(String(value));
  const [showHelp, setShowHelp] = useState(false);
  // Sync when the value changes externally (scenario switch) without fighting typing.
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value && !(Number.isNaN(lastValue) && Number.isNaN(value))) {
    setLastValue(value);
    if (Number(text) !== value && Number.isFinite(value)) setText(String(Number(value.toFixed(4))));
  }

  const commit = (s: string) => {
    setText(s);
    const n = s.trim() === "" ? Number.NaN : Number(s);
    onChange(n);
  };

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {def.label}
        </label>
        <button type="button" onClick={() => setShowHelp((s) => !s)} aria-label={`About ${def.label}`} aria-expanded={showHelp} className="text-faint hover:text-forest">
          <Info className="size-3.5" />
        </button>
        <span className={cn("ml-auto rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide", originStyle[origin])}>{ORIGIN_LABEL[origin]}</span>
      </div>
      {showHelp && <p className="mb-2 text-xs leading-relaxed text-muted">{def.help}</p>}
      <div className="flex items-center gap-3">
        {def.slider && (
          <input
            type="range"
            aria-label={`${def.label} slider`}
            min={def.min}
            max={def.max}
            step={def.step}
            value={Number.isFinite(value) ? Math.min(Math.max(value, def.min), def.max) : def.min}
            onChange={(e) => commit(e.target.value)}
            className="h-1.5 flex-1 cursor-pointer accent-forest"
          />
        )}
        <div className={cn("relative", def.slider ? "w-[132px] shrink-0" : "w-full")}>
          <input
            id={id}
            inputMode="decimal"
            value={text}
            onChange={(e) => commit(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-e` : undefined}
            className="num h-9 w-full rounded-btn border border-line bg-paper pr-[72px] pl-3 text-sm text-ink focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none aria-[invalid=true]:border-bad"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-faint">{def.unit}</span>
        </div>
      </div>
      {error && (
        <p id={`${id}-e`} className="mt-1 text-xs text-bad">
          {error}
        </p>
      )}
      {benchmark && !error && (
        <p className="mt-1 text-[11px] text-faint" title={`${benchmark.scope} — ${benchmark.source.publisher}`}>
          Benchmark {fmtNum(benchmark.low, benchmark.low < 10 ? 1 : 0)}–{fmtNum(benchmark.high, benchmark.high < 10 ? 1 : 0)} {benchmark.unit}
          {benchmark.central != null ? ` (central ${fmtNum(benchmark.central, benchmark.central < 10 ? 1 : 0)})` : ""} ·{" "}
          <a href={benchmark.source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-forest">
            {benchmark.source.publisher} {benchmark.year}
          </a>
        </p>
      )}
    </div>
  );
}
