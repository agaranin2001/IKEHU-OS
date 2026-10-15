"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { OpportunityStatusPill, ProjectStatusPill } from "@/components/ui/StatusPill";
import { StackedBar } from "@/components/charts/Bars";
import { LineChart } from "@/components/charts/LineChart";
import type { Company, CompanyCategory, HydrogenProject, MarketInsight, Opportunity, OpportunityStatus, OpportunityType, PriceSeries, ProjectStatus } from "@/domain/types";
import { effectiveStatus } from "@/features/opportunities/model";
import { STATUS_ORDER, projectHref } from "@/features/projects/model";
import { useResource } from "@/hooks/useResource";
import { EEA_MEMBERS, EU_MEMBERS, atlasCountryCode, datasetCountryName, flagSrc } from "@/lib/countries";
import { fmtDate, fmtMw, fmtNum } from "@/lib/format";
import { COMPANY_CATEGORY, OPPORTUNITY_TYPE, PROJECT_STATUS } from "@/lib/labels";
import { services } from "@/services";
import { demoCountry } from "./demoCountry";

async function loadCountryData() {
  const [projects, companies, opportunities, zones, insights] = await Promise.all([
    services.projects.list(),
    services.companies.list(),
    services.opportunities.list(),
    services.energy.zones(),
    services.insights.list(),
  ]);
  const monthly = await services.energy.monthly(zones.map((z) => z.code));
  return { projects, companies, opportunities, zones, insights, monthly };
}

/** ISO code for a dataset country name, read from any record that carries both. */
function codeFor(name: string, data: Awaited<ReturnType<typeof loadCountryData>>): string | undefined {
  return (
    data.projects.find((p) => p.countryName === name)?.country ??
    data.companies.find((c) => c.countryName === name)?.country ??
    data.opportunities.find((o) => o.countryName === name)?.country ??
    data.zones.find((z) => z.countryName === name)?.country
  );
}

/** Latest complete-month average and trailing-12-month average of a monthly series. */
function priceSummary(series: PriceSeries | undefined) {
  const pts = series?.points ?? [];
  if (!pts.length) return null;
  const last = pts.at(-1)!;
  const year = pts.slice(-12);
  return { month: last.t, last: last.v, avg12: year.reduce((s, p) => s + p.v, 0) / year.length };
}

