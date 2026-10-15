"use client";

import { ArrowUpRight, Landmark } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Fields";
import { FilterBar, FilterSection } from "@/components/ui/FilterBar";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, ResourceView } from "@/components/ui/States";
import type { InvestorType } from "@/domain/types";
import { manifestNote } from "@/features/sources/manifest";
import { useResource } from "@/hooks/useResource";
import { fmtMoney } from "@/lib/format";
import { INVESTOR_TYPE } from "@/lib/labels";
import { services } from "@/services";
import { CardGridSkeleton } from "./CompanyList";
import { countBy, profileHref } from "./model";
import { TagList } from "./parts";

const TYPES = Object.keys(INVESTOR_TYPE) as InvestorType[];

export function InvestorList() {
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<InvestorType[]>([]);

  const all = useResource("investors:all", () => services.investors.list());
  const query = useMemo(() => ({ search: search.trim() || undefined, types: types.length ? types : undefined }), [search, types]);
  const res = useResource(`investors:${JSON.stringify(query)}`, () => services.investors.list(query));
  const typeCounts = useMemo(() => countBy(all.data ?? [], (i) => i.type), [all.data]);

  const toggle = (t: InvestorType) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const clear = () => {
    setSearch("");
    setTypes([]);
  };

  return (
    <div className="space-y-5">
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search investors, focus areas, geographies…"
        searchLabel="Search investors"
        activeCount={types.length}
        onClear={clear}
        clearDisabled={!types.length && !search}
        showLabel="Show investors"
      >
        <FilterSection label="Investor type">
          <div role="group" aria-label="Investor type" className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <Chip key={t} active={types.includes(t)} onClick={() => toggle(t)} count={typeCounts[t] ?? 0}>
                {INVESTOR_TYPE[t]}
              </Chip>
            ))}
          </div>
        </FilterSection>
      </FilterBar>

      <ResourceView
        resource={res}
        loading={<CardGridSkeleton />}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="No investors match"
            body="Try a broader search or remove an investor-type filter."
            action={
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        }
      >
        {(data) => {
          const rows = [...data].sort((a, b) => b.publicInvestments.length - a.publicInvestments.length || a.name.localeCompare(b.name));
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="num">
                  {rows.length} {rows.length === 1 ? "investor" : "investors"} · sorted by documented hydrogen investments
                </span>
                {res.isFetching && <span aria-live="polite">Updating…</span>}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((i) => (
                  <li key={i.id}>
                    <Link
                      href={profileHref(i.id)}
                      className="group flex h-full flex-col rounded-card border border-line-2 bg-paper p-5 shadow-card transition-[border-color,box-shadow] hover:border-sage hover:shadow-float"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[17px] leading-snug font-normal text-ink group-hover:text-forest">{i.name}</h3>
                          <p className="mt-0.5 text-xs text-muted">{i.headquarters}</p>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-faint group-hover:text-forest" aria-hidden />
                      </div>
                      <div className="mt-3">
                        <Badge tone="violet">{INVESTOR_TYPE[i.type]}</Badge>
                      </div>
                      <dl className="mt-4 space-y-3 text-xs">
                        <div>
                          <dt className="mb-1 text-muted">Geography</dt>
                          <dd>
                            <TagList tags={i.geography} max={4} />
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-1 text-muted">Investment focus</dt>
                          <dd>
                            <TagList tags={i.investmentFocus} max={4} />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted">Stages</dt>
                          <dd className="mt-0.5 text-ink-2">{i.stages.length ? i.stages.join(", ") : <span className="text-faint">Not stated</span>}</dd>
                        </div>
                        {i.fundSize && (
                          <div>
                            <dt className="text-muted">Fund / programme size</dt>
                            <dd className="num mt-0.5 text-ink-2" title={i.fundSize.scope}>
                              {fmtMoney(i.fundSize)}
                              {i.fundSize.scope && <span className="text-faint"> · {i.fundSize.scope}</span>}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-auto pt-5">
                        <div className="flex items-center gap-1.5 border-t border-line-2 pt-3 text-xs text-ink-2">
                          <Landmark className="size-3.5 text-muted" aria-hidden />
                          <span className="num">{i.publicInvestments.length}</span> documented hydrogen {i.publicInvestments.length === 1 ? "investment" : "investments"}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <DatasetNote>{manifestNote("investors")} Fund sizes are shown only where publicly stated.</DatasetNote>
            </div>
          );
        }}
      </ResourceView>
    </div>
  );
}
