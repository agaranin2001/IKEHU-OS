"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TopicTag } from "@/components/ui/TopicTag";
import { Skeleton, ResourceView } from "@/components/ui/States";
import type { DataOrigin } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { fmtDate, fmtNum } from "@/lib/format";
import { services } from "@/services";
import { manifestEntry } from "./manifest";

interface DatasetCard {
  key: string;
  name: string;
  href: string;
  origin: DataOrigin;
  /** Null when the dataset could not be loaded. */
  records: number | null;
  recordLabel: string;
  extra?: string;
  version: string | null;
  compiledAt: string | null;
  scope: string;
  error?: string;
}

const ORIGIN_LABEL: Record<DataOrigin, string> = { sourced: "Sourced data", demo: "Demo data" };
const ORIGIN_COLOR: Record<DataOrigin, string> = { sourced: "var(--color-forest)", demo: "var(--color-warn)" };

const settled = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === "fulfilled" ? r.value : null);
const why = (r: PromiseSettledResult<unknown>) => (r.status === "rejected" ? (r.reason instanceof Error ? r.reason.message : String(r.reason)) : undefined);

async function loadDatasets(): Promise<DatasetCard[]> {
  const [projects, suppliers, opportunities, companies, investors, insights, benchmarks, energy, zones, workspace] = await Promise.allSettled([
    services.projects.info(),
    services.suppliers.info(),
    services.opportunities.info(),
    services.companies.list(),
    services.investors.list(),
    services.insights.list(),
    services.benchmarks.list(),
    services.energy.info(),
    services.energy.zones(),
    services.workspace.snapshot(),
  ]);

  const fromInfo = (key: "projects" | "suppliers" | "opportunities", name: string, href: string, r: PromiseSettledResult<{ version: string; compiledAt: string; scope: string; recordCount: number; origin: DataOrigin }>, recordLabel: string): DatasetCard => {
    const v = settled(r);
    const m = manifestEntry(key);
    return {
      key,
      name,
      href,
      origin: v?.origin ?? "sourced",
      records: v?.recordCount ?? null,
      recordLabel,
      version: v?.version ?? m.version,
      compiledAt: v?.compiledAt ?? m.compiledAt,
      scope: v?.scope ?? m.scope,
      error: why(r),
    };
  };
  const fromManifest = (key: "companies" | "investors" | "insights", name: string, href: string, r: PromiseSettledResult<unknown[]>, recordLabel: string, extra?: string): DatasetCard => {
    const m = manifestEntry(key);
    const v = settled(r);
    return { key, name, href, origin: "sourced", records: v?.length ?? null, recordLabel, extra, version: m.version, compiledAt: m.compiledAt, scope: m.scope, error: why(r) };
  };

  const cs = settled(companies);
  const is = settled(investors);
  const en = settled(energy);
  const ws = settled(workspace);
  const bm = settled(benchmarks);

  return [
    fromInfo("projects", "Hydrogen projects", "/app/projects", projects, "projects"),
    fromInfo("suppliers", "Technology suppliers", "/app/suppliers", suppliers, "suppliers"),
    fromInfo("opportunities", "Funding & tenders", "/app/opportunities", opportunities, "opportunities"),
    fromManifest("companies", "Companies", "/app/companies", companies, "companies", cs ? `${fmtNum(cs.reduce((a, c) => a + c.deals.length, 0))} documented deals` : undefined),
    fromManifest("investors", "Investors", "/app/companies?tab=investors", investors, "investors", is ? `${fmtNum(is.reduce((a, i) => a + i.publicInvestments.length, 0))} documented investments` : undefined),
    fromManifest("insights", "Market insights", "/app", insights, "insights"),
    {
      key: "benchmarks",
      name: "Cost & performance benchmarks",
      href: "#benchmarks",
      origin: "sourced",
      records: bm?.length ?? null,
      recordLabel: "benchmark ranges",
      version: null,
      compiledAt: null,
      scope: "Published low / central / high ranges used to sanity-check LCOH calculator inputs; copied as published, units unchanged",
      error: why(benchmarks),
    },
    {
      key: "energy",
      name: "Electricity prices",
      href: "/app/markets",
      origin: "sourced",
      records: settled(zones)?.length ?? null,
      recordLabel: "bidding zones",
      version: null,
      compiledAt: en?.compiledAt ?? null,
      scope: en?.coverage ?? "Day-ahead electricity prices by bidding zone",
      error: why(energy) ?? why(zones),
    },
    {
      key: "workspace",
      name: "Project workspace (demo)",
      href: "/app/workspace",
      origin: "demo",
      records: ws ? ws.tasks.length + ws.milestones.length + ws.risks.length + ws.documents.length : null,
      recordLabel: "demo items",
      extra: ws ? `${ws.tasks.length} tasks · ${ws.milestones.length} milestones · ${ws.risks.length} risks · ${ws.documents.length} documents` : undefined,
      version: null,
      compiledAt: null,
      scope: "Fictional project used to preview the delivery workspace. Never presented as a real project.",
      error: why(workspace),
    },
  ];
}

export function DatasetCards() {
  const res = useResource("sources:datasets", loadDatasets);
  return (
    <ResourceView
      resource={res}
      loading={
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading datasets">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-card" />
          ))}
        </div>
      }
    >
      {(cards) => (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => {
            // Same-page tab links ("#benchmarks") use a plain anchor so the hash change switches the tab.
            const CardLink = c.href.startsWith("#") ? "a" : Link;
            return (
            <li key={c.key}>
              {/* R&D Library card style: tag + date, large title, action in the notched corner */}
              <CardLink href={c.href} className="group relative block h-full">
                <div className="notched flex h-full min-h-[300px] flex-col rounded-card bg-paper p-8 transition-colors duration-300 group-hover:bg-paper-2">
                  <div className="flex items-center justify-between gap-4">
                    <TopicTag color={ORIGIN_COLOR[c.origin]}>{ORIGIN_LABEL[c.origin]}</TopicTag>
                    {c.compiledAt && (
                      <span className="text-[13px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
                        {fmtDate(c.compiledAt, { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-7 text-[22px] leading-[1.3] text-ink">{c.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    {c.records == null ? (
                      <span className="flex items-center gap-1.5 text-sm text-bad">
                        <AlertTriangle className="size-4" aria-hidden /> Unavailable
                      </span>
                    ) : (
                      <>
                        <span className="num text-[28px] leading-none font-light text-ink">{fmtNum(c.records)}</span>
                        <span className="text-sm text-muted">{c.recordLabel}</span>
                      </>
                    )}
                  </div>
                  {c.error && <p className="mt-1 text-xs text-bad">{c.error}</p>}
                  {c.extra && <p className="mt-1 text-xs text-muted">{c.extra}</p>}
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{c.scope}</p>
                  {c.version && <p className="num mt-2 text-xs text-muted">Version {c.version}</p>}
                  <div className="mt-auto pt-10 text-[13px] font-medium tracking-[0.08em] text-forest uppercase">{c.href.startsWith("#") ? "Open benchmarks" : "Open module"}</div>
                </div>
                <span className="notch-btn" aria-hidden>
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </CardLink>
            </li>
            );
          })}
        </ul>
      )}
    </ResourceView>
  );
}
