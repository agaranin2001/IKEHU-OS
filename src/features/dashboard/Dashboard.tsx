"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Sparkline } from "@/components/charts/Bars";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { Badge, OriginTag } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Panel, Stat } from "@/components/ui/Panel";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ProjectStatusPill } from "@/components/ui/StatusPill";
import { APP_NAV_FLAT } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { projectStats } from "@/lib/aggregate";
import { electricityCostPerKg } from "@/lib/economics/lcoh";
import { daysUntil, fmtDate, fmtMw, fmtNum, SNAPSHOT_DATE } from "@/lib/format";
import { OPPORTUNITY_TYPE } from "@/lib/labels";
import { services } from "@/services";
import { type Alert, buildAlerts } from "./alerts";
import { DashboardMap } from "./DashboardMap";

const INDICATOR_ZONES = ["EE", "FI", "SE3", "NO2", "DK1", "DE-LU"];
const SEC = 55;

async function loadDashboard() {
  const [projects, info, insights, monthly, zones, opportunities, oppInfo] = await Promise.all([
    services.projects.list(),
    services.projects.info(),
    services.insights.list(),
    services.energy.monthly(INDICATOR_ZONES),
    services.energy.zones(),
    services.opportunities.list(),
    services.opportunities.info(),
  ]);
  return { projects, info, insights, monthly, zones, opportunities, oppInfo };
}

export function Dashboard() {
  const res = useResource("dashboard", loadDashboard);

  return (
    <>
      <PageHeader
        title="Global hydrogen market overview"
        meta={<Badge tone="neutral">Snapshot {fmtDate(SNAPSHOT_DATE)}</Badge>}
        actions={
          <>
            <ButtonLink href="/app/projects" variant="secondary" size="md">
              Project database
            </ButtonLink>
            <ButtonLink href="/app/calculator" size="md">
              New LCOH calculation
            </ButtonLink>
          </>
        }
      />
      <PageBody>
        {res.status === "error" ? (
          <ErrorState error={res.error} onRetry={res.refetch} />
        ) : !res.data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-80 lg:col-span-2" />
              <Skeleton className="h-80" />
            </div>
          </div>
        ) : (
          <DashboardBody {...res.data} />
        )}
      </PageBody>
    </>
  );
}

