"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { MapView } from "@/components/map/WorldMap";
import { ButtonLink } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Fields";
import { ExpandablePanel } from "@/components/ui/ExpandablePanel";
import { cn } from "@/components/ui/cn";
import type { HydrogenProject, ProjectStatus } from "@/domain/types";
import { CountryDrawer } from "@/features/country/CountryDrawer";
import { MapViewSwitcher, ProjectMapCanvas, ProjectPreviewCard, StatusDot } from "@/features/projects";
import { STATUS_ORDER, maxCapacity } from "@/features/projects/model";
import { PROJECT_STATUS } from "@/lib/labels";

/**
 * Full-width project map for the dashboard: status-coloured dots sized by MW,
 * with region, status, technology and FID filters. Counts are computed from
 * the records shown.
 */
export function DashboardMap({ projects, footer }: { projects: HydrogenProject[]; footer?: string }) {
  const [view, setView] = useState<MapView>("world");
  const [hidden, setHidden] = useState<Set<ProjectStatus>>(() => new Set());
  const [technology, setTechnology] = useState("all");
  const [fidOnly, setFidOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const technologies = useMemo(() => [...new Set(projects.map((p) => p.technology))].sort(), [projects]);

  // Status counts respect the other filters so each chip shows what toggling it would add or remove.
  const base = useMemo(
    () => projects.filter((p) => (technology === "all" || p.technology === technology) && (!fidOnly || p.finalInvestmentDecision === true)),
    [projects, technology, fidOnly],
  );
  const shown = useMemo(() => base.filter((p) => !hidden.has(p.status)), [base, hidden]);
  const counts = useMemo(() => Object.fromEntries(STATUS_ORDER.map((s) => [s, base.filter((p) => p.status === s).length])) as Record<ProjectStatus, number>, [base]);
  const vmax = useMemo(() => maxCapacity(projects), [projects]);
  const selected = selectedId ? shown.find((p) => p.id === selectedId) : undefined;
  const dirty = hidden.size > 0 || technology !== "all" || fidOnly;

  const toggle = (s: ProjectStatus) =>
    setHidden((cur) => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const reset = () => {
    setHidden(new Set());
    setTechnology("all");
    setFidOnly(false);
  };

  return (
    <>
      <ExpandablePanel
        title="Project map"
        actions={
          <ButtonLink href="/app/projects" variant="secondary" size="sm">
            Open database <ArrowUpRight className="size-4" aria-hidden />
          </ButtonLink>
        }
        footer={footer}
      >
        {(expanded) => (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <MapViewSwitcher value={view} onChange={setView} />
              <div className="flex flex-wrap items-center gap-3">
                <SelectField
                  aria-label="Technology"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  options={[{ value: "all", label: "All technologies" }, ...technologies.map((t) => ({ value: t, label: t }))]}
                  className="w-44"
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                  <input type="checkbox" checked={fidOnly} onChange={(e) => setFidOnly(e.target.checked)} className="size-4 rounded border-line accent-forest" />
                  FID taken
                </label>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
              {STATUS_ORDER.map((s) => {
                const on = !hidden.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
                      on ? "border-line bg-paper text-ink hover:bg-paper-2" : "border-line-2 bg-paper-2 text-faint line-through hover:text-muted",
                    )}
                  >
                    <StatusDot status={s} className={cn("size-2", !on && "opacity-30")} />
                    {PROJECT_STATUS[s].label}
                    <span className="num text-faint">{counts[s]}</span>
                  </button>
                );
              })}
              {dirty && (
                <button type="button" onClick={reset} className="ml-1 text-xs font-bold text-forest hover:underline">
                  Reset filters
                </button>
              )}
            </div>

            <ProjectMapCanvas
              projects={shown}
              view={view}
              maxValue={vmax}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
              // Expanded: the map fills the rest of the panel edge to edge (bleeds past the body padding).
              className={expanded ? "-mx-5 -mb-5 mt-4 min-h-0 flex-1" : "mx-auto mt-4 w-full"}
              fill={expanded}
              overlay={selected ? <ProjectPreviewCard project={selected} onClose={() => setSelectedId(null)} /> : null}
              onCountrySelect={setCountry}
              selectedCountry={country}
            />
          </>
        )}
      </ExpandablePanel>
      <CountryDrawer country={country} onClose={() => setCountry(null)} />
    </>
  );
}
