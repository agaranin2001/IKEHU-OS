"use client";

import { Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { MAP_VIEWS, type MapView } from "@/components/map/WorldMap";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FilterBar } from "@/components/ui/FilterBar";
import { SelectField } from "@/components/ui/Fields";
import { ExpandablePanel } from "@/components/ui/ExpandablePanel";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, LoadingRows, ResourceView } from "@/components/ui/States";
import type { HydrogenProject, ProjectStatus, RegionCode } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { fmtNum } from "@/lib/format";
import { services } from "@/services";
import type { ProjectQuery } from "@/services/contracts";
import { EMPTY_FILTERS, filterTags, toQuery, type ProjectFilterState } from "./filterState";
import { useDebounced } from "./hooks";
import { DEFAULT_SORT, SORT_PRESETS, STATUS_ORDER, maxCapacity, regionToView, serviceSort, sortPresetValue, sortProjects, type SortState } from "./model";
import { CountryDrawer } from "@/features/country/CountryDrawer";
import { ProjectDetailDrawer } from "./ProjectDetailDrawer";
import { ProjectFilters, type ProjectFacets } from "./ProjectFilters";
import { MapLegend, ProjectMapCanvas } from "./ProjectMap";
import { ProjectTable } from "./ProjectTable";

const HEADER_TITLE = "Hydrogen Project Intelligence";

function buildFacets(all: HydrogenProject[]): ProjectFacets {
  const countries = new Map<string, { code: string; name: string; region: RegionCode; count: number }>();
  const regionCounts: Partial<Record<RegionCode, number>> = {};
  for (const p of all) {
    const c = countries.get(p.country) ?? {
      code: p.country,
      name: p.countryName,
      region: p.region,
      count: 0,
    };
    c.count++;
    countries.set(p.country, c);
    regionCounts[p.region] = (regionCounts[p.region] ?? 0) + 1;
  }
  return {
    countries: [...countries.values()].sort((a, b) => a.name.localeCompare(b.name)),
    developers: [...new Set(all.map((p) => p.developer))].sort((a, b) => a.localeCompare(b)),
    years: [...new Set(all.map((p) => p.announcedYear))].sort((a, b) => a - b),
    regionCounts,
  };
}

/** Selected project lives in the URL (?project=<id>) so the drawer is deep-linkable and Back closes it. */
function useSelectedProject() {
  const params = useSearchParams();
  const selectedId = params.get("project");
  const open = useCallback(
    (id: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set("project", id);
      if (selectedId) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    },
    [selectedId],
  );
  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    window.history.replaceState(null, "", url);
  }, []);
  return { selectedId, open, close };
}

