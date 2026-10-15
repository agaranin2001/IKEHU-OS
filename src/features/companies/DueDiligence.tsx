"use client";

import { ArrowUpRight, CheckCircle2, CircleDashed, FileLock2, MinusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, OriginTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { SelectField, TextArea } from "@/components/ui/Fields";
import { Panel } from "@/components/ui/Panel";
import { ProvenanceBlock } from "@/components/ui/Sources";
import { EmptyState, LoadingRows, ResourceView } from "@/components/ui/States";
import type { Company } from "@/domain/types";
import { useResource } from "@/hooks/useResource";
import { COMPANY_CATEGORY } from "@/lib/labels";
import { services } from "@/services";
import { buildDdChecklist, profileHref, type DdItem, type DdItemState } from "./model";

const STATE: Record<DdItemState, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  public: { label: "From public record", icon: CheckCircle2, cls: "text-ok" },
  missing: { label: "Not disclosed publicly", icon: MinusCircle, cls: "text-faint" },
  "data-room": { label: "Requires data room / not in public record", icon: FileLock2, cls: "text-warn" },
};

const PLANNED = [
  { title: "Acquisition target screening", body: "Screen companies against strategic criteria. Requires licensed corporate data." },
  { title: "Valuation", body: "Comparable-transaction and DCF workbenches. Not offered on public data." },
  { title: "AI-assisted due diligence", body: "Document review across a connected data room." },
  { title: "Patent search", body: "Patent families, citations and freedom-to-operate flags." },
  { title: "JV partner matching", body: "Match developers, OEMs and offtakers by capability and geography." },
  { title: "Investment memo generation", body: "Draft a memo from verified checklist answers and analyst notes." },
];

export function DueDiligence({ initialCompanyId }: { initialCompanyId?: string }) {
  const res = useResource("dd:companies", () => services.companies.list());
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <OriginTag origin="preview" />
        <p className="text-sm text-ink-2">Preliminary due-diligence workspace. Public facts are filled from the record; everything else is flagged for the data room.</p>
      </div>
      <ResourceView
        resource={res}
        loading={<LoadingRows rows={6} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="No companies available" body="The company dataset is empty, so there is nothing to review yet." />}
      >
        {(companies) => <Checklist companies={[...companies].sort((a, b) => a.name.localeCompare(b.name))} initialCompanyId={initialCompanyId} />}
      </ResourceView>
      <PlannedFeatures />
    </div>
  );
}

