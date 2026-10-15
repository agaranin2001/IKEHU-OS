"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/ui/Fields";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, LoadingRows, ResourceView } from "@/components/ui/States";
import { useResource } from "@/hooks/useResource";
import { fmtDate, hostOf } from "@/lib/format";
import { services } from "@/services";

const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 3 });
const fmtVal = (v: number | undefined) => (v == null || !Number.isFinite(v) ? "—" : nf.format(v));

export function BenchmarksTable() {
  const res = useResource("sources:benchmarks", () => services.benchmarks.list());
  const [search, setSearch] = useState("");

  const filter = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (p: { parameter: string; scope: string; source: { publisher: string } }) =>
      !q || [p.parameter, p.scope, p.source.publisher].some((s) => s.toLowerCase().includes(q));
  }, [search]);

  return (
    <ResourceView resource={res} loading={<LoadingRows rows={6} />} isEmpty={(d) => d.length === 0} empty={<EmptyState title="No benchmarks published yet" />}>
      {(items) => {
        const rows = items.filter(filter);
        const publishers = new Set(items.map((b) => b.source.publisher)).size;
        return (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput value={search} onChange={setSearch} placeholder="Filter by parameter, scope or publisher…" className="sm:max-w-sm sm:flex-1" label="Filter benchmarks" />
              <span className="num text-xs text-muted">
                {rows.length} of {items.length} ranges · {publishers} publishers
              </span>
            </div>
            {rows.length === 0 ? (
              <EmptyState title="No benchmarks match" body="Try another parameter name." />
            ) : (
              <div className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-[13px]">
                    <thead className="bg-paper-2 text-xs text-muted">
                      <tr className="border-b border-line-2">
                        <th scope="col" className="px-4 py-2.5 font-medium">Parameter</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-medium">Low</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-medium">Central</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-medium">High</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Unit</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Scope</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Year</th>
                        <th scope="col" className="px-4 py-2.5 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((b) => (
                        <tr key={b.id} className="border-b border-line-2 align-top last:border-0 hover:bg-paper-2">
                          <td className="px-4 py-3 font-medium text-ink">{b.parameter}</td>
                          <td className="num px-3 py-3 text-right text-ink-2">{fmtVal(b.low)}</td>
                          <td className="num px-3 py-3 text-right text-ink">{fmtVal(b.central)}</td>
                          <td className="num px-3 py-3 text-right text-ink-2">{fmtVal(b.high)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-ink-2">{b.unit}</td>
                          <td className="max-w-[300px] px-3 py-3 leading-relaxed text-ink-2">{b.scope}</td>
                          <td className="num px-3 py-3 text-ink-2">{b.year}</td>
                          <td className="px-4 py-3">
                            <a href={b.source.url} target="_blank" rel="noopener noreferrer" className="group inline-flex max-w-[240px] items-start gap-1 text-ink-2 hover:text-forest" title={b.source.title}>
                              <ArrowUpRight className="mt-0.5 size-3 shrink-0 text-faint group-hover:text-forest" aria-hidden />
                              <span className="min-w-0">
                                <span className="line-clamp-2">{b.source.title}</span>
                                <span className="block truncate text-[11px] text-faint">
                                  {b.source.publisher} · {hostOf(b.source.url)}
                                  {b.source.publishedAt ? ` · ${fmtDate(b.source.publishedAt)}` : ""}
                                </span>
                              </span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <DatasetNote>Values are copied exactly from the cited source — no interpolation and no currency conversion. Where a source gives a single point estimate, low = central = high. “—” means the source gives no central value.</DatasetNote>
          </div>
        );
      }}
    </ResourceView>
  );
}
