"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight, Award, Columns3, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/components/ui/cn";
import { hostOf } from "@/lib/format";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import {
  type CatalogueProduct,
  MAX_COMPARE,
  NOT_PUBLISHED,
  SPEC_BASIS,
  bestEfficiencyId,
  fmtCapacity,
  fmtEfficiency,
  fmtPressure,
  fmtSpec,
  specLabelUnion,
} from "./model";
import { Figure, PriceCell } from "./parts";

/** Sticky bar at the bottom of the catalogue listing the products picked for comparison. */
export function CompareTray({
  products,
  onRemove,
  onClear,
  onCompare,
  onRequestQuote,
}: {
  products: CatalogueProduct[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  onRequestQuote: () => void;
}) {
  if (products.length === 0) return null;
  const canCompare = products.length >= 2;
  return (
    <div className="no-print sticky bottom-4 z-30 mt-6">
      <div role="region" aria-label="Comparison tray" className="rounded-card border border-forest/20 bg-paper/95 p-3 shadow-float backdrop-blur md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex shrink-0 items-center gap-2 text-sm text-ink">
            <Columns3 className="size-4 text-forest" aria-hidden />
            <span className="font-medium">Compare</span>
            <span className="num text-muted">
              {products.length} of {MAX_COMPARE}
            </span>
          </div>
          <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {products.map((p) => (
              <li key={p.id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-paper-2 py-0.5 pr-1 pl-3 text-xs text-ink-2">
                <span className="truncate">
                  {p.model} <span className="text-faint">· {p.supplierName}</span>
                </span>
                <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.model} from comparison`} className="rounded-full p-0.5 text-faint hover:bg-stone hover:text-ink">
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            {!canCompare && <span className="text-xs text-muted">Select one more product to compare</span>}
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button variant="secondary" size="sm" onClick={onRequestQuote}>
              Request quotation
            </Button>
            <Button size="sm" onClick={onCompare} disabled={!canCompare}>
              Compare {products.length}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, sub }: { label: ReactNode; children: ReactNode; sub?: boolean }) {
  return (
    <tr className="border-b border-line-2 align-top">
      <th scope="row" className={cn("sticky left-0 z-10 w-48 min-w-48 bg-paper px-4 py-2.5 text-left text-xs font-medium", sub ? "text-muted" : "text-ink-2")}>
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return <td className={cn("min-w-[200px] px-4 py-2.5 text-[13px] text-ink-2", highlight && "bg-ok-soft")}>{children}</td>;
}

const dash = <span className="text-faint">—</span>;

/** Side-by-side specification table for 2–4 products. */
export function CompareDrawer({
  open,
  products,
  onClose,
  onRemove,
  onRequestQuote,
}: {
  open: boolean;
  products: CatalogueProduct[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onRequestQuote: () => void;
}) {
  const bestId = bestEfficiencyId(products);
  const labels = specLabelUnion(products);
  const categories = new Set(products.map((p) => p.category));
  const publishingEfficiency = products.filter((p) => p.efficiencyKwhPerKg != null && !isEstimated(p, "efficiencyKwhPerKg")).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="center"
      width="max-w-6xl"
      title={
        <div>
          <div className="eyebrow">Side-by-side comparison</div>
          <h2 className="mt-1 text-xl font-light text-ink">
            {products.length} product{products.length === 1 ? "" : "s"} compared
          </h2>
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted">
            Total cost of ownership comparison — planned
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={onRequestQuote} disabled={products.length === 0}>
              Request quotation for {products.length}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="flex items-start gap-2 rounded-btn border border-line-2 bg-paper-2 px-3 py-2 text-xs leading-relaxed text-ink-2">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden />
          <span>
            All figures are manufacturer claims taken from datasheets unless a row says otherwise. Datasheets use different test conditions and system
            boundaries, so treat differences as indicative.
            {publishingEfficiency < products.length && " Efficiency is only highlighted among products whose manufacturer publishes it."}
          </span>
        </p>
        {categories.size > 1 && (
          <p className="rounded-btn border border-warn/30 bg-warn-soft px-3 py-2 text-xs text-warn">
            You are comparing products from {categories.size} different categories. Capacity and efficiency are not directly comparable across categories.
          </p>
        )}
        <div className="scrollbar-thin overflow-x-auto rounded-card border border-line-2 bg-paper">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line-2 bg-paper-2 align-top">
                <th scope="col" className="sticky left-0 z-10 w-48 min-w-48 bg-paper-2 px-4 py-3 text-left text-xs font-medium text-muted">
                  Product
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className="min-w-[200px] px-4 py-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium text-ink">{p.model}</div>
                        <div className="text-xs font-normal text-muted">{p.supplierName}</div>
                      </div>
                      <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.model}`} className="rounded p-1 text-faint hover:bg-stone hover:text-ink">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Manufacturer">
                {products.map((p) => (
                  <Cell key={p.id}>{p.supplierName}</Cell>
                ))}
              </Row>
              <Row label="Technology / category">
                {products.map((p) => (
                  <Cell key={p.id}>{EQUIPMENT_CATEGORY[p.category]}</Cell>
                ))}
              </Row>
              <Row label="Rated capacity">
                {products.map((p) => (
                  <Cell key={p.id}>
                    <Figure value={fmtCapacity(p)} estimate={isEstimated(p, "capacity")} />
                    {p.capacity?.note && <div className="text-[11px] text-faint">{p.capacity.note}</div>}
                  </Cell>
                ))}
              </Row>
              <Row label="Efficiency (system, kWh/kg H₂)">
                {products.map((p) => {
                  const best = p.id === bestId;
                  return (
                    <Cell key={p.id} highlight={best}>
                      <Figure value={fmtEfficiency(p.efficiencyKwhPerKg)} estimate={isEstimated(p, "efficiencyKwhPerKg")} className={best ? "font-semibold text-ok" : undefined} />
                      {best && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-ok">
                          <Award className="size-3" aria-hidden /> Lowest published
                        </div>
                      )}
                    </Cell>
                  );
                })}
              </Row>
              <Row label="Output pressure">
                {products.map((p) => (
                  <Cell key={p.id}>
                    <Figure value={fmtPressure(p.outputPressureBar)} estimate={isEstimated(p, "outputPressureBar")} />
                  </Cell>
                ))}
              </Row>
              {labels.length > 0 && (
                <tr className="border-b border-line-2 bg-paper-2">
                  <th colSpan={products.length + 1} scope="colgroup" className="px-4 py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                    Datasheet specifications
                  </th>
                </tr>
              )}
              {labels.map((label) => (
                <Row key={label} label={label} sub>
                  {products.map((p) => {
                    const s = p.specs.find((x) => x.label === label);
                    return (
                      <Cell key={p.id}>
                        {s ? (
                          <>
                            <span className="text-ink">{fmtSpec(s)}</span>
                            {s.basis !== "vendor-claim" && <div className="text-[11px] text-info">{SPEC_BASIS[s.basis]}</div>}
                          </>
                        ) : (
                          dash
                        )}
                      </Cell>
                    );
                  })}
                </Row>
              ))}
              <Row label="Standards">
                {products.map((p) => (
                  <Cell key={p.id}>
                    {p.standards.length ? (
                      <ul className="space-y-0.5">
                        {p.standards.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-faint">None listed</span>
                    )}
                  </Cell>
                ))}
              </Row>
              <Row label="Warranty">
                {products.map((p) => (
                  <Cell key={p.id}>{p.warranty ? <Estimate on={isEstimated(p, "warranty")}>{p.warranty}</Estimate> : <span className="text-faint">{NOT_PUBLISHED}</span>}</Cell>
                ))}
              </Row>
              <Row label="Price availability">
                {products.map((p) => (
                  <Cell key={p.id}>
                    <PriceCell product={p} />
                  </Cell>
                ))}
              </Row>
              <Row label="Source">
                {products.map((p) => (
                  <Cell key={p.id}>
                    <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 text-forest hover:underline">
                      <span>
                        {p.source.title}
                        <span className="block text-[11px] text-muted">{hostOf(p.source.url)}</span>
                      </span>
                      <ArrowUpRight className="mt-0.5 size-3 shrink-0" aria-hidden />
                    </a>
                  </Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
}
