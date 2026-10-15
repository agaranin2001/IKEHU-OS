"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight, Building2, Handshake } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip, SelectField } from "@/components/ui/Fields";
import { FilterBar, FilterSection } from "@/components/ui/FilterBar";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, ResourceView, Skeleton } from "@/components/ui/States";
import type { CompanyCategory } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { COMPANY_CATEGORY } from "@/lib/labels";
import { services } from "@/services";
import { manifestNote } from "@/features/sources/manifest";
import { countBy, profileHref } from "./model";
import { orMissing, TagList } from "./parts";

const CATEGORIES = Object.keys(COMPANY_CATEGORY) as CompanyCategory[];

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-card border border-line-2 bg-paper p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-3.5 w-1/3" />
          <Skeleton className="mt-5 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-5/6" />
          <Skeleton className="mt-5 h-6 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CompanyList() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<CompanyCategory[]>([]);
  const [country, setCountry] = useState("");

  const all = useResource("companies:all", () => services.companies.list());
  const query = useMemo(() => ({ search: search.trim() || undefined, categories: categories.length ? categories : undefined }), [search, categories]);
  const res = useResource(`companies:${JSON.stringify(query)}`, () => services.companies.list(query));

  const catCounts = useMemo(() => countBy(all.data ?? [], (c) => c.categories), [all.data]);
  const countries = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of all.data ?? []) m.set(c.country, c.countryName);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [all.data]);

  const toggle = (c: CompanyCategory) => setCategories((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  const activeCount = categories.length + (country ? 1 : 0);
  const clear = () => {
    setSearch("");
    setCategories([]);
    setCountry("");
  };

  return (
    <div className="space-y-5">
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search companies, technologies, countries…"
        searchLabel="Search companies"
        activeCount={activeCount}
        onClear={clear}
        clearDisabled={!activeCount && !search}
        showLabel="Show companies"
      >
        <div className="space-y-5">
          <SelectField
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={[{ value: "", label: "All countries" }, ...countries.map(([code, name]) => ({ value: code, label: name }))]}
          />
          <FilterSection label="Category">
            <div role="group" aria-label="Company category" className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)} count={catCounts[c] ?? 0}>
                  {COMPANY_CATEGORY[c]}
                </Chip>
              ))}
            </div>
          </FilterSection>
        </div>
      </FilterBar>

      <ResourceView
        resource={res}
        loading={<CardGridSkeleton />}
        isEmpty={(d) => d.filter((c) => !country || c.country === country).length === 0}
        empty={
          <EmptyState
            title="No companies match"
            body="Try a broader search or remove a category or country filter."
            action={
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        }
      >
        {(data) => {
          const rows = data.filter((c) => !country || c.country === country).sort((a, b) => a.name.localeCompare(b.name));
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="num">
                  {rows.length} {rows.length === 1 ? "company" : "companies"}
                </span>
                {res.isFetching && <span aria-live="polite">Updating…</span>}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={profileHref(c.id)}
                      className="group flex h-full flex-col rounded-card border border-line-2 bg-paper p-5 shadow-card transition-[border-color,box-shadow] hover:border-sage hover:shadow-float"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[17px] leading-snug font-normal text-ink group-hover:text-forest">{c.name}</h3>
                          <p className="mt-0.5 text-xs text-muted">
                            {c.headquarters}
                            {c.countryName && c.headquarters !== c.countryName ? `, ${c.countryName}` : ""}
                          </p>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-faint group-hover:text-forest" aria-hidden />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.categories.map((k) => (
                          <Badge key={k} tone="violet">
                            {COMPANY_CATEGORY[k]}
                          </Badge>
                        ))}
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="min-w-0">
                          <dt className="text-muted">Ownership</dt>
                          <dd className="mt-0.5 line-clamp-2 text-ink-2">{orMissing(c.ownership)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Founded</dt>
                          <dd className="num mt-0.5 text-ink-2">
                            <Estimate on={isEstimated(c, "founded")}>{orMissing(c.founded)}</Estimate>
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4">
                        <div className="mb-1.5 text-xs text-muted">Technology focus</div>
                        <TagList tags={c.technologyFocus} max={4} />
                      </div>
                      <div className="mt-auto pt-5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-2 pt-3 text-xs text-ink-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Handshake className="size-3.5 text-muted" aria-hidden />
                          <span className="num">{c.deals.length}</span> documented {c.deals.length === 1 ? "deal" : "deals"}
                        </span>
                        {c.supplierId && (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-muted" aria-hidden /> In supplier catalogue
                          </span>
                        )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <DatasetNote>{manifestNote("companies")} Deal counts include only deals with a public source.</DatasetNote>
            </div>
          );
        }}
      </ResourceView>
    </div>
  );
}
