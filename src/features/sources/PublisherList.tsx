"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Fields";
import { DatasetNote } from "@/components/ui/Sources";
import { EmptyState, LoadingRows, ResourceView } from "@/components/ui/States";
import { useResource } from "@/hooks/useResource";
import { fmtNum } from "@/lib/format";
import { services } from "@/services";
import { aggregatePublishers, PUBLISHER_DATASET_LABEL, type PublisherDataset } from "./publishers";

const DATASETS = Object.keys(PUBLISHER_DATASET_LABEL) as PublisherDataset[];
const PAGE = 20;

async function load() {
  const [projects, suppliers, opportunities, companies, investors, insights] = await Promise.all([
    services.projects.list(),
    services.suppliers.list(),
    services.opportunities.list(),
    services.companies.list(),
    services.investors.list(),
    services.insights.list(),
  ]);
  const counts = { projects: projects.length, suppliers: suppliers.length, opportunities: opportunities.length, companies: companies.length, investors: investors.length, insights: insights.length };
  return { rows: aggregatePublishers({ projects, suppliers, opportunities, companies, investors, insights }), counts };
}

export function PublisherList() {
  const res = useResource("sources:publishers", load);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  return (
    <ResourceView resource={res} loading={<LoadingRows rows={8} />} isEmpty={(d) => d.rows.length === 0} empty={<EmptyState title="No sources cited yet" />}>
      {({ rows, counts }) => {
        const q = search.trim().toLowerCase();
        const filtered = rows.filter((r) => !q || r.publisher.toLowerCase().includes(q));
        const shown = showAll || q ? filtered : filtered.slice(0, PAGE);
        const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput value={search} onChange={setSearch} placeholder="Search publishers…" className="sm:max-w-sm sm:flex-1" label="Search publishers" />
              <span className="num text-xs text-muted">
                {fmtNum(rows.length)} unique publishers across {fmtNum(totalRecords)} records
              </span>
            </div>
            {filtered.length === 0 ? (
              <EmptyState title="No publisher matches" body="Try a shorter name." />
            ) : (
              <div className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
                <div className="scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-[13px]">
                    <thead className="bg-paper-2 text-xs text-muted">
                      <tr className="border-b border-line-2">
                        <th scope="col" className="px-4 py-2.5 font-medium">Publisher</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-medium">Records citing</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-medium">Documents</th>
                        <th scope="col" className="px-4 py-2.5 font-medium">Cited in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.publisher} className="border-b border-line-2 last:border-0 hover:bg-paper-2">
                          <td className="px-4 py-2.5 text-ink">{r.publisher}</td>
                          <td className="num px-3 py-2.5 text-right text-ink">{fmtNum(r.records)}</td>
                          <td className="num px-3 py-2.5 text-right text-ink-2">{fmtNum(r.documents)}</td>
                          <td className="px-4 py-2.5">
                            <ul className="flex flex-wrap gap-1.5">
                              {DATASETS.filter((d) => r.byDataset[d]).map((d) => (
                                <li key={d} className="rounded-md border border-line-2 bg-paper-2 px-1.5 py-px text-[11px] text-ink-2">
                                  {PUBLISHER_DATASET_LABEL[d]} <span className="num text-faint">{r.byDataset[d]}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!q && filtered.length > PAGE && (
                  <div className="border-t border-line-2 px-4 py-2.5">
                    <Button variant="link" size="sm" onClick={() => setShowAll((v) => !v)}>
                      {showAll ? "Show top 20 only" : `Show all ${filtered.length} publishers`}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <DatasetNote>
              Record-level counts: a record citing a publisher several times counts once. Product datasheets and deal announcements count towards their parent supplier, company or investor
              record. Records per dataset: {DATASETS.map((d) => `${PUBLISHER_DATASET_LABEL[d]} ${counts[d]}`).join(" · ")}.
            </DatasetNote>
          </div>
        );
      }}
    </ResourceView>
  );
}
