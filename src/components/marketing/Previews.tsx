import { CalendarClock, CheckCircle2, CircleDashed } from "lucide-react";
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import type { ReactNode } from "react";
import { WorldMap } from "@/components/map/WorldMap";
import type { Company, EquipmentProduct, HydrogenProject, LcohResult, Opportunity, WorkspaceMilestone } from "@/domain/types";
import type { TornadoBar } from "@/lib/economics/sensitivity";
import { daysUntil, fmtDate, fmtMoney, fmtMw, fmtNum } from "@/lib/format";
import { OPPORTUNITY_STATUS, OPPORTUNITY_TYPE, PROJECT_STATUS } from "@/lib/labels";

/** Window chrome for product previews. */
export function PreviewFrame({ title, crumb, children, footnote }: { title: string; crumb: string; children: ReactNode; footnote?: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/80 bg-paper shadow-float">
      <div className="flex items-center gap-2 border-b border-line-2 bg-paper-2/70 px-4 py-2.5">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
        </span>
        <span className="ml-2 truncate text-[11px] text-muted">
          <span className="text-violet">{crumb}</span> / {title}
        </span>
      </div>
      <div className="p-4 md:p-5">{children}</div>
      {footnote && <div className="border-t border-line-2 px-4 py-2 text-[10px] text-faint">{footnote}</div>}
    </div>
  );
}

