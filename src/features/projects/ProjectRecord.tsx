import { ArrowUpRight, ChevronRight, History } from "lucide-react";
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import Link from "next/link";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { WorldMap } from "@/components/map/WorldMap";
import { Badge, OriginTag } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { DatasetNote, ProvenanceBlock } from "@/components/ui/Sources";
import { ProjectStatusPill, VerificationPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { DatasetInfo, HydrogenProject } from "@/domain/types";
import { fmtDate, fmtMoney, fmtMw } from "@/lib/format";
import { PROJECT_STATUS } from "@/lib/labels";
import { FactList, projectFactGroups } from "./ProjectFacts";
import { StatusDot, StatusLegend } from "./StatusLegend";
import { calculatorHref, commissioningLabel, outputLabel, projectDeepLink, projectHref, regionToView, toMapPoints } from "./model";

function KeyFigure({ label, value, unknown, hint, estimate }: { label: string; value: string; unknown?: boolean; hint?: string; estimate?: boolean }) {
  return (
    <div className="min-w-0 p-4 shadow-[1px_0_0_0_var(--color-line-2),0_1px_0_0_var(--color-line-2)] md:p-5">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={cn("num mt-1 leading-tight font-light tracking-tight", unknown ? "text-lg text-faint" : "text-[24px] text-ink")}>
        <Estimate on={estimate}>{value}</Estimate>
      </div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-faint">{hint}</div>}
    </div>
  );
}

/** Full project record — server-renderable; data is passed in by the route. */
export function ProjectRecord({
  project: p,
  related,
  info,
}: {
  project: HydrogenProject;
  related: { project: HydrogenProject; reason: string }[];
  info?: DatasetInfo;
}) {
  const lcoh = calculatorHref(p);
  const groups = projectFactGroups(p);
  const point = toMapPoints([p]);

  return (
    <>
      <PageHeader
        eyebrow={
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/app/projects" className="hover:underline">
                  Projects
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page" className="max-w-[60vw] truncate text-muted">
                {p.name}
              </li>
            </ol>
          </nav>
        }
        title={p.name}
        description={`${p.location.label}, ${p.countryName} · Developed by ${p.developer}`}
        meta={
          <>
            <ProjectStatusPill status={p.status} />
            <VerificationPill status={p.verification} />
            {p.finalInvestmentDecision === true && <Badge tone="ok">FID taken</Badge>}
            <OriginTag origin="sourced" />
            <span className="text-xs text-muted">Last verified {fmtDate(p.verifiedAt)}</span>
          </>
        }
        actions={
          <>
            <ButtonLink href={projectDeepLink(p.id)} variant="secondary" size="md">
              View in project map
            </ButtonLink>
            {lcoh && (
              <ButtonLink href={lcoh} size="md">
                Model LCOH for this project
              </ButtonLink>
            )}
          </>
        }
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <section aria-label="Key figures" className="grid grid-cols-2 overflow-hidden rounded-card border border-line-2 bg-paper shadow-card md:grid-cols-4">
              <KeyFigure
                label="Electrolyser input capacity"
                value={fmtMw(p.capacityMw)}
                unknown={p.capacityMw == null}
                estimate={isEstimated(p, "capacityMw")}
                hint={isEstimated(p, "capacityMw") ? undefined : "As disclosed by the developer"}
              />
              <KeyFigure label="Hydrogen output" value={outputLabel(p.hydrogenOutputTpa)} unknown={p.hydrogenOutputTpa == null} estimate={isEstimated(p, "hydrogenOutputTpa")} />
              <KeyFigure label="Investment" value={p.investment ? fmtMoney(p.investment) : "Undisclosed"} unknown={!p.investment} hint={p.investment?.scope} estimate={isEstimated(p, "investment")} />
              <KeyFigure label="Expected commissioning" value={commissioningLabel(p.expectedCommissioning)} unknown={p.expectedCommissioning == null} estimate={isEstimated(p, "expectedCommissioning")} />
            </section>

            <Panel title="About this project">
              <p className="text-[15px] leading-relaxed text-ink-2">{p.description}</p>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-2">
              {groups.map((g) => (
                <Panel key={g.id} title={g.title} bodyClassName="px-5 pt-2 pb-3" className={g.id === "overview" ? "xl:col-span-2" : undefined}>
                  <FactList facts={g.facts} />
                </Panel>
              ))}
            </div>

            <Panel
              title="Location"
              subtitle={`${p.location.label}, ${p.countryName} · ${p.location.precision === "exact" ? "site coordinates" : "approximate (town or region centroid)"}`}
            >
              <WorldMap points={point} view={regionToView(p.region)} selectedId={p.id} maxValue={Math.max(p.capacityMw ?? 1, 1)} />
              <p className="mt-2 text-[11px] text-faint">
                {p.location.lat.toFixed(3)}°, {p.location.lon.toFixed(3)}° · {p.region}
              </p>
            </Panel>
          </div>

          <aside className="min-w-0 space-y-6">
            <ProvenanceBlock record={p} />

            <Panel title="Status" subtitle="How statuses are assigned in this dataset">
              <StatusLegend highlight={p.status} />
              <div className="mt-4 flex gap-2.5 rounded-btn border border-dashed border-line bg-paper-2 p-3 text-xs leading-relaxed text-ink-2">
                <History className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <p>
                  <span className="font-semibold text-ink">Status history is not tracked in this version.</span> The record shows the status as of its last verification
                  ({fmtDate(p.verifiedAt)}). Earlier stages and dates are not stored.
                </p>
              </div>
            </Panel>

            <Panel title="Related projects" subtitle="Same developer or same country">
              {related.length ? (
                <ul className="-mx-2 divide-y divide-line-2">
                  {related.map(({ project: r, reason }) => (
                    <li key={r.id}>
                      <Link href={projectHref(r.id)} className="group flex items-start gap-3 rounded-btn px-2 py-3 hover:bg-paper-2">
                        <StatusDot status={r.status} className="mt-1.5" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-ink group-hover:text-forest">{r.name}</span>
                          <span className="block text-xs text-muted">
                            {reason} · {PROJECT_STATUS[r.status].label}
                          </span>
                        </span>
                        <span className={cn("num shrink-0 text-xs", r.capacityMw == null ? "text-faint" : "text-ink-2")}>{fmtMw(r.capacityMw)}</span>
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-faint group-hover:text-forest" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No other projects by this developer or in {p.countryName} in the current dataset.</p>
              )}
              {info && <DatasetNote className="mt-3">Matched within dataset v{info.version} compiled {fmtDate(info.compiledAt)}.</DatasetNote>}
            </Panel>
          </aside>
        </div>
      </PageBody>
    </>
  );
}
