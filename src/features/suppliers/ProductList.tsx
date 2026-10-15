"use client";

import { isEstimated } from "@/components/ui/Estimate";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { hostOf } from "@/lib/format";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import { type CatalogueProduct, fmtCapacity, fmtEfficiency, fmtPressure } from "./model";
import { CompareToggle, Figure, PriceCell, VendorClaimLabel } from "./parts";

export interface ProductListProps {
  products: CatalogueProduct[];
  compareIds: string[];
  canAddMore: boolean;
  onToggleCompare: (id: string, checked: boolean) => void;
  onRequestQuote: (product: CatalogueProduct) => void;
  onOpenSupplier: (supplierId: string) => void;
}

function SupplierButton({ product, onOpenSupplier }: { product: CatalogueProduct; onOpenSupplier: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpenSupplier(product.supplierId)}
      className="text-left text-ink-2 underline decoration-line underline-offset-2 hover:text-forest hover:decoration-forest"
    >
      {product.supplierName}
    </button>
  );
}

export function ProductCards({ products, compareIds, canAddMore, onToggleCompare, onRequestQuote, onOpenSupplier }: ProductListProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {products.map((p) => {
        const selected = compareIds.includes(p.id);
        return (
          <li
            key={p.id}
            className={cn(
              "flex flex-col rounded-card border bg-paper shadow-card transition-colors",
              selected ? "border-forest/50 ring-2 ring-forest/10" : "border-line-2",
            )}
          >
            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="violet">{EQUIPMENT_CATEGORY[p.category]}</Badge>
                <VendorClaimLabel />
              </div>
              <h3 className="mt-3 text-xl leading-tight font-light text-ink">{p.model}</h3>
              <p className="mt-1 text-sm">
                <SupplierButton product={p} onOpenSupplier={onOpenSupplier} />
              </p>
              <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">{p.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                <div>
                  <dt className="text-xs text-muted">Capacity</dt>
                  <dd className="mt-0.5">
                    <Figure value={fmtCapacity(p)} estimate={isEstimated(p, "capacity")} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Efficiency</dt>
                  <dd className="mt-0.5">
                    <Figure value={fmtEfficiency(p.efficiencyKwhPerKg)} estimate={isEstimated(p, "efficiencyKwhPerKg")} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Output pressure</dt>
                  <dd className="mt-0.5">
                    <Figure value={fmtPressure(p.outputPressureBar)} estimate={isEstimated(p, "outputPressureBar")} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Standards listed</dt>
                  <dd className="num mt-0.5 text-ink" title={p.standards.join(", ") || undefined}>
                    {p.standards.length || <span className="text-faint">None listed</span>}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 border-t border-line-2 pt-3">
                <div className="mb-1 text-xs text-muted">Price</div>
                <PriceCell product={p} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-2 px-5 py-3">
              <CompareToggle checked={selected} disabled={!selected && !canAddMore} onChange={(v) => onToggleCompare(p.id, v)} label={`Compare ${p.model}`} />
              <div className="flex items-center gap-1">
                <a
                  href={p.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-btn px-2 py-1.5 text-xs text-muted hover:bg-stone hover:text-forest"
                  title={p.source.title}
                >
                  {hostOf(p.source.url)}
                  <ArrowUpRight className="size-3" aria-hidden />
                </a>
                <Button size="sm" variant="secondary" onClick={() => onRequestQuote(p)}>
                  Request quotation
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
