"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight, Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProvenanceBlock } from "@/components/ui/Sources";
import { VerificationPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { TechnologySupplier } from "@/domain/types";
import { hostOf } from "@/lib/format";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import { fmtCapacity, fmtEfficiency } from "./model";
import { CompareToggle, Facts, Figure } from "./parts";

export function ManufacturerGrid({ suppliers, onOpen }: { suppliers: TechnologySupplier[]; onOpen: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {suppliers.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onOpen(s.id)}
            className="group flex h-full w-full flex-col rounded-card border border-line-2 bg-paper p-5 text-left shadow-card transition-colors hover:border-sage"
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-btn bg-paper-2 text-forest">
                <Building2 className="size-5" aria-hidden />
              </div>
              <VerificationPill status={s.verification} />
            </div>
            <h3 className="mt-3 text-xl leading-tight font-light text-ink group-hover:text-forest">{s.companyName}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {s.headquarters}, {s.countryName} · {s.ownership}
            </p>
            <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-2">{s.description}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {s.categories.slice(0, 3).map((c) => (
                <li key={c}>
                  <Badge tone="violet">{EQUIPMENT_CATEGORY[c]}</Badge>
                </li>
              ))}
              {s.categories.length > 3 && <li className="px-1 text-xs text-faint">+{s.categories.length - 3}</li>}
            </ul>
            <div className="mt-auto flex w-full items-center justify-between gap-2 border-t border-line-2 pt-3 text-xs text-muted">
              <span className="num">
                {s.products.length} product{s.products.length === 1 ? "" : "s"} in catalogue
              </span>
              <span className="inline-flex items-center gap-0.5 font-medium text-forest">
                View profile <ChevronRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SupplierProfileDrawer({
  supplier,
  onClose,
  compareIds,
  canAddMore,
  onToggleCompare,
  onRequestQuote,
}: {
  supplier: TechnologySupplier | null;
  onClose: () => void;
  compareIds: string[];
  canAddMore: boolean;
  onToggleCompare: (id: string, checked: boolean) => void;
  onRequestQuote: (productIds: string[]) => void;
}) {
  const s = supplier;
  return (
    <Drawer
      open={!!s}
      onClose={onClose}
      width="max-w-2xl"
      title={
        s && (
          <div>
            <div className="eyebrow">Manufacturer profile</div>
            <h2 className="mt-1 text-2xl leading-tight font-light text-ink">{s.companyName}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <VerificationPill status={s.verification} />
              <a href={s.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-forest hover:underline">
                {hostOf(s.website)} <ArrowUpRight className="size-3" aria-hidden />
              </a>
            </div>
          </div>
        )
      }
      footer={
        s && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {s.products.length ? "Quotation covers all catalogue products of this manufacturer." : "No catalogue products to quote yet."}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button size="sm" disabled={!s.products.length} onClick={() => onRequestQuote(s.products.map((p) => p.id))}>
                Request quotation
              </Button>
            </div>
          </div>
        )
      }
    >
      {s && (
        <div className="space-y-6">
          <Facts
            facts={[
              { label: "Headquarters", value: `${s.headquarters}, ${s.countryName}` },
              { label: "Ownership", value: s.ownership },
              { label: "Founded", value: s.founded != null ? <Estimate on={isEstimated(s, "founded")}>{s.founded}</Estimate> : <span className="text-faint">Undisclosed</span> },
              { label: "Manufacturing capacity", value: s.manufacturingCapacity ?? <span className="text-faint">Not publicly stated</span> },
            ]}
          />
          <div>
            <h3 className="mb-2 text-xs font-medium text-muted">Equipment categories</h3>
            <ul className="flex flex-wrap gap-1.5">
              {s.categories.map((c) => (
                <li key={c}>
                  <Badge tone="violet">{EQUIPMENT_CATEGORY[c]}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[15px] leading-relaxed text-ink-2">{s.description}</p>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-ink">
              Products <span className="num font-normal text-muted">({s.products.length})</span>
            </h3>
            {s.products.length === 0 ? (
              <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">No products from this manufacturer are in the catalogue yet.</p>
            ) : (
              <ul className="divide-y divide-line-2 rounded-card border border-line-2 bg-paper">
                {s.products.map((p) => {
                  const selected = compareIds.includes(p.id);
                  return (
                    <li key={p.id} className={cn("flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center", selected && "bg-mint-soft/40")}>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-ink">{p.model}</div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                          <span>{EQUIPMENT_CATEGORY[p.category]}</span>
                          <Figure value={fmtCapacity(p)} estimate={isEstimated(p, "capacity")} />
                          <Figure value={fmtEfficiency(p.efficiencyKwhPerKg)} estimate={isEstimated(p, "efficiencyKwhPerKg")} />
                          <span>{p.publicPrice ? "Public price" : "Quotation required"}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <CompareToggle checked={selected} disabled={!selected && !canAddMore} onChange={(v) => onToggleCompare(p.id, v)} label={`Compare ${p.model}`} />
                        <Button size="sm" variant="secondary" onClick={() => onRequestQuote([p.id])}>
                          Quote
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-faint">Specifications are manufacturer claims unless stated.</p>
          </section>

          <ProvenanceBlock record={s} />
        </div>
      )}
    </Drawer>
  );
}