function Section({ title, count, action, children }: { title: string; count?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
          {title}
          {count != null && <span className="num ml-1.5 font-normal text-faint">{count}</span>}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className="rounded-btn bg-paper-2 px-3 py-2.5 text-[13px] text-muted">{children}</p>;

const MIN_ROWS = 2;
const SERIES_COLORS = ["#16825f", "#2b7bd6", "#c47f17"];

type ProjectRow = { key: string; name: string; developer: string; status: ProjectStatus; capacityMw: number | null; href?: string };
type CompanyRow = { key: string; name: string; categories: CompanyCategory[]; href?: string };
type TenderRow = { key: string; title: string; type: OpportunityType; status: OpportunityStatus; deadline: string | null; scope?: string; href?: string };
type PolicyRow = { key: string; title: string; meta: string; href?: string };

const rowClass = "block rounded-btn border border-line-2 px-3 py-2.5 transition-colors hover:border-sage hover:bg-paper-2";

/**
 * Right sidebar for one country: projects, day-ahead prices, companies
 * headquartered there, open tenders and policies. Dataset records come first
 * (EU/EEA-wide items for member states); thin sections are topped up from
 * demoCountry.ts.
 */
export function CountryDrawer({ country, onClose }: { country: string | null; onClose: () => void }) {
  const res = useResource("country:all", loadCountryData);
  const name = country ? datasetCountryName(country) : "";
  const data = res.data;
  const code = (data && country ? codeFor(name, data) : undefined) ?? (country ? atlasCountryCode(country) : undefined);
  const flag = flagSrc(code);

  const projects: HydrogenProject[] = data ? data.projects.filter((p) => p.countryName === name).sort((a, b) => (b.capacityMw ?? -1) - (a.capacityMw ?? -1)) : [];
  const companies: Company[] = data ? data.companies.filter((c) => c.countryName === name) : [];
  const zones = data && code ? data.zones.filter((z) => z.country === code) : [];
  const inEu = !!code && EU_MEMBERS.has(code);
  const inEea = !!code && EEA_MEMBERS.has(code);
  const coversCountry = (scope: string) => scope === code || (scope === "EU" && inEu) || (scope === "EEA" && inEea);

  const tenders: Opportunity[] = data
    ? data.opportunities
        .filter((o) => coversCountry(o.country))
        .map((o) => ({ ...o, status: effectiveStatus(o) }))
        .filter((o) => o.status === "open" || o.status === "upcoming")
        .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"))
    : [];
  const policies: MarketInsight[] = data ? data.insights.filter((i) => i.category === "policy" && coversCountry(i.region)) : [];
  // Sections the datasets leave thin are topped up with deterministic demo rows (see demoCountry.ts).
  const demo = country ? demoCountry(name) : null;
  const fill = <T,>(real: T[], extra: T[]) => (real.length >= MIN_ROWS ? real : [...real, ...extra.slice(0, Math.max(0, MIN_ROWS + 1 - real.length))]);

  const projectRows = fill<ProjectRow>(
    projects.map((p) => ({ key: p.id, name: p.name, developer: p.developer, status: p.status, capacityMw: p.capacityMw, href: projectHref(p.id) })),
    (demo?.projects ?? []).map((p) => ({ key: p.id, name: p.name, developer: p.developer, status: p.status, capacityMw: p.capacityMw })),
  );
  const companyRows = fill<CompanyRow>(
    companies.map((c) => ({ key: c.id, name: c.name, categories: c.categories, href: `/app/companies/${encodeURIComponent(c.id)}` })),
    (demo?.companies ?? []).map((c) => ({ key: c.id, name: c.name, categories: c.categories })),
  );
  const tenderRows = fill<TenderRow>(
    tenders.map((o) => ({ key: o.id, title: o.title, type: o.type, status: o.status, deadline: o.deadline, scope: o.country !== code ? `${o.country}-wide` : undefined, href: `/app/opportunities/${encodeURIComponent(o.id)}` })),
    (demo?.tenders ?? []).map((t) => ({ key: t.id, title: t.title, type: t.type, status: t.status, deadline: t.deadline })),
  );
  const policyRows: PolicyRow[] = [
    ...policies.map((i) => ({ key: i.id, title: i.title, meta: `${i.region}-wide · ${i.publisher} · ${fmtDate(i.publishedAt)}`, href: i.sources[0]?.url })),
    ...(demo?.policies ?? []).map((p) => ({ key: p.id, title: p.title, meta: `${p.kind} · ${p.year}` })),
  ];

  // Price chart: up to three of the country's real bidding zones, else one national series.
  const realSeries = zones
    .map((z) => ({ zone: z, series: data?.monthly.find((m) => m.biddingZone === z.code) }))
    .filter((x) => x.series && x.series.points.length)
    .slice(0, 3);
  const chartSeries = realSeries.length
    ? realSeries.map((x, i) => ({ key: x.zone.code, label: x.zone.code, color: SERIES_COLORS[i], points: x.series!.points.slice(-24) }))
    : demo
      ? [{ key: "national", label: name, color: SERIES_COLORS[0], points: demo.prices }]
      : [];
  const chartRows = chartSeries.length
    ? chartSeries[0].points.map((pt, i) => Object.fromEntries([["t", pt.t], ...chartSeries.map((s) => [s.key, s.points[i]?.v ?? null])]) as Record<string, string | number | null>)
    : [];
  const priceRows = realSeries.length
    ? realSeries.map((x) => ({ key: x.zone.code, code: x.zone.code, label: x.zone.name, sum: priceSummary(x.series) }))
    : demo
      ? [{ key: "national", code: code ?? "—", label: `${name} day-ahead`, sum: priceSummary({ points: demo.prices } as PriceSeries) }]
      : [];

  const pipelineMw = projectRows.filter((p) => p.status !== "cancelled").reduce((s, p) => s + (p.capacityMw ?? 0), 0);
  const statusParts = STATUS_ORDER.map((st) => ({
    key: st,
    label: PROJECT_STATUS[st].label,
    color: PROJECT_STATUS[st].color,
    value: projectRows.filter((p) => p.status === st).reduce((s, p) => s + (p.capacityMw ?? 0), 0),
  })).filter((p) => p.value > 0);

  return (
    <Drawer
      open={!!country}
      onClose={onClose}
      width="max-w-lg"
      title={
        <h2 className="flex items-center gap-3 text-[22px] leading-tight font-light text-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {flag && <img src={flag} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" />}
          {name}
        </h2>
      }
    >
      {res.status === "error" ? (
        <ErrorState error={res.error} onRetry={res.refetch} />
      ) : !data ? (
        <div className="space-y-3" role="status" aria-label="Loading country">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-7">
          <dl className="grid grid-cols-3 gap-3">
            {[
              { l: "Projects", v: fmtNum(projectRows.length) },
              { l: "Pipeline", v: pipelineMw ? fmtMw(pipelineMw) : "—" },
              { l: "Open tenders", v: fmtNum(tenderRows.length) },
            ].map((k) => (
              <div key={k.l} className="rounded-btn bg-paper-2 px-3 py-2.5">
                <dt className="text-[11px] text-muted">{k.l}</dt>
                <dd className="num mt-0.5 text-lg font-light text-ink">{k.v}</dd>
              </div>
            ))}
          </dl>

          <Section title="Projects" count={projectRows.length}>
            {statusParts.length > 0 && (
              <div className="mb-4 rounded-btn border border-line-2 p-3">
                <div className="mb-2 text-[11px] text-muted">Pipeline capacity by status</div>
                <StackedBar parts={statusParts} format={(v) => fmtMw(v)} height={10} />
              </div>
            )}
            {projectRows.length ? (
              <ul className="space-y-2">
                {projectRows.map((p) => (
                  <li key={p.key}>
                    <Row href={p.href}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{p.name}</span>
                        <span className="num shrink-0 text-sm text-ink-2">{fmtMw(p.capacityMw)}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <ProjectStatusPill status={p.status} />
                        {p.developer}
                      </div>
                    </Row>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No tracked projects in {name}.</Empty>
            )}
          </Section>

          <Section
            title="Electricity prices"
            action={
              realSeries.length ? (
                <Link href="/app/markets" className="inline-flex items-center gap-1 text-xs font-medium text-forest hover:underline">
                  Energy markets <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              ) : undefined
            }
          >
            {chartRows.length > 0 && (
              <div className="mb-3 rounded-btn border border-line-2 p-3">
                <div className="mb-1 text-[11px] text-muted">Monthly day-ahead average · €/MWh</div>
                <LineChart data={chartRows} xKey="t" series={chartSeries.map(({ key, label, color }) => ({ key, label, color }))} height={170} yUnit="€/MWh" formatX={(v) => fmtDate(String(v).slice(0, 7))} />
              </div>
            )}
            {priceRows.length ? (
              <div className="overflow-hidden rounded-btn border border-line-2">
                <table className="w-full text-sm">
                  <thead className="bg-paper-2 text-left text-[11px] text-muted">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Bidding zone
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        Latest month
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        12-mo avg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceRows.map((z) => (
                      <tr key={z.key} className="border-t border-line-2">
                        <td className="px-3 py-2">
                          <span className="num font-medium text-ink">{z.code}</span> <span className="text-xs text-muted">{z.label}</span>
                        </td>
                        <td className="num px-3 py-2 text-right text-ink">
                          {z.sum ? (
                            <>
                              {z.sum.last.toFixed(2)} <span className="block text-[11px] text-faint">{fmtDate(z.sum.month.slice(0, 7))}</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="num px-3 py-2 text-right text-ink-2">{z.sum ? z.sum.avg12.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>No price data for {name}.</Empty>
            )}
          </Section>

          <Section title="Companies headquartered here" count={companyRows.length}>
            {companyRows.length ? (
              <ul className="space-y-2">
                {companyRows.map((c) => (
                  <li key={c.key}>
                    <Row href={c.href}>
                      <div className="text-sm font-medium text-ink">{c.name}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.categories.map((cat) => (
                          <Badge key={cat} tone="violet">
                            {COMPANY_CATEGORY[cat]}
                          </Badge>
                        ))}
                      </div>
                    </Row>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No tracked companies headquartered in {name}.</Empty>
            )}
          </Section>

          <Section title="Open tenders & funding" count={tenderRows.length}>
            {tenderRows.length ? (
              <ul className="space-y-2">
                {tenderRows.map((o) => (
                  <li key={o.key}>
                    <Row href={o.href}>
                      <div className="text-sm font-medium text-ink">{o.title}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <OpportunityStatusPill status={o.status} />
                        <span>{OPPORTUNITY_TYPE[o.type]}</span>
                        {o.scope && <span>· {o.scope}</span>}
                        <span>· {o.deadline ? `Deadline ${fmtDate(o.deadline)}` : "Deadline not yet published"}</span>
                      </div>
                    </Row>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No open or upcoming calls for {name}.</Empty>
            )}
          </Section>

          <Section title="Policies & acts" count={policyRows.length}>
            {policyRows.length ? (
              <ul className="space-y-2">
                {policyRows.map((pol) => (
                  <li key={pol.key}>
                    <Row href={pol.href} external>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{pol.title}</span>
                        {pol.href && <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-faint" aria-hidden />}
                      </div>
                      <div className="mt-1 text-xs text-muted">{pol.meta}</div>
                    </Row>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No policies or acts tracked for {name}.</Empty>
            )}
          </Section>
        </div>
      )}
    </Drawer>
  );
}

/** List row: a link when the record has its own page, otherwise a plain card. */
function Row({ href, external, children }: { href?: string; external?: boolean; children: ReactNode }) {
  if (!href) return <div className="rounded-btn border border-line-2 px-3 py-2.5">{children}</div>;
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={rowClass}>
      {children}
    </Link>
  );
}
