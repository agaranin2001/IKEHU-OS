/**
 * Opportunity Radar — pure view-model helpers (server-safe, no React).
 *
 * Status is computed as of the dataset snapshot date: a record stored as
 * "open"/"upcoming" whose deadline has passed reads as "closed".
 */
import type { MoneyAmount, Opportunity, OpportunityStatus, OpportunityType } from "@/domain/types";
import type { Tone } from "@/lib/labels";
import { SNAPSHOT_DATE, daysUntil, fmtDate, fmtMoney } from "@/lib/format";

export const STATUS_ORDER: OpportunityStatus[] = ["open", "upcoming", "closed", "historical"];

export function effectiveStatus(o: Pick<Opportunity, "status" | "deadline">, asOf = SNAPSHOT_DATE): OpportunityStatus {
  if ((o.status === "open" || o.status === "upcoming") && o.deadline) {
    const d = daysUntil(o.deadline, asOf);
    if (d != null && d < 0) return "closed";
  }
  return o.status;
}

export const isInactive = (s: OpportunityStatus) => s === "closed" || s === "historical";

export function statusCounts(items: Opportunity[]): Record<OpportunityStatus, number> {
  const out: Record<OpportunityStatus, number> = { open: 0, upcoming: 0, closed: 0, historical: 0 };
  for (const o of items) out[effectiveStatus(o)]++;
  return out;
}

export const fmtBudget = (m: MoneyAmount | null | undefined) => (m ? fmtMoney(m) : "Not stated");

export interface DeadlineInfo {
  /** Short label, e.g. "23 days left", "Closed on 4 Mar 2025". */
  label: string;
  /** Formatted deadline date, or null when none is recorded. */
  date: string | null;
  days: number | null;
  tone: Tone;
}

export function deadlineInfo(o: Pick<Opportunity, "status" | "deadline">): DeadlineInfo {
  const status = effectiveStatus(o);
  if (!o.deadline) {
    const label = isInactive(status) ? "No deadline recorded" : status === "upcoming" ? "Deadline not yet announced" : "Rolling / no fixed deadline";
    return { label, date: null, days: null, tone: "neutral" };
  }
  const days = daysUntil(o.deadline);
  const date = fmtDate(o.deadline);
  if (days == null) return { label: date, date, days, tone: "neutral" };
  if (days < 0) return { label: `Closed on ${date}`, date, days, tone: "neutral" };
  if (status === "historical") return { label: `Deadline ${date}`, date, days, tone: "neutral" };
  if (days === 0) return { label: "Closes today", date, days, tone: "bad" };
  return { label: `${days} day${days === 1 ? "" : "s"} left`, date, days, tone: days <= 14 ? "bad" : days <= 45 ? "warn" : "ok" };
}

export const INACTIVE_LABEL: Record<"closed" | "historical", string> = {
  closed: "Closed — shown for reference, not open for applications",
  historical: "Historical example — not open for applications",
};

/* ------------------------------------------------------------------ */
/* Client-side refinement                                              */
/* ------------------------------------------------------------------ */

export type DeadlineWindow = "" | "30" | "90" | "180";
export type BudgetFloor = "" | "10000000" | "100000000" | "1000000000";

export interface RadarFilters {
  search: string;
  eligibility: string;
  types: OpportunityType[];
  statuses: OpportunityStatus[];
  country: string;
  technology: string;
  deadline: DeadlineWindow;
  budget: BudgetFloor;
}

export const EMPTY_RADAR_FILTERS: RadarFilters = {
  search: "",
  eligibility: "",
  types: [],
  statuses: [],
  country: "",
  technology: "",
  deadline: "",
  budget: "",
};

export const DEADLINE_OPTIONS: { value: DeadlineWindow; label: string }[] = [
  { value: "", label: "Any deadline" },
  { value: "30", label: "Next 30 days" },
  { value: "90", label: "Next 90 days" },
  { value: "180", label: "Next 180 days" },
];

export const BUDGET_OPTIONS: { value: BudgetFloor; label: string }[] = [
  { value: "", label: "Any budget" },
  { value: "10000000", label: "≥ €10m" },
  { value: "100000000", label: "≥ €100m" },
  { value: "1000000000", label: "≥ €1bn" },
];

export const radarActiveCount = (f: RadarFilters) =>
  f.types.length + f.statuses.length + (f.country ? 1 : 0) + (f.technology ? 1 : 0) + (f.deadline ? 1 : 0) + (f.budget ? 1 : 0) + (f.eligibility.trim() ? 1 : 0);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Filters the service does not support (computed status, deadline window,
 * budget floor, eligibility keywords). Budget floors compare EUR budgets only;
 * records with no budget or a non-EUR budget are excluded while a floor is set.
 */
export function refineOpportunities(items: Opportunity[], f: RadarFilters): Opportunity[] {
  const kw = norm(f.eligibility.trim());
  const floor = f.budget ? Number(f.budget) : 0;
  const window = f.deadline ? Number(f.deadline) : 0;
  const rank = (o: Opportunity) => STATUS_ORDER.indexOf(effectiveStatus(o));
  return items
    .filter((o) => {
      const status = effectiveStatus(o);
      if (f.statuses.length && !f.statuses.includes(status)) return false;
      if (window) {
        const d = daysUntil(o.deadline);
        if (d == null || d < 0 || d > window) return false;
      }
      if (floor && !(o.budget && o.budget.currency === "EUR" && o.budget.amount >= floor)) return false;
      if (kw && !o.eligibility.some((e) => norm(e).includes(kw))) return false;
      return true;
    })
    .sort((a, b) => {
      const byStatus = rank(a) - rank(b);
      if (byStatus) return byStatus;
      // Active: soonest deadline first. Closed / historical: most recent first.
      return isInactive(effectiveStatus(a))
        ? (b.deadline ?? "").localeCompare(a.deadline ?? "")
        : (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
    });
}