function ProjectIntelligenceScreen() {
  const { selectedId, open, close } = useSelectedProject();
  const [filters, setFilters] = useState<ProjectFilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [mapView, setMapView] = useState<MapView>("world");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  // Text inputs are debounced; chips and selects apply immediately.
  const search = useDebounced(filters.search, 250);
  const minMw = useDebounced(filters.minMw, 350);
  const maxMw = useDebounced(filters.maxMw, 350);
  const pendingInput = search !== filters.search || minMw !== filters.minMw || maxMw !== filters.maxMw;

  const query: ProjectQuery = useMemo(() => {
    const q = toQuery({ ...filters, search, minMw, maxMw });
    const s = serviceSort(sort);
    return s ? { ...q, sort: s } : q;
  }, [filters, search, minMw, maxMw, sort]);
  const facetQuery: ProjectQuery = useMemo(() => {
    // Same filters without status → counts on the status chips.
    const rest: ProjectQuery = { ...query };
    delete rest.statuses;
    delete rest.sort;
    return rest;
  }, [query]);

  const all = useResource("projects:all", () => services.projects.list());
  const res = useResource(`projects:list:${JSON.stringify(query)}`, () => services.projects.list(query));
  const facetRes = useResource(`projects:facets:${JSON.stringify(facetQuery)}`, () => services.projects.list(facetQuery));
  const detail = useResource(`projects:get:${selectedId ?? ""}`, () => (selectedId ? services.projects.get(selectedId) : Promise.resolve(null)));

  const facets = useMemo(() => (all.data ? buildFacets(all.data) : null), [all.data]);
  const statusCounts = useMemo(() => {
    if (!facetRes.data) return undefined;
    const c = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ProjectStatus, number>;
    for (const p of facetRes.data) c[p.status]++;
    return c;
  }, [facetRes.data]);
  const rows = useMemo(() => (res.data ? sortProjects(res.data, sort) : []), [res.data, sort]);
  const maxMwAll = useMemo(() => maxCapacity(all.data ?? res.data ?? []), [all.data, res.data]);
  const countryName = useCallback((code: string) => facets?.countries.find((c) => c.code === code)?.name ?? code, [facets]);
  const tags = filterTags(filters, countryName);
  const updating = (res.isFetching && res.data !== undefined) || pendingInput;

  // Detail record: prefer the already-loaded list, fall back to a direct fetch (deep links).
  const listed = selectedId ? (all.data?.find((p) => p.id === selectedId) ?? res.data?.find((p) => p.id === selectedId)) : undefined;
  const fetched = detail.data && detail.data.id === selectedId ? detail.data : undefined;
  const selected = listed ?? fetched;
  const detailStatus = selected ? "ready" : detail.error ? "error" : !detail.isFetching && detail.data === null ? "missing" : "loading";

  const applyFilters = (next: ProjectFilterState) => {
    // Selecting exactly one region focuses the map on it.
    if (next.regions !== filters.regions && next.regions.length === 1) setMapView(regionToView(next.regions[0]));
    setFilters(next);
  };
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const highlightId = hoverId ?? selectedId;

  const sortValue = sortPresetValue(sort);

  const empty = (
    <EmptyState
      title="No projects match these filters"
      body="Try removing a filter or widening the capacity or year range. Projects with undisclosed capacity are hidden while a capacity range is set."
      action={
        tags.length ? (
          <Button variant="secondary" size="sm" onClick={clearAll}>
            Clear all filters
          </Button>
        ) : undefined
      }
    />
  );

  const tablePanel = (projects: HydrogenProject[]) => (
    <div className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
      <ProjectTable projects={projects} sort={sort} onSort={setSort} onOpen={open} onHover={setHoverId} selectedId={selectedId} />
      <div className="border-t border-line-2 px-5 py-3">
        <DatasetNote>
          {fmtNum(projects.length)} record{projects.length === 1 ? "" : "s"} shown. Capacity is electrolyser input (MWe).
        </DatasetNote>
      </div>
    </div>
  );

  const mapPanel = (projects: HydrogenProject[]) => {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, projects.filter((p) => p.status === s).length])) as Record<ProjectStatus, number>;
    return (
      <ExpandablePanel title="Project map">
        {(expanded) => (
          <>
            <ProjectMapCanvas
              projects={projects}
              view={mapView}
              maxValue={maxMwAll}
              selectedId={highlightId}
              onSelect={open}
              // Expanded: the map fills the panel edge to edge (bleeds past the body padding).
              className={expanded ? "-mx-5 -mt-5 min-h-0 flex-1" : "mx-auto w-full"}
              fill={expanded}
              onCountrySelect={setCountry}
              selectedCountry={country}
            />
            <MapLegend counts={counts} className="mt-4" />
          </>
        )}
      </ExpandablePanel>
    );
  };

  return (
    <>
      <PageHeader
        title={HEADER_TITLE}
        actions={
          <ButtonLink href="/app/sources" variant="secondary" size="md">
            Sources & methodology
          </ButtonLink>
        }
      />
      <PageBody className="space-y-6">
        <FilterBar
          search={filters.search}
          onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
          placeholder="Search name, developer, location or partner"
          searchLabel="Search projects"
          activeCount={tags.length}
          onClear={clearAll}
          showLabel={res.data ? `Show ${fmtNum(res.data.length)} project${res.data.length === 1 ? "" : "s"}` : "Show projects"}
        >
          <ProjectFilters value={filters} onChange={applyFilters} facets={facets} statusCounts={statusCounts} layout="stack">
            <SelectField
              label="Sort by"
              value={sortValue}
              onChange={(e) => {
                const preset = SORT_PRESETS.find((p) => p.value === e.target.value);
                if (preset) setSort(preset.sort);
              }}
              options={[...(sortValue === "custom" ? [{ value: "custom", label: "Custom (column sort)" }] : []), ...SORT_PRESETS.map((p) => ({ value: p.value, label: p.label }))]}
            />
            <SelectField
              label="Map area"
              value={mapView}
              onChange={(e) => setMapView(e.target.value as MapView)}
              options={MAP_VIEWS.map((v) => ({ value: v.value, label: v.label }))}
            />
          </ProjectFilters>
        </FilterBar>

        {/* Active filters */}
        {(updating || tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
            {updating && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted" role="status">
                <Loader2 className="size-3.5 animate-spin" aria-hidden /> Updating…
              </span>
            )}
            {tags.length > 0 && (
              <>
                <ul className="flex flex-wrap gap-1.5" aria-label="Active filters">
                  {tags.map((t) => (
                    <li key={t.key}>
                      <button
                        type="button"
                        onClick={() => setFilters((f) => t.remove(f))}
                        className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-paper pr-2 pl-2.5 text-xs text-ink-2 hover:border-sage hover:text-ink"
                        aria-label={`Remove filter ${t.label}`}
                      >
                        {t.label}
                        <X className="size-3 text-faint" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={clearAll} className="text-xs font-medium text-forest hover:underline">
                  Clear all ({tags.length})
                </button>
              </>
            )}
          </div>
        )}

        <ResourceView
          resource={res}
          isEmpty={(d) => d.length === 0}
          empty={empty}
          loading={
            <div className="rounded-card border border-line-2 bg-paper p-5 shadow-card">
              <LoadingRows rows={8} />
            </div>
          }
        >
          {() => (
            <div className="space-y-6">
              {mapPanel(rows)}
              {tablePanel(rows)}
            </div>
          )}
        </ResourceView>
      </PageBody>


      <CountryDrawer country={country} onClose={() => setCountry(null)} />
      <ProjectDetailDrawer projectId={selectedId} project={selected ?? null} status={detailStatus} error={detail.error} onRetry={detail.refetch} onClose={close} />
    </>
  );
}

function ScreenFallback() {
  return (
    <>
      <PageHeader title={HEADER_TITLE} />
      <PageBody className="space-y-6">
        <div className="rounded-card border border-line-2 bg-paper p-5 shadow-card">
          <LoadingRows rows={8} />
        </div>
      </PageBody>
    </>
  );
}

/** `/app/projects` screen. Reads `?project=<id>` to open the detail drawer. */
export function ProjectIntelligence() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <ProjectIntelligenceScreen />
    </Suspense>
  );
}
