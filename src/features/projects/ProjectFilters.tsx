"use client";

import type { ReactNode } from "react";
import { MultiSelectField, SelectField } from "@/components/ui/Fields";
import { cn } from "@/components/ui/cn";
import type { EndUse, ProductionPathway, ProductionTechnology, ProjectStatus, RegionCode } from "@/domain/types";
import { END_USE, PATHWAY, PROJECT_STATUS } from "@/lib/labels";
import { CAPACITY_BUCKETS, activeBucket, type ProjectFilterState } from "./filterState";
import { END_USES, PATHWAYS, REGIONS, STATUS_ORDER, TECHNOLOGIES } from "./model";
import { STATUS_DEFINITIONS } from "./StatusLegend";

export interface ProjectFacets {
  countries: { code: string; name: string; region: RegionCode; count: number }[];
  developers: string[];
  years: number[];
  regionCounts: Partial<Record<RegionCode, number>>;
}

/** Full-width filter selectors for Project Intelligence, laid out as a responsive grid. */
export function ProjectFilters({
  value,
  onChange,
  facets,
  statusCounts,
  className,
  children,
  layout = "grid",
}: {
  value: ProjectFilterState;
  onChange: (next: ProjectFilterState) => void;
  facets: ProjectFacets | null;
  statusCounts?: Partial<Record<ProjectStatus, number>>;
  className?: string;
  /** Extra selectors appended to the grid (e.g. sort and map area). */
  children?: ReactNode;
  /** "grid": responsive columns; "stack": one column, for the filters sidebar. */
  layout?: "grid" | "stack";
}) {
  const set = <K extends keyof ProjectFilterState>(k: K, v: ProjectFilterState[K]) => onChange({ ...value, [k]: v });
  const bucket = activeBucket(value);
  const customCapacity = !bucket && !!(value.minMw || value.maxMw);

  const countries = (facets?.countries ?? []).filter((c) => !value.regions.length || value.regions.includes(c.region) || value.countries.includes(c.code));
  const years = facets?.years ?? [];
  const yearOptions = (any: string) => [{ value: "", label: any }, ...years.map((y) => ({ value: String(y), label: String(y) }))];

  return (
    <div className={cn("grid", layout === "stack" ? "gap-4" : "gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7", className)}>
      <MultiSelectField
        label="Status"
        placeholder="All statuses"
        value={value.statuses}
        onChange={(v) => set("statuses", v as ProjectStatus[])}
        options={STATUS_ORDER.map((s) => ({ value: s, label: PROJECT_STATUS[s].label, color: PROJECT_STATUS[s].color, count: statusCounts?.[s], title: STATUS_DEFINITIONS[s] }))}
      />
      <MultiSelectField
        label="Region"
        placeholder="All regions"
        value={value.regions}
        onChange={(v) => set("regions", v as RegionCode[])}
        options={REGIONS.map((r) => ({ value: r, label: r, count: facets?.regionCounts[r] ?? 0 }))}
      />
      <MultiSelectField
        label="Country"
        placeholder="All countries"
        value={value.countries}
        onChange={(v) => set("countries", v)}
        options={countries.map((c) => ({ value: c.code, label: c.name, count: c.count }))}
        emptyText={facets ? "No countries in the selected regions" : "Loading countries…"}
      />
      <MultiSelectField
        label="Technology"
        placeholder="All technologies"
        value={value.technologies}
        onChange={(v) => set("technologies", v as ProductionTechnology[])}
        options={TECHNOLOGIES.map((t) => ({ value: t, label: t }))}
      />
      <MultiSelectField
        label="Production pathway"
        placeholder="All pathways"
        value={value.pathways}
        onChange={(v) => set("pathways", v as ProductionPathway[])}
        options={PATHWAYS.map((p) => ({ value: p, label: PATHWAY[p] }))}
      />
      <SelectField
        label="Electrolyser capacity"
        value={customCapacity ? "custom" : (bucket ?? "")}
        onChange={(e) => {
          const b = CAPACITY_BUCKETS.find((x) => x.value === e.target.value);
          onChange({ ...value, minMw: b?.min ?? "", maxMw: b?.max ?? "" });
        }}
        options={[
          { value: "", label: "Any capacity" },
          ...(customCapacity ? [{ value: "custom", label: "Custom range" }] : []),
          ...CAPACITY_BUCKETS.map((b) => ({ value: b.value, label: b.label })),
        ]}
      />
      <SelectField
        label="Developer"
        value={value.developer}
        onChange={(e) => set("developer", e.target.value)}
        options={[{ value: "", label: "All developers" }, ...(facets?.developers ?? []).map((d) => ({ value: d, label: d }))]}
      />
      <MultiSelectField
        label="Intended end use"
        placeholder="All end uses"
        value={value.endUses}
        onChange={(v) => set("endUses", v as EndUse[])}
        options={END_USES.map((u) => ({ value: u, label: END_USE[u] }))}
      />
      <SelectField label="Announced from" value={value.announcedFrom} onChange={(e) => set("announcedFrom", e.target.value)} options={yearOptions("Any year")} />
      <SelectField label="Announced to" value={value.announcedTo} onChange={(e) => set("announcedTo", e.target.value)} options={yearOptions("Any year")} />
      <SelectField
        label="Investment decision"
        value={value.fidOnly ? "fid" : ""}
        onChange={(e) => set("fidOnly", e.target.value === "fid")}
        options={[
          { value: "", label: "Any" },
          { value: "fid", label: "FID taken" },
        ]}
      />
      {children}
    </div>
  );
}
