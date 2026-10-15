"use client";

import { Loader2 } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterBar, FilterSection } from "@/components/ui/FilterBar";
import { Chip, SearchInput, SelectField } from "@/components/ui/Fields";
import { EmptyState, ResourceView, Skeleton } from "@/components/ui/States";
import type { Opportunity, OpportunityStatus, OpportunityType } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { OPPORTUNITY_STATUS, OPPORTUNITY_TYPE } from "@/lib/labels";
import { services } from "@/services";
import type { OpportunityQuery } from "@/services/contracts";
import { OpportunityCard } from "./OpportunityCard";
import {
  BUDGET_OPTIONS,
  type BudgetFloor,
  DEADLINE_OPTIONS,
  type DeadlineWindow,
  EMPTY_RADAR_FILTERS,
  type RadarFilters,
  STATUS_ORDER,
  radarActiveCount,
  refineOpportunities,
  statusCounts,
} from "./model";

const TYPE_ORDER = Object.keys(OPPORTUNITY_TYPE) as OpportunityType[];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function FilterPanel({
  filters,
  setFilters,
  all,
}: {
  filters: RadarFilters;
  setFilters: (f: RadarFilters) => void;
  all: Opportunity[];
}) {
  const typeCounts = useMemo(() => {
    const m: Partial<Record<OpportunityType, number>> = {};
    for (const o of all) m[o.type] = (m[o.type] ?? 0) + 1;
    return m;
  }, [all]);
  const sCounts = useMemo(() => statusCounts(all), [all]);
  const countries = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of all) m.set(o.country, o.countryName);
    return [...m].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);
  const technologies = useMemo(() => [...new Set(all.flatMap((o) => o.technologies))].sort((a, b) => a.localeCompare(b)), [all]);
  const types = TYPE_ORDER.filter((t) => typeCounts[t]);

  return (
    <div className="space-y-5">
      <FilterSection label="Status (as of snapshot)">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((s) => (
            <Chip key={s} active={filters.statuses.includes(s)} onClick={() => setFilters({ ...filters, statuses: toggle<OpportunityStatus>(filters.statuses, s) })} count={sCounts[s]}>
              {OPPORTUNITY_STATUS[s].label}
            </Chip>
          ))}
        </div>
      </FilterSection>
      <FilterSection label="Type">
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <Chip key={t} active={filters.types.includes(t)} onClick={() => setFilters({ ...filters, types: toggle(filters.types, t) })} count={typeCounts[t]}>
              {OPPORTUNITY_TYPE[t]}
            </Chip>
          ))}
        </div>
      </FilterSection>
      <SelectField
        label="Country / region"
        value={filters.country}
        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        options={[{ value: "", label: "All countries and regions" }, ...countries]}
      />
      <SelectField
        label="Technology"
        value={filters.technology}
        onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
        options={[{ value: "", label: "All technologies" }, ...technologies.map((t) => ({ value: t, label: t }))]}
      />
      <SelectField
        label="Deadline"
        value={filters.deadline}
        onChange={(e) => setFilters({ ...filters, deadline: e.target.value as DeadlineWindow })}
        options={DEADLINE_OPTIONS}
      />
      <div>
        <SelectField
          label="Total budget"
          value={filters.budget}
          onChange={(e) => setFilters({ ...filters, budget: e.target.value as BudgetFloor })}
          options={BUDGET_OPTIONS}
        />
        <p className="mt-1 text-[11px] leading-snug text-faint">Only calls with a stated EUR budget are matched.</p>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-medium text-ink-2">Eligibility keyword</div>
        <SearchInput
          label="Search eligibility conditions"
          value={filters.eligibility}
          onChange={(v) => setFilters({ ...filters, eligibility: v })}
          placeholder="e.g. SME, consortium, Member State"
        />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-44 rounded-card" />
      ))}
    </div>
  );
}

export function OpportunityRadar() {
  const [filters, setFilters] = useState<RadarFilters>(EMPTY_RADAR_FILTERS);
  const search = useDeferredValue(filters.search);

  const query: OpportunityQuery = useMemo(
    () => ({
      search: search.trim() || undefined,
      types: filters.types.length ? filters.types : undefined,
      countries: filters.country ? [filters.country] : undefined,
      technology: filters.technology || undefined,
    }),
    [search, filters.types, filters.country, filters.technology],
  );

  const all = useResource("opportunities:all", () => services.opportunities.list());
  const listed = useResource(`opportunities:${JSON.stringify(query)}`, () => services.opportunities.list(query));
  const refined = useMemo(() => (listed.data ? refineOpportunities(listed.data, filters) : undefined), [listed.data, filters]);
  const resource = { ...listed, data: refined };

  const active = radarActiveCount(filters);
  const dirty = active > 0 || filters.search.trim() !== "";
  const reset = () => setFilters(EMPTY_RADAR_FILTERS);

  const panel = all.data ? (
    <FilterPanel filters={filters} setFilters={setFilters} all={all.data} />
  ) : all.status === "error" ? (
    <p className="text-sm text-muted">Filters are unavailable because the dataset could not be loaded.</p>
  ) : (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  );

  return (
    <div>
      <FilterBar
        search={filters.search}
        onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
        placeholder="Search title, organisation, programme…"
        searchLabel="Search opportunities"
        activeCount={active}
        onClear={reset}
        clearDisabled={!dirty}
        showLabel={`Show ${refined?.length ?? "…"} result${refined?.length === 1 ? "" : "s"}`}
      >
        {panel}
      </FilterBar>

      <div className="mt-4 mb-3 flex flex-wrap items-center gap-2 text-sm text-muted" aria-live="polite">
        {refined == null ? (
          "Loading…"
        ) : (
          <>
            <span className="num font-medium text-ink">{refined.length}</span> opportunit{refined.length === 1 ? "y" : "ies"}
            {dirty && (
              <button type="button" onClick={reset} className="text-forest underline-offset-2 hover:underline">
                Clear filters
              </button>
            )}
          </>
        )}
        {listed.isFetching && listed.data && (
          <span className="inline-flex items-center gap-1 text-xs text-faint">
            <Loader2 className="size-3 animate-spin" aria-hidden /> Updating…
          </span>
        )}
      </div>

      <ResourceView
        resource={resource}
        loading={<ListSkeleton />}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="No opportunities match"
            body="Widen the deadline window, remove the budget floor or clear a filter. Budget filters only match calls with a stated EUR budget."
            action={
              dirty ? (
                <Button variant="secondary" size="sm" onClick={reset}>
                  Clear all filters
                </Button>
              ) : undefined
            }
          />
        }
      >
        {(items) => (
          <ul className="space-y-3">
            {items.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </ul>
        )}
      </ResourceView>
    </div>
  );
}