function Checklist({ companies, initialCompanyId }: { companies: Company[]; initialCompanyId?: string }) {
  const [selectedId, setSelectedId] = useState(initialCompanyId ?? "");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const company = companies.find((c) => c.id === selectedId) ?? companies[0];

  const supplierRes = useResource(`dd:supplier:${company.supplierId ?? "none"}`, () =>
    company.supplierId ? services.suppliers.get(company.supplierId) : Promise.resolve(null),
  );
  // useResource keeps the previous result while refetching — only use it if it belongs to this company.
  const supplier = supplierRes.data && supplierRes.data.id === company.supplierId ? supplierRes.data : null;
  const supplierLoading = !!company.supplierId && !supplier && supplierRes.isFetching;
  const workstreams = useMemo(() => buildDdChecklist(company, supplier), [company, supplier]);

  const allItems = workstreams.flatMap((w) => w.items);
  const answered = allItems.filter((i) => i.state === "public").length;
  const pct = Math.round((answered / Math.max(allItems.length, 1)) * 100);

  return (
    <div className="space-y-5">
      <Panel bodyClassName="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SelectField
            label="Company under review"
            className="w-full lg:max-w-sm"
            value={company.id}
            onChange={(e) => {
              setSelectedId(e.target.value);
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "diligence");
              url.searchParams.set("company", e.target.value);
              window.history.replaceState(null, "", url);
            }}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:min-w-[440px]">
            <div>
              <div className="text-xs font-medium text-muted">Answerable from public record</div>
              <div className="num mt-1 text-2xl font-normal text-ink">
                {answered}
                <span className="text-sm text-muted"> / {allItems.length}</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted">Requires data room</div>
              <div className="num mt-1 text-2xl font-normal text-ink">{allItems.filter((i) => i.state !== "public").length}</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs font-medium text-muted">Scoring rating</div>
              <div className="mt-2.5 h-2 rounded-full bg-paper-2" role="img" aria-label={`Scoring rating ${pct} out of 100, based on checklist items answerable from public sources`}>
                <div className="h-full rounded-full bg-forest transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="num mt-1 text-[11px] text-faint">{pct} / 100</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-2 pt-4 text-sm">
          {company.categories.map((k) => (
            <Badge key={k} tone="violet">
              {COMPANY_CATEGORY[k]}
            </Badge>
          ))}
          <span className="text-muted">{company.headquarters}</span>
          <Link href={profileHref(company.id)} className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-forest hover:underline">
            Open profile <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {workstreams.map((ws) => {
            const done = ws.items.filter((i) => i.state === "public").length;
            const noteKey = `${company.id}:${ws.id}`;
            return (
              <Panel
                key={ws.id}
                title={ws.title}
                subtitle={`${done} of ${ws.items.length} answerable from public sources`}
                actions={<Badge tone={done === ws.items.length ? "ok" : done === 0 ? "neutral" : "info"}>{done === 0 ? "Data room only" : `${done}/${ws.items.length} public`}</Badge>}
                bodyClassName="px-5 pb-5 pt-3"
              >
                <ul className="divide-y divide-line-2">
                  {ws.items.map((item) => (
                    <ChecklistItem key={item.id} item={item} loading={supplierLoading && item.id === "capacity"} />
                  ))}
                </ul>
                <TextArea
                  label="Analyst notes"
                  className="mt-4"
                  placeholder={`Notes on ${ws.title.toLowerCase()} for ${company.name}…`}
                  value={notes[noteKey] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [noteKey]: e.target.value }))}
                />
                <p className="mt-1.5 text-[11px] text-faint">Notes stay in this browser tab only and are cleared on reload. Saving and sharing notes is planned.</p>
              </Panel>
            );
          })}
        </div>
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <ProvenanceBlock record={company} />
          <Panel title="Legend" bodyClassName="px-5 pb-5 pt-3">
            <ul className="space-y-2.5 text-sm">
              {(Object.keys(STATE) as DdItemState[]).map((s) => {
                const Icon = STATE[s].icon;
                return (
                  <li key={s} className="flex items-start gap-2 text-ink-2">
                    <Icon className={cn("mt-0.5 size-4 shrink-0", STATE[s].cls)} aria-hidden />
                    {STATE[s].label}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function ChecklistItem({ item, loading }: { item: DdItem; loading?: boolean }) {
  const s = STATE[item.state];
  const Icon = loading ? CircleDashed : s.icon;
  return (
    <li className="grid grid-cols-[20px_1fr] gap-x-3 py-3 first:pt-1 last:pb-1 sm:grid-cols-[20px_minmax(180px,38%)_1fr]">
      <Icon className={cn("mt-0.5 size-4", loading ? "animate-spin text-faint" : s.cls)} aria-label={loading ? "Loading" : s.label} />
      <div className="text-sm text-ink">{item.label}</div>
      <div className="col-start-2 mt-1 min-w-0 text-sm sm:col-start-3 sm:mt-0">
        {loading ? (
          <span className="text-faint">Loading supplier record…</span>
        ) : item.state === "public" ? (
          <>
            <span className="break-words text-ink-2">{item.value}</span>
            {item.list && item.list.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted">
                {item.list.slice(0, 5).map((l) => (
                  <li key={l}>{l}</li>
                ))}
                {item.list.length > 5 && <li className="text-faint">+{item.list.length - 5} more on the profile</li>}
              </ul>
            )}
            {item.note && <p className="mt-1 text-[11px] text-faint">{item.note}</p>}
          </>
        ) : (
          <>
            <span className={item.state === "data-room" ? "text-warn" : "text-faint"}>{s.label}</span>
            {item.note && <p className="mt-0.5 text-[11px] text-faint">{item.note}</p>}
          </>
        )}
      </div>
    </li>
  );
}

function PlannedFeatures() {
  return (
    <Panel title="Planned investment tools" subtitle="Not available in this phase — no outputs are generated.">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PLANNED.map((f) => (
          <li key={f.title} className="flex flex-col rounded-btn border border-dashed border-line bg-paper-2 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <Sparkles className="size-4 text-muted" aria-hidden />
              {f.title}
            </div>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{f.body}</p>
            <Button variant="secondary" size="sm" disabled className="mt-3 self-start" aria-label={`${f.title} — planned, not available`}>
              Planned
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
