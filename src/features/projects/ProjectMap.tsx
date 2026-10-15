"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { MAP_VIEWS, WorldMap, type MapView } from "@/components/map/WorldMap";
import { Segmented } from "@/components/ui/Fields";
import { cn } from "@/components/ui/cn";
import type { HydrogenProject, ProjectStatus } from "@/domain/types";
import { fmtMw } from "@/lib/format";
import { PROJECT_STATUS } from "@/lib/labels";
import { toMapPoints } from "./model";
import { StatusDot, StatusLegend } from "./StatusLegend";

export function MapViewSwitcher({ value, onChange, className }: { value: MapView; onChange: (v: MapView) => void; className?: string }) {
  return (
    <div className={cn("scrollbar-thin -mx-1 max-w-full overflow-x-auto px-1 pb-0.5", className)}>
      <Segmented size="sm" label="Map region" value={value} onChange={onChange} options={MAP_VIEWS.map((v) => ({ value: v.value, label: v.label }))} />
    </div>
  );
}

export function ProjectTooltip({ project }: { project: HydrogenProject }) {
  return (
    <div className="w-60 rounded-btn border border-line-2 bg-paper px-3 py-2.5 text-xs shadow-float">
      <div className="font-semibold leading-snug text-ink">{project.name}</div>
      <div className="mt-0.5 text-muted">
        {project.location.label}, {project.countryName}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-ink-2">
          <StatusDot status={project.status} className="size-2" />
          {PROJECT_STATUS[project.status].label}
        </span>
        <span className={cn("num font-medium", project.capacityMw == null ? "text-faint" : "text-ink")}>
          <Estimate on={isEstimated(project, "capacityMw")}>{fmtMw(project.capacityMw)}</Estimate>
        </span>
      </div>
      <div className="mt-1 truncate text-faint">{project.developer}</div>
    </div>
  );
}

/** Status legend shown under every project map. */
export function MapLegend({ counts, className }: { counts?: Partial<Record<ProjectStatus, number>>; className?: string }) {
  return <StatusLegend variant="inline" counts={counts} className={className} />;
}

/** World map of projects coloured by status and sized by MW, with hover preview. */
export function ProjectMapCanvas({
  projects,
  view,
  maxValue,
  selectedId,
  onSelect,
  className,
  mapClassName,
  overlay,
  style,
  onCountrySelect,
  selectedCountry,
  fill,
}: {
  projects: HydrogenProject[];
  view: MapView;
  maxValue: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  mapClassName?: string;
  overlay?: ReactNode;
  style?: CSSProperties;
  onCountrySelect?: (name: string) => void;
  selectedCountry?: string | null;
  /** Fill the container's height (full-screen map). */
  fill?: boolean;
}) {
  const points = useMemo(() => toMapPoints(projects), [projects]);
  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  return (
    <div className={cn("relative", fill && "h-full", className)} style={style}>
      <WorldMap
        points={points}
        view={view}
        maxValue={maxValue}
        selectedId={selectedId}
        onSelect={onSelect}
        className={mapClassName}
        fill={fill}
        onCountrySelect={onCountrySelect}
        selectedCountry={selectedCountry}
        renderTooltip={(pt) => {
          const p = byId.get(pt.id);
          return p ? <ProjectTooltip project={p} /> : null;
        }}
      />
      {overlay}
    </div>
  );
}
