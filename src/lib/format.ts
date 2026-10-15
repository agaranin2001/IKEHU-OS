import type { MoneyAmount } from "@/domain/types";

const nf = (max = 0, min = 0) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: max, minimumFractionDigits: min });

export const fmtNum = (v: number | null | undefined, digits = 0) => (v == null || !Number.isFinite(v) ? "—" : nf(digits, digits).format(v));

/** 1,250 MW -> "1.25 GW"; 20 -> "20 MW". */
export function fmtMw(mw: number | null | undefined): string {
  if (mw == null) return "Undisclosed";
  if (mw >= 1000) return `${nf(2).format(mw / 1000)} GW`;
  return `${nf(mw < 10 ? 1 : 0).format(mw)} MW`;
}

export function fmtEurCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return `€${nf(2).format(v / 1e9)}bn`;
  if (abs >= 1e6) return `€${nf(1).format(v / 1e6)}m`;
  if (abs >= 1e3) return `€${nf(0).format(v / 1e3)}k`;
  return `€${nf(0).format(v)}`;
}

const SYMBOL: Partial<Record<MoneyAmount["currency"], string>> = { EUR: "€", USD: "$", GBP: "£" };

export function fmtMoney(m: MoneyAmount | null | undefined): string {
  if (!m) return "Not disclosed";
  const sym = SYMBOL[m.currency];
  const v = m.amount;
  const scaled = v >= 1e9 ? `${nf(2).format(v / 1e9)}bn` : v >= 1e6 ? `${nf(1).format(v / 1e6)}m` : nf(0).format(v);
  return sym ? `${sym}${scaled}` : `${scaled} ${m.currency}`;
}

export function fmtDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }): string {
  if (!iso) return "—";
  // Month-only strings ("2025-03") render as month + year.
  if (/^\d{4}-\d{2}$/.test(iso)) return new Date(`${iso}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  if (/^\d{4}$/.test(iso)) return iso;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/** Reference "today" for status calculations — the dataset snapshot date. */
export const SNAPSHOT_DATE = "2026-10-14";

export function daysUntil(iso: string | null | undefined, from = SNAPSHOT_DATE): number | null {
  if (!iso) return null;
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(iso.length <= 10 ? `${iso}T23:59:59Z` : iso).getTime();
  return Math.ceil((b - a) / 86400000);
}

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
