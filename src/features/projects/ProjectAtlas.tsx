"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MapView } from "@/components/map/WorldMap";
import { buttonClass } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ProjectStatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { HydrogenProject, ProjectStatus } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { fmtMw } from "@/lib/format";
import { services } from "@/services";
import { computeKpis, KpiStrip } from "./ProjectKpis";
import { MapLegend, MapViewSwitcher, ProjectMapCanvas } from "./ProjectMap";
import { STATUS_ORDER, commissioningLabel, maxCapacity, projectHref } from "./model";

/** WorldMap viewBox is 960 × 520. */
const MAP_ASPECT = 960 / 520;

export function ProjectPreviewCard({ project: p, onClose }: { project: HydrogenProject; onClose: () => void }) {
  const facts: { label: string; value: string; unknown?: boolean; estimate?: boolean }[] = [
    { label: "Developer", value: p.developer },
    { label: "Technology", value: p.technology, unknown: p.technology === "Undisclosed", estimate: isEstimated(p, "technology") },
    { label: "Electrolyser capacity", value: fmtMw(p.capacityMw), unknown: p.capacityMw == null, estimate: isEstimated(p, "capacityMw") },
    { label: "Expected online", value: commissioningLabel(p.expectedCommissioning), unknown: p.expectedCommissioning == null, estimate: isEstimated(p, "expectedCommissioning") },
  ];
  return (
    <div
      role="dialog"
      aria-label={`${p.name} preview`}
      className="relative z-20 mt-3 rounded-card border border-line-2 bg-paper p-5 shadow-float animate-[pop_.18s_ease-out] sm:absolute sm:bottom-4 sm:left-4 sm:mt-0 sm:w-[400px] md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[19px] leading-snug font-semibold text-ink">{p.name}</div>
          <div className="mt-1 text-[14px] text-muted">
            {p.location.label}, {p.countryName}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close preview" className="-mt-1 -mr-1 rounded-btn p-1 text-muted hover:bg-stone hover:text-ink">
          <X className="size-5" />
        </button>
      </div>
      <div className="mt-3 [&>span]:px-3 [&>span]:py-1 [&>span]:text-[13px]">
        <ProjectStatusPill status={p.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="text-[13px] text-muted">{f.label}</dt>
            <dd className={cn("num mt-0.5 truncate text-[16px]", f.unknown ? "text-faint" : "text-ink")}>
              <Estimate on={f.estimate}>{f.value}</Estimate>
            </dd>
          </div>
        ))}
      </dl>
      <Link href={projectHref(p.id)} className={buttonClass({ size: "sm", className: "mt-5 w-full" })}>
        View full record <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

/**
 * Self-contained, embeddable project atlas (used on the public /atlas page):
 * world map of every project with region switcher, status legend, KPI tiles
 * computed from the data, hover preview and a click-through preview card.
 */
export function ProjectAtlas({
  height,
  compact = false,
  className,
}: {
  /** Maximum map height in px (the map keeps its aspect ratio). Defaults to full width. */
  height?: number;
  /** Tighter padding, no marker-size note and no record count — for narrow embeds. */
  compact?: boolean;
  className?: string;
}) {
  const info = useResource("projects:info", () => services.projects.info());
  const res = useResource("projects:all", () => services.projects.list());
  const [view, setView] = useState<MapView>("world");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const projects = useMemo(() => res.data ?? [], [res.data]);
  const tiles = useMemo(() => {
    if (!res.data) return null;
    const all = computeKpis(res.data, info.data, "the dataset");
    return all.filter((t) => t.key !== "construction");
  }, [res.data, info.data]);
  const counts = useMemo(
    () => Object.fromEntries(STATUS_ORDER.map((s) => [s, projects.filter((p) => p.status === s).length])) as Record<ProjectStatus, number>,
    [projects],
  );
  const selected = selectedId ? projects.find((p) => p.id === selectedId) : undefined;
  const vmax = useMemo(() => maxCapacity(projects), [projects]);

  if (res.status === "error") return <ErrorState error={res.error} onRetry={res.refetch} />;

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("rounded-card border border-line-2 bg-paper shadow-card", compact ? "p-3" : "p-4 md:p-5")}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <MapViewSwitcher value={view} onChange={setView} />
          {!compact && res.data && <span className="num text-xs text-muted">{projects.length} projects</span>}
        </div>
        {res.status === "loading" ? (
          <div className="mx-auto aspect-[960/520] w-full" style={height != null ? { maxWidth: height * MAP_ASPECT } : undefined}>
            <Skeleton className="size-full rounded-card" />
          </div>
        ) : (
          <ProjectMapCanvas
            projects={projects}
            view={view}
            maxValue={vmax}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
            // `height` caps the map height; width follows the map's aspect ratio so marker tooltips stay aligned.
            className="mx-auto w-full"
            style={height != null ? { maxWidth: height * MAP_ASPECT } : undefined}
            overlay={selected ? <ProjectPreviewCard project={selected} onClose={() => setSelectedId(null)} /> : null}
          />
        )}
        <MapLegend counts={res.data ? counts : undefined} className="mt-3" />
      </div>
      <KpiStrip tiles={tiles} loading={res.status === "loading"} columns={4} />
    </div>
  );
}