/** Alert cards, styled like the opportunity cards. */
function AlertList({ items }: { items: Alert[] }) {
  return (
    <ul className="-my-1 space-y-2">
      {items.map((a) => (
        <li key={a.id + a.badge}>
          <Link href={a.href} className="block rounded-btn border border-line-2 p-3 transition-colors hover:border-sage hover:bg-paper-2">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <Badge tone={a.tone}>{a.badge}</Badge>
              <span className="truncate">{a.where}</span>
            </div>
            <div className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink">{a.title}</div>
            <div className={`mt-1 line-clamp-1 text-[11px] ${a.tone === "bad" ? "text-bad" : "text-warn"}`}>{a.meta}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DashboardBody({ projects, info, insights, monthly, zones, opportunities }: Awaited<ReturnType<typeof loadDashboard>>) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const closeAlerts = useCallback(() => setAlertsOpen(false), []);
  const s = projectStats(projects);
  const note = `Sum of disclosed electrolyser capacity · ${info.recordCount} records, dataset v${info.version}, ${fmtDate(info.compiledAt)}`;

  const indicators = INDICATOR_ZONES.map((code) => {
    const series = monthly.find((m) => m.biddingZone === code);
    if (!series || series.points.length < 13) return null;
    const pts = series.points;
    const last = pts.at(-1)!;
    const yearAgo = pts.at(-13)!;
    return {
      code,
      name: zones.find((z) => z.code === code)?.name ?? code,
      last,
      change: last.v - yearAgo.v,
      spark: pts.slice(-12).map((p) => p.v),
      eurKg: electricityCostPerKg(last.v, SEC),
    };
  }).filter(Boolean) as { code: string; name: string; last: { t: string; v: number }; change: number; spark: number[]; eurKg: number }[];

  const open = opportunities
    .filter((o) => o.status === "open" || o.status === "upcoming")
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));

  const latestSource = (p: (typeof projects)[number]) => p.sources.map((x) => x.publishedAt ?? "").sort().at(-1) ?? "";
  const recent = [...projects].sort((a, b) => latestSource(b).localeCompare(latestSource(a))).slice(0, 4);

  const allAlerts = buildAlerts(opportunities, projects);
  const alerts = allAlerts.slice(0, 4);

  const featured = insights.filter((i) => i.metric).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { l: "Tracked projects", v: fmtNum(s.count), h: `${s.countries} countries · ${s.withCapacity} with disclosed MW` },
          { l: "Pipeline capacity", v: fmtMw(s.totalMw), h: "Electrolyser input, excl. cancelled" },
          { l: "Operational", v: fmtMw(s.mwByStatus.operational), h: `${s.countByStatus.operational} projects` },
          { l: "Under construction", v: fmtMw(s.mwByStatus["under-construction"]), h: `${s.countByStatus["under-construction"]} projects` },
          { l: "Final investment decision", v: fmtNum(s.fidCount), h: "Records with FID confirmed" },
        ].map((k) => (
          <div key={k.l} className="rounded-card border border-line-2 bg-paper p-5 shadow-card">
            <Stat label={k.l} value={k.v} hint={k.h} />
          </div>
        ))}
      </div>

      <DashboardMap projects={projects} footer={note} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Alerts"
          actions={
            allAlerts.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setAlertsOpen(true)}>
                View all <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            )
          }
        >
          {alerts.length === 0 ? (
            <p className="text-sm text-muted">No alerts.</p>
          ) : (
            <AlertList items={alerts} />
          )}
        </Panel>
        <Drawer
          open={alertsOpen}
          onClose={closeAlerts}
          title={
            <div>
              <div className="text-lg font-semibold text-ink">All alerts</div>
              <div className="text-xs text-muted">{allAlerts.length} alerts · derived from the dataset at {fmtDate(SNAPSHOT_DATE)}</div>
            </div>
          }
        >
          <AlertList items={allAlerts} />
        </Drawer>

        <Panel
          title="Opportunities"
          actions={
            <ButtonLink href="/app/opportunities" variant="secondary" size="sm">
              Radar <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        >
          <ul className="-my-1 space-y-2">
            {open.slice(0, 4).map((o) => {
              const d = daysUntil(o.deadline);
              return (
                <li key={o.id}>
                  <Link href={`/app/opportunities/${o.id}`} className="block rounded-btn border border-line-2 p-3 transition-colors hover:border-sage hover:bg-paper-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <Badge tone="violet">{OPPORTUNITY_TYPE[o.type]}</Badge>
                      <span className="truncate">{o.countryName}</span>
                    </div>
                    <div className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink">{o.title}</div>
                    <div className={`mt-1 text-[11px] ${d != null && d <= 30 ? "text-warn" : "text-muted"}`}>
                      {o.deadline ? <Estimate on={isEstimated(o, "deadline")}>{`${d} days left · ${fmtDate(o.deadline)}`}</Estimate> : "Deadline not yet published"}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Electricity market indicators"
        actions={
          <ButtonLink href="/app/markets" variant="secondary" size="sm">
            Energy markets <ArrowUpRight className="size-4" aria-hidden />
          </ButtonLink>
        }
        footer={`Historical data (${monthly[0]?.source.publisher ?? "see sources"} and others). Not live prices. Change vs same month one year earlier.`}
        bodyClassName="p-0"
      >
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <thead className="bg-paper-2 text-left text-[11px] tracking-wide text-muted uppercase">
              <tr>
                <th className="px-5 py-2 font-medium">Bidding zone</th>
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">€/MWh</th>
                <th className="px-3 py-2 text-right font-medium">YoY</th>
                <th className="px-3 py-2 font-medium">12 months</th>
                <th className="px-5 py-2 text-right font-medium">€/kg H₂</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((z) => (
                <tr key={z.code} className="border-t border-line-2 hover:bg-paper-2">
                  <td className="px-5 py-2.5">
                    <span className="font-medium text-ink">{z.code}</span> <span className="text-muted">{z.name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{fmtDate(z.last.t.slice(0, 7))}</td>
                  <td className="num px-3 py-2.5 text-right text-ink">{z.last.v.toFixed(2)}</td>
                  <td className={`num px-3 py-2.5 text-right ${z.change > 0 ? "text-bad" : "text-ok"}`}>
                    <span className="inline-flex items-center gap-1">
                      {z.change > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {z.change > 0 ? "+" : ""}
                      {z.change.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <Sparkline values={z.spark} width={96} height={24} />
                  </td>
                  <td className="num px-5 py-2.5 text-right text-ink">€{z.eurKg.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Recent project updates"
          actions={
            <ButtonLink href="/app/projects" variant="secondary" size="sm">
              Projects <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        >
          <ul className="-my-1 space-y-2">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/app/projects?project=${p.id}`} className="block rounded-btn border border-line-2 p-3 transition-colors hover:border-sage hover:bg-paper-2">
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <ProjectStatusPill status={p.status} />
                    <span className="truncate">
                      {p.countryName} · {fmtMw(p.capacityMw)}
                    </span>
                  </div>
                  <div className="mt-1.5 line-clamp-1 text-[13px] leading-snug text-ink">{p.name}</div>
                  <div className="mt-1 line-clamp-1 text-[11px] text-muted">
                    {fmtDate(latestSource(p))} · {p.statusNote}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Market intelligence">
          <ul className="-my-2 divide-y divide-line-2">
            {featured.map((i) => (
              <li key={i.id} className="py-3">
                <a href={i.sources[0]?.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="num text-lg leading-tight font-light text-ink">{i.metric!.value}</div>
                  <div className="text-xs text-muted">{i.metric!.label}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-faint group-hover:text-forest">
                    {i.publisher} · {fmtDate(i.publishedAt)} <ArrowUpRight className="size-3" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <section aria-labelledby="modules-h">
        <h2 id="modules-h" className="mb-3 text-[15px] font-semibold text-ink">
          Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APP_NAV_FLAT.filter((n) => n.href !== "/app").map((n) => (
            <Link key={n.href} href={n.href} className="group rounded-card border border-line-2 bg-paper p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float">
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-btn bg-mint-soft text-forest">
                  <n.icon className="size-[18px]" />
                </span>
                {n.availability === "preview" ? <OriginTag origin="preview" /> : <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-forest" />}
              </div>
              <div className="mt-4 font-medium text-ink">{n.label}</div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{n.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
