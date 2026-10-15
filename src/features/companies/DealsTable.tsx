"use client";

import { ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { BleedTable, type BleedColumn } from "@/components/ui/BleedTable";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Fields";
import { FilterBar, FilterSection } from "@/components/ui/FilterBar";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, LoadingRows, ResourceView } from "@/components/ui/States";
import { manifestEntry } from "@/features/sources/manifest";
import { useResource } from "@/hooks/useResource";
import { fmtDate, hostOf } from "@/lib/format";
import { services } from "@/services";
import { buildNameIndex, countBy, DEAL_KIND, DEAL_KINDS, flattenDeals, lookupName, sortByYear, type DealKind } from "./model";
import { DealAmount, DealKindBadge, EntityLink } from "./parts";

const norm = (s: string) => s.toLowerCase();

export function DealsTable() {
  const [kinds, setKinds] = useState<DealKind[]>([]);
  const [search, setSearch] = useState("");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const res = useResource("deals:all", async () => {
    const [companies, investors] = await Promise.all([services.companies.list(), services.investors.list()]);
    return { deals: flattenDeals(companies, investors), index: buildNameIndex(companies, investors) };
  });

  const kindCounts = useMemo(() => countBy(res.data?.deals ?? [], (d) => d.kind), [res.data]);
  const toggle = (k: DealKind) => setKinds((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  const clear = () => {
    setKinds([]);
    setSearch("");
  };

  const columns: BleedColumn[] = [
    {
      key: "year",
      width: "7%",
      srLabel: "Year",
      ariaSort: dir === "desc" ? "descending" : "ascending",
      label: (
        <button
          type="button"
          onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="inline-flex items-center gap-1 rounded hover:text-ink"
          aria-label={`Sort by year, currently ${dir === "desc" ? "newest first" : "oldest first"}`}
        >
          Year {dir === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
        </button>
      ),
    },
    { key: "kind", width: "9%", label: "Kind", srLabel: "Kind" },
    { key: "recorded", width: "14%", label: "Recorded under", srLabel: "Recorded under" },
    { key: "counterparty", width: "16%", label: "Counterparty", srLabel: "Counterparty" },
    { key: "description", width: "30%", label: "Description", srLabel: "Description" },
    { key: "amount", width: "10%", label: "Amount", srLabel: "Amount", headClassName: "text-right" },
    { key: "source", width: "14%", label: "Source", srLabel: "Source" },
  ];

  return (
    <div className="space-y-5">
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search counterparty, company, investor or description…"
        searchLabel="Search deals"
        activeCount={kinds.length}
        onClear={clear}
        clearDisabled={!kinds.length && !search}
        showLabel="Show deals"
      >
        <FilterSection label="Deal kind">
          <div role="group" aria-label="Deal kind" className="flex flex-wrap gap-1.5">
            {DEAL_KINDS.map((k) => (
              <Chip key={k} active={kinds.includes(k)} onClick={() => toggle(k)} count={kindCounts[k] ?? 0}>
                {DEAL_KIND[k].label}
              </Chip>
            ))}
          </div>
        </FilterSection>
      </FilterBar>

      <ResourceView resource={res} loading={<LoadingRows rows={8} />} isEmpty={(d) => d.deals.length === 0} empty={<EmptyState title="No documented deals yet" body="No company or investor record carries a publicly sourced deal." />}>
        {({ deals, index }) => {
          const q = norm(search.trim());
          const rows = sortByYear(
            deals.filter(
              (d) =>
                (!kinds.length || kinds.includes(d.kind)) &&
                (!q || [d.counterparty, d.description, ...d.recordedUnder.map((r) => r.name)].some((s) => norm(s).includes(q))),
            ),
            dir,
          );
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="num">
                  {rows.length} of {deals.length} documented deals
                </span>
              </div>
              {rows.length === 0 ? (
                <EmptyState
                  title="No deals match"
                  body="Remove a deal-kind filter or broaden the search."
                  action={
                    <Button variant="secondary" size="sm" onClick={clear}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <BleedTable label="Documented deals" minWidth={1120} columns={columns}>
                  {rows.map((d) => {
                    const cp = lookupName(index, d.counterparty);
                    return (
                      <tr key={d.key} className="border-b border-line-2 align-top last:border-0 hover:bg-paper-2">
                        <td className="num px-4 py-3 text-ink">{d.year}</td>
                        <td className="px-4 py-3">
                          <DealKindBadge kind={d.kind} />
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-0.5">
                            {d.recordedUnder.map((r) => (
                              <li key={r.id}>
                                <EntityLink entity={r} />
                                <span className="ml-1 text-[11px] text-faint">{r.kind === "investor" ? "investor" : "company"}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 text-ink-2">{cp && !d.recordedUnder.some((r) => r.id === cp.id) ? <EntityLink entity={cp} /> : d.counterparty}</td>
                        <td className="px-4 py-3 leading-relaxed text-ink-2">{d.description}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <DealAmount amount={d.amount} estimated={d.amountEstimated} />
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={d.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex max-w-full items-start gap-1 text-ink-2 hover:text-forest"
                            title={d.source.title}
                          >
                            <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-faint group-hover:text-forest" aria-hidden />
                            <span className="min-w-0">
                              <span className="block truncate">{d.source.publisher}</span>
                              <span className="block truncate text-[11px] text-faint">
                                {hostOf(d.source.url)}
                                {d.source.publishedAt ? ` · ${fmtDate(d.source.publishedAt)}` : ""}
                              </span>
                            </span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </BleedTable>
              )}
              <DatasetNote>
                Flattened from company deals and investor portfolios (datasets compiled {fmtDate(manifestEntry("companies").compiledAt)}). A deal documented under both a company and an investor is shown
                once. Amounts are shown in the published currency and are not summed across currencies.
              </DatasetNote>
            </div>
          );
        }}
      </ResourceView>
    </div>
  );
}