export function ProjectsPreview({ projects, compiledAt }: { projects: HydrogenProject[]; compiledAt: string }) {
  const top = [...projects].sort((a, b) => (b.capacityMw ?? 0) - (a.capacityMw ?? 0)).slice(0, 4);
  return (
    <PreviewFrame crumb="Project Intelligence" title="Global map" footnote={`${projects.length} sourced records · dataset ${fmtDate(compiledAt)}`}>
      <WorldMap points={projects.map((p) => ({ id: p.id, lat: p.location.lat, lon: p.location.lon, value: p.capacityMw, color: PROJECT_STATUS[p.status].color, label: p.name, sub: `${fmtMw(p.capacityMw)} · ${PROJECT_STATUS[p.status].label}` }))} />
      <div className="mt-3 divide-y divide-line-2 text-[12px]">
        {top.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: PROJECT_STATUS[p.status].color }} />
            <span className="flex-1 truncate text-ink">{p.name}</span>
            <span className="num text-ink-2">
              <Estimate on={isEstimated(p, "capacityMw")}>{fmtMw(p.capacityMw)}</Estimate>
            </span>
            <span className="w-28 truncate text-right text-muted">{PROJECT_STATUS[p.status].label}</span>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

export function EconomicsPreview({ result, bars }: { result: LcohResult; bars: TornadoBar[] }) {
  const span = Math.max(...bars.flatMap((b) => [Math.abs(b.lowLcoh - result.lcohEurKg), Math.abs(b.highLcoh - result.lcohEurKg)]), 0.01);
  return (
    <PreviewFrame crumb="LCOH Calculator" title="Base case · 20 MW PEM" footnote="Preliminary estimate from the base-case preset. Assumptions shown in the calculator.">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] text-muted">Levelised cost of hydrogen</div>
          <div className="num text-[44px] leading-none font-light text-ink">
            €{result.lcohEurKg.toFixed(2)}
            <span className="ml-1 text-sm text-muted">/kg</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-muted">
          <div className="num text-ink-2">{fmtNum(result.annualProductionT)} t/yr</div>
          <div>{fmtNum(result.capacityFactorPct, 0)}% capacity factor</div>
        </div>
      </div>
      <div className="mt-5 text-[11px] font-medium text-ink">Sensitivity</div>
      <ul className="mt-2 space-y-2">
        {bars.slice(0, 5).map((b) => {
          const lo = Math.min(b.lowLcoh, b.highLcoh);
          const hi = Math.max(b.lowLcoh, b.highLcoh);
          const l = 50 - ((result.lcohEurKg - lo) / span) * 46;
          const r = 50 + ((hi - result.lcohEurKg) / span) * 46;
          return (
            <li key={b.field} className="grid grid-cols-[110px_1fr] items-center gap-2 text-[11px]">
              <span className="truncate text-ink-2">{b.label}</span>
              <span className="relative h-4">
                <span className="absolute inset-y-0 left-1/2 w-px bg-ink/25" />
                <span className="absolute inset-y-0.5 rounded-l-sm bg-series-1" style={{ left: `${l}%`, width: `${50 - l}%` }} />
                <span className="absolute inset-y-0.5 rounded-r-sm bg-series-5" style={{ left: "50%", width: `${r - 50}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </PreviewFrame>
  );
}

export function SuppliersPreview({ products }: { products: (EquipmentProduct & { supplierName: string })[] }) {
  const rows = products.filter((p) => p.efficiencyKwhPerKg != null).slice(0, 4);
  return (
    <PreviewFrame crumb="Technology & Suppliers" title="Compare equipment" footnote="Specifications as published by manufacturers (vendor claims).">
      <div className="overflow-hidden rounded-btn border border-line-2">
        <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr] gap-2 bg-paper-2 px-3 py-1.5 text-[10px] tracking-wide text-muted uppercase">
          <span>Model</span>
          <span>Capacity</span>
          <span className="text-right">kWh/kg</span>
          <span className="text-right">Price</span>
        </div>
        {rows.map((p) => (
          <div key={p.id} className="grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr] items-center gap-2 border-t border-line-2 px-3 py-2 text-[12px]">
            <span className="min-w-0">
              <span className="block truncate text-ink">{p.model}</span>
              <span className="block truncate text-[10px] text-muted">{p.supplierName}</span>
            </span>
            <span className="num truncate text-ink-2">{p.capacity ? `${fmtNum(p.capacity.value, p.capacity.value < 10 ? 1 : 0)} ${p.capacity.unit}` : "—"}</span>
            <span className="num text-right text-ink">
              <Estimate on={isEstimated(p, "efficiencyKwhPerKg")}>{p.efficiencyKwhPerKg?.toFixed(1)}</Estimate>
            </span>
            <span className="text-right text-[10px] text-muted">{p.publicPrice ? "Public" : "On request"}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-btn bg-forest px-3 py-1.5 text-[11px] font-bold text-white">Request quotation</span>
        <span className="rounded-btn border border-line px-3 py-1.5 text-[11px] text-ink-2">Compare 4 products</span>
      </div>
    </PreviewFrame>
  );
}

export function RadarPreview({ opportunities }: { opportunities: Opportunity[] }) {
  const items = [...opportunities].sort((a, b) => (a.status === "open" ? -1 : 0) - (b.status === "open" ? -1 : 0)).slice(0, 4);
  return (
    <PreviewFrame crumb="Opportunity Radar" title="Tenders & funding" footnote="Status as of the dataset snapshot. Always confirm on the official portal.">
      <ul className="space-y-2">
        {items.map((o) => {
          const d = daysUntil(o.deadline);
          return (
            <li key={o.id} className="rounded-btn border border-line-2 p-3">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="rounded-full bg-violet-soft px-2 py-px text-violet">{OPPORTUNITY_TYPE[o.type]}</span>
                <span className="text-muted">{o.countryName}</span>
                <span className="ml-auto text-muted">{OPPORTUNITY_STATUS[o.status].label}</span>
              </div>
              <div className="mt-1.5 line-clamp-1 text-[13px] text-ink">{o.title}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                <CalendarClock className="size-3" />
                {o.deadline ? (
                  <Estimate on={isEstimated(o, "deadline")}>{d != null && d >= 0 ? `${d} days left · ${fmtDate(o.deadline)}` : `Closed ${fmtDate(o.deadline)}`}</Estimate>
                ) : (
                  "Deadline not yet published"
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </PreviewFrame>
  );
}

export function InvestmentPreview({ companies }: { companies: Company[] }) {
  const deals = companies
    .flatMap((c) => c.deals.map((d) => ({ ...d, company: c.name })))
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);
  return (
    <PreviewFrame crumb="Companies & Investors" title="Documented deals" footnote="Publicly documented transactions only.">
      <ol className="relative space-y-3 border-l border-line pl-4">
        {deals.map((d) => (
          <li key={d.id} className="relative">
            <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-paper bg-violet" />
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <span className="num">{d.year}</span>
              <span className="rounded bg-stone px-1.5 capitalize">{d.kind.replace("-", " ")}</span>
              <span className="ml-auto num text-ink-2">
                <Estimate on={isEstimated(d, "amount")}>{fmtMoney(d.amount).replace("Not disclosed", "Undisclosed")}</Estimate>
              </span>
            </div>
            <div className="mt-0.5 truncate text-[12.5px] text-ink">
              {d.company} · {d.counterparty}
            </div>
          </li>
        ))}
      </ol>
    </PreviewFrame>
  );
}

export function DeliveryPreview({ milestones }: { milestones: WorkspaceMilestone[] }) {
  return (
    <PreviewFrame crumb="Project Workspace" title="Demo: 50 MW electrolysis plant" footnote="Demo data — illustrates the planned delivery workspace.">
      <div className="grid grid-cols-6 gap-1 text-[9px] text-muted">
        {["Feasibility", "Pre-FEED", "FEED", "Procure", "Build", "Commission"].map((p, i) => (
          <div key={p}>
            <div className={`h-1.5 rounded-full ${i < 1 ? "bg-forest" : i === 1 ? "bg-violet" : "bg-stone"}`} />
            <div className="mt-1 truncate">{p}</div>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {milestones.slice(0, 5).map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 text-[12px]">
            {m.status === "done" ? <CheckCircle2 className="size-3.5 text-ok" /> : <CircleDashed className={`size-3.5 ${m.status === "at-risk" ? "text-warn" : "text-faint"}`} />}
            <span className="flex-1 truncate text-ink">{m.title}</span>
            <span className={`num text-[11px] ${m.status === "at-risk" ? "text-warn" : "text-muted"}`}>{fmtDate(m.date, { month: "short", year: "numeric" })}</span>
          </li>
        ))}
      </ul>
    </PreviewFrame>
  );
}
