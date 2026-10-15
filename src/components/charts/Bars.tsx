"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/** Horizontal bar list (HTML) — crisp labels, used for ranked comparisons. */
export function BarList({
  items,
  format,
  max,
  className,
  highlight,
}: {
  items: { key: string; label: ReactNode; value: number; color?: string; sub?: ReactNode }[];
  format: (v: number) => string;
  max?: number;
  className?: string;
  highlight?: string;
}) {
  const top = max ?? Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((i) => (
        <li key={i.key} className={cn("grid grid-cols-[minmax(84px,30%)_1fr_auto] items-center gap-3 text-sm", highlight && highlight !== i.key && "opacity-60")}>
          <span className="truncate text-ink-2">
            {i.label}
            {i.sub && <span className="block text-[11px] text-faint">{i.sub}</span>}
          </span>
          <span className="relative h-2.5 rounded-full bg-paper-2">
            <span
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max((Math.abs(i.value) / top) * 100, 1.5)}%`, background: i.color ?? "#16825f" }}
            />
          </span>
          <span className="num w-20 text-right text-ink">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Single stacked bar with legend — used for cost breakdowns. 2px gaps between segments. */
export function StackedBar({
  parts,
  format,
  height = 14,
}: {
  parts: { key: string; label: string; value: number; color: string }[];
  format: (v: number) => string;
  height?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = parts.reduce((a, p) => a + Math.max(p.value, 0), 0) || 1;
  return (
    <div>
      <div className="flex w-full gap-[2px] overflow-hidden rounded-full" style={{ height }}>
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <div
              key={p.key}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              title={`${p.label}: ${format(p.value)}`}
              className={cn("h-full transition-opacity", hover && hover !== p.key && "opacity-40")}
              style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
            />
          ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {parts.map((p) => (
          <li
            key={p.key}
            onMouseEnter={() => setHover(p.key)}
            onMouseLeave={() => setHover(null)}
            className={cn("flex items-center gap-2 text-sm transition-opacity", hover && hover !== p.key && "opacity-50")}
          >
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: p.color }} />
            <span className="flex-1 text-ink-2">{p.label}</span>
            <span className="num text-ink">{format(p.value)}</span>
            <span className="num w-10 text-right text-xs text-faint">{((Math.max(p.value, 0) / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tornado chart for one-at-a-time sensitivities around a base value. */
export function Tornado({
  bars,
  base,
  format,
}: {
  bars: { key: string; label: string; swing: string; low: number; high: number }[];
  base: number;
  format: (v: number) => string;
}) {
  const span = Math.max(...bars.flatMap((b) => [Math.abs(b.low - base), Math.abs(b.high - base)]), 0.01);
  const pct = (v: number) => 50 + ((v - base) / span) * 48;
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-series-1" /> Favourable change
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-series-5" /> Adverse change
        </span>
        <span className="ml-auto num text-muted">Base {format(base)}</span>
      </div>
      <ul className="space-y-3">
        {bars.map((b) => {
          const lo = Math.min(b.low, b.high);
          const hi = Math.max(b.low, b.high);
          return (
            <li key={b.key} className="grid grid-cols-[minmax(110px,32%)_1fr] items-center gap-3">
              <span className="text-sm text-ink-2">
                {b.label}
                <span className="block text-[11px] text-faint">{b.swing}</span>
              </span>
              <div className="relative h-7">
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink/30" />
                <span
                  className="group absolute top-1 bottom-1 rounded-l-[4px] bg-series-1"
                  style={{ left: `${pct(lo)}%`, width: `${Math.max(pct(base) - pct(lo), 0.4)}%` }}
                  title={`${format(lo)}`}
                />
                <span
                  className="absolute top-1 bottom-1 rounded-r-[4px] bg-series-5"
                  style={{ left: `${pct(base)}%`, width: `${Math.max(pct(hi) - pct(base), 0.4)}%` }}
                  title={`${format(hi)}`}
                />
                <span className="num absolute top-1/2 -translate-y-1/2 pr-1.5 text-[11px] text-ink-2" style={{ right: `${100 - pct(lo)}%` }}>
                  {format(lo)}
                </span>
                <span className="num absolute top-1/2 -translate-y-1/2 pl-1.5 text-[11px] text-ink-2" style={{ left: `${pct(hi)}%` }}>
                  {format(hi)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Minimal inline sparkline. */
export function Sparkline({ values, color = "#16825f", width = 120, height = 32 }: { values: number[]; color?: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const r = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 2 - ((v - min) / r) * (height - 4)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
