import { DatasetNote } from "@/components/ui/Sources";
import { Skeleton } from "@/components/ui/States";
import { cn } from "@/components/ui/cn";
import type { DatasetInfo, HydrogenProject, ProjectStatus } from "@/domain/types";
import { projectStats } from "@/lib/aggregate";
import { fmtNum } from "@/lib/format";
import { datasetNote, splitMw } from "./model";

export interface KpiTile {
  key: string;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  note: string;
}

const disclosed = (ps: HydrogenProject[], status?: ProjectStatus) =>
  ps.filter((p) => (!status || p.status === status) && p.capacityMw != null && !p.estimated?.includes("capacityMw")).length;

function mwTile(key: string, label: string, mw: number, nProjects: number, nDisclosed: number, note: string): KpiTile {
  // A sum over records that all lack capacity is unknown, not zero.
  if (nProjects > 0 && nDisclosed === 0) return { key, label, value: "Undisclosed", sub: `${fmtNum(nProjects)} project${nProjects === 1 ? "" : "s"}, none disclose capacity`, note };
  const { value, unit } = splitMw(mw);
  const sub = nProjects === 0 ? "No projects in selection" : `${fmtNum(nProjects)} project${nProjects === 1 ? "" : "s"} · ${fmtNum(nDisclosed)} disclose capacity`;
  return { key, label, value, unit, sub, note };
}

/** KPI tiles computed from the records passed in (never hard-coded). */
export function computeKpis(projects: HydrogenProject[], info: DatasetInfo | undefined, scope = "this selection"): KpiTile[] {
  const s = projectStats(projects);
  const live = projects.filter((p) => p.status !== "cancelled");
  return [
    {
      key: "count",
      label: "Tracked projects",
      value: fmtNum(s.count),
      sub: `${fmtNum(s.countries)} ${s.countries === 1 ? "country" : "countries"}`,
      note: datasetNote(info, `Records in ${scope}`),
    },
    mwTile("pipeline", "Pipeline electrolyser capacity", s.totalMw, live.length, disclosed(live), datasetNote(info, `Sum of disclosed electrolyser capacity in ${scope}, excl. cancelled`)),
    mwTile("operational", "Operational", s.mwByStatus.operational, s.countByStatus.operational, disclosed(projects, "operational"), datasetNote(info, `Disclosed capacity of operational projects in ${scope}`)),
    mwTile(
      "construction",
      "Under construction",
      s.mwByStatus["under-construction"],
      s.countByStatus["under-construction"],
      disclosed(projects, "under-construction"),
      datasetNote(info, `Disclosed capacity of projects under construction in ${scope}`),
    ),
    {
      key: "fid",
      label: "FID taken",
      value: fmtNum(s.fidCount),
      sub: s.count ? `of ${fmtNum(s.count)} projects` : "No projects in selection",
      note: datasetNote(info, `Projects with a documented final investment decision in ${scope}`),
    },
  ];
}

export function KpiStrip({ tiles, loading, updating, className, columns = 5 }: { tiles: KpiTile[] | null; loading?: boolean; updating?: boolean; className?: string; columns?: 4 | 5 }) {
  return (
    <section
      aria-label="Key metrics"
      aria-busy={loading || updating}
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-card border border-line-2 bg-paper shadow-card",
        columns === 5 ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4",
        className,
      )}
    >
      {loading || !tiles
        ? Array.from({ length: columns }, (_, i) => (
            <div key={i} className="space-y-2 p-4 shadow-[1px_0_0_0_var(--color-line-2),0_1px_0_0_var(--color-line-2)] md:p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        : tiles.map((t, i) => (
            <div
              key={t.key}
              className={cn(
                // Right + bottom hairlines; the outer edges are clipped by the card, so any column wrap looks right.
                "flex min-w-0 flex-col p-4 shadow-[1px_0_0_0_var(--color-line-2),0_1px_0_0_var(--color-line-2)] transition-opacity duration-200 md:p-5",
                columns === 5 && i === tiles.length - 1 && tiles.length % 2 === 1 && "col-span-2 md:col-span-1",
                updating && "opacity-60",
              )}
            >
              <div className="text-xs font-medium text-muted">{t.label}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={cn("num leading-tight font-light tracking-tight", t.value === "Undisclosed" ? "text-lg text-faint" : "text-[26px] text-ink")}>{t.value}</span>
                {t.unit && <span className="text-sm text-muted">{t.unit}</span>}
              </div>
              {t.sub && <div className="mt-0.5 text-xs text-ink-2">{t.sub}</div>}
              <DatasetNote className="mt-auto pt-2">{t.note}</DatasetNote>
            </div>
          ))}
    </section>
  );
}
