/**
 * Pure helpers for the Energy Market Intelligence screen. Every figure is
 * derived from the PriceSeries passed in — nothing is hard-coded here.
 */
import type { BiddingZone, PriceSeries } from "@/domain/types";
import { cheapestHoursAverage, mean } from "@/lib/aggregate";
import { SERIES } from "@/components/charts/theme";

/* ------------------------------------------------------------------ */
/* Zone groups                                                         */
/* ------------------------------------------------------------------ */

export const ZONE_GROUPS = ["Baltics", "Finland", "Sweden", "Norway", "Denmark", "Continental"] as const;
export type ZoneGroup = (typeof ZONE_GROUPS)[number];

const GROUP_BY_COUNTRY: Record<string, ZoneGroup> = {
  EE: "Baltics",
  LV: "Baltics",
  LT: "Baltics",
  FI: "Finland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
};

export function groupOf(zone: BiddingZone): ZoneGroup {
  return GROUP_BY_COUNTRY[zone.country] ?? "Continental";
}

/** Zones bucketed into display groups, preserving dataset order inside each group. Empty groups are dropped. */
export function groupZones(zones: BiddingZone[]): { group: ZoneGroup; zones: BiddingZone[] }[] {
  return ZONE_GROUPS.map((group) => ({ group, zones: zones.filter((z) => groupOf(z) === group) })).filter((g) => g.zones.length > 0);
}

/* ------------------------------------------------------------------ */
/* Stable zone → colour slot selection                                 */
/* ------------------------------------------------------------------ */

/** A selected zone and the palette slot it owns for as long as it stays selected. */
export interface ZoneSlot {
  code: string;
  slot: number;
}

export const MAX_ZONES: number = SERIES.length;

export const slotColor = (slot: number) => SERIES[slot % SERIES.length];

/** Builds an initial selection, giving slots in order. Unknown or excess codes are ignored. */
export function initialSelection(codes: string[], available: Set<string>, max = MAX_ZONES): ZoneSlot[] {
  return codes
    .filter((c) => available.has(c))
    .slice(0, max)
    .map((code, slot) => ({ code, slot }));
}

/**
 * Toggles a zone. Removing a zone frees only its own slot — surviving zones
 * keep their colour. Adding a zone takes the lowest free slot.
 */
export function toggleZone(selection: ZoneSlot[], code: string, max = MAX_ZONES): ZoneSlot[] {
  if (selection.some((s) => s.code === code)) return selection.filter((s) => s.code !== code);
  if (selection.length >= max) return selection;
  const used = new Set(selection.map((s) => s.slot));
  let slot = 0;
  while (used.has(slot)) slot++;
  return [...selection, { code, slot }];
}

/* ------------------------------------------------------------------ */
/* Periods                                                             */
/* ------------------------------------------------------------------ */

export interface PeriodOption {
  /** "all" or a four-digit year. */
  key: string;
  /** Selector label, e.g. "2026 YTD". */
  label: string;
  /** Descriptive label incl. month span, e.g. "2026 YTD (Jan – Sep 2026)". */
  long: string;
}

const monthLabel = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }) =>
  new Date(`${iso.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

/** "Mar 2025". */
export const fmtMonth = (iso: string) => monthLabel(iso);
/** "Mar 25" — compact axis label. */
export const fmtMonthShort = (iso: string) => {
  const d = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`);
  return `${d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })} ${String(d.getUTCFullYear()).slice(2)}`;
};

/** Month span covered by a set of series, as ISO month strings. */
export function monthSpan(series: PriceSeries[]): { first: string; last: string } | null {
  const months = series.flatMap((s) => s.points.map((p) => p.t.slice(0, 7))).sort();
  return months.length ? { first: months[0], last: months[months.length - 1] } : null;
}

/** Period options derived from the data: one per calendar year (incomplete years marked YTD) plus "All". */
export function periodOptions(series: PriceSeries[]): PeriodOption[] {
  const byYear = new Map<string, Set<string>>();
  for (const s of series) {
    for (const p of s.points) {
      const y = p.t.slice(0, 4);
      if (!byYear.has(y)) byYear.set(y, new Set());
      byYear.get(y)!.add(p.t.slice(0, 7));
    }
  }
  const years = [...byYear.keys()].sort();
  const opts: PeriodOption[] = years.map((y) => {
    const months = [...byYear.get(y)!].sort();
    const complete = months.length === 12;
    const first = months[0];
    const last = months[months.length - 1];
    return {
      key: y,
      label: complete ? y : `${y} YTD`,
      long: complete ? y : `${y} YTD (${monthLabel(first, { month: "short", timeZone: "UTC" })} – ${fmtMonth(last)})`,
    };
  });
  const span = monthSpan(series);
  if (span) opts.push({ key: "all", label: "All", long: `${fmtMonth(span.first)} – ${fmtMonth(span.last)}` });
  return opts;
}

/** Latest calendar year with 12 months of data, falling back to "all". */
export function defaultPeriod(options: PeriodOption[]): string {
  const full = options.filter((o) => o.key !== "all" && !o.label.includes("YTD"));
  return full.length ? full[full.length - 1].key : "all";
}

export function pointsInPeriod(series: PriceSeries, period: string): PriceSeries["points"] {
  return period === "all" ? series.points : series.points.filter((p) => p.t.startsWith(period));
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

export interface PeriodStats {
  /** Unweighted mean of the monthly averages in the period, €/MWh. */
  avg: number;
  min: { t: string; v: number };
  max: { t: string; v: number };
  months: number;
  values: number[];
}

export function periodStats(points: PriceSeries["points"]): PeriodStats | null {
  if (!points.length) return null;
  let min = points[0];
  let max = points[0];
  for (const p of points) {
    if (p.v < min.v) min = p;
    if (p.v > max.v) max = p;
  }
  const values = points.map((p) => p.v);
  return { avg: mean(values)!, min, max, months: points.length, values };
}

/** Merges several series into chart rows keyed by timestamp: `{ t, [zone]: value }`. */
export function mergeRows(series: PriceSeries[], pick: (s: PriceSeries) => PriceSeries["points"] = (s) => s.points): Record<string, string | number>[] {
  const rows = new Map<string, Record<string, string | number>>();
  for (const s of series) {
    for (const p of pick(s)) {
      const row = rows.get(p.t) ?? { t: p.t };
      row[s.biddingZone] = p.v;
      rows.set(p.t, row);
    }
  }
  return [...rows.values()].sort((a, b) => String(a.t).localeCompare(String(b.t)));
}

export interface FlexResult {
  zone: string;
  dayAvg: number;
  cheapestAvg: number;
  /** €/MWh saved by running only in the cheapest hours. */
  delta: number;
  negativeHours: number;
  minPrice: number;
}

/** Single-day flexible-operation indicator: cheapest-N-hours average vs the full-day average. */
export function flexibleOperation(series: PriceSeries, hours: number): FlexResult | null {
  const values = series.points.map((p) => p.v);
  const dayAvg = mean(values);
  const cheapestAvg = cheapestHoursAverage(values, hours);
  if (dayAvg == null || cheapestAvg == null) return null;
  return {
    zone: series.biddingZone,
    dayAvg,
    cheapestAvg,
    delta: dayAvg - cheapestAvg,
    negativeHours: values.filter((v) => v < 0).length,
    minPrice: Math.min(...values),
  };
}

/** Parses a numeric text input within bounds; null when empty or out of range. */
export function parseBounded(raw: string, min: number, max: number): number | null {
  if (raw.trim() === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) && v >= min && v <= max ? v : null;
}

/** SEC display: "55" or "52.5". */
export const fmtSec = (v: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(v);
