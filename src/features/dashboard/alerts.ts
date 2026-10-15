import type { HydrogenProject, Opportunity } from "@/domain/types";
import { daysUntil, fmtDate } from "@/lib/format";

export interface Alert {
  id: string;
  badge: string;
  tone: "warn" | "bad";
  where: string;
  title: string;
  meta: string;
  href: string;
}

/** Alert window for upcoming deadlines, in days. */
const DEADLINE_WINDOW = 45;

/**
 * Alerts derived from the dataset at the snapshot date: calls closing within
 * 45 days (soonest first), then cancelled and delayed projects. Pure, so the
 * dashboard widget and the top-bar notifications always agree.
 */
export function buildAlerts(opportunities: Opportunity[], projects: HydrogenProject[]): Alert[] {
  const deadlines = opportunities
    .filter((o) => o.status === "open" || o.status === "upcoming")
    // Estimated deadlines (lib/estimates.ts) never raise alerts.
    .filter((o) => !o.estimated?.includes("deadline"))
    .filter((o) => {
      const d = daysUntil(o.deadline);
      return d != null && d >= 0 && d <= DEADLINE_WINDOW;
    })
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .map((o) => ({
      id: `deadline:${o.id}`,
      badge: "Deadline",
      tone: "warn" as const,
      where: o.countryName,
      title: o.title,
      meta: `${daysUntil(o.deadline)} days left · ${fmtDate(o.deadline)}`,
      href: `/app/opportunities/${o.id}`,
    }));
  const cancelled = projects
    .filter((p) => p.status === "cancelled")
    .map((p) => ({ id: `cancelled:${p.id}`, badge: "Cancelled", tone: "bad" as const, where: p.countryName, title: p.name, meta: p.statusNote, href: `/app/projects/${p.id}` }));
  const delayed = projects
    .filter((p) => p.status === "delayed")
    .map((p) => ({ id: `delayed:${p.id}`, badge: "Delayed / paused", tone: "warn" as const, where: p.countryName, title: p.name, meta: p.statusNote, href: `/app/projects/${p.id}` }));
  return [...deadlines, ...cancelled, ...delayed];
}
