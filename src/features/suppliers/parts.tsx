/** Small presentational pieces shared across the supplier explorer (server-safe). */
import { Estimate } from "@/components/ui/Estimate";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import type { EquipmentProduct } from "@/domain/types";
import { hostOf } from "@/lib/format";
import { NOT_PUBLISHED, fmtPublicPrice } from "./model";

/** Price as published with its source, otherwise a "Quotation required" pill. */
export function PriceCell({ product, compact }: { product: EquipmentProduct; compact?: boolean }) {
  const price = fmtPublicPrice(product);
  if (!price || !product.publicPrice) return <Badge tone="neutral">Quotation required</Badge>;
  return (
    <div className="min-w-0">
      <div className="num font-medium text-ink">{price}</div>
      {!compact && <div className="text-[11px] leading-snug text-muted">{product.publicPrice.unit}</div>}
      <a
        href={product.publicPrice.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-[11px] text-forest hover:underline"
      >
        Public price · {hostOf(product.publicPrice.source.url)}
        <ArrowUpRight className="size-3" aria-hidden />
      </a>
    </div>
  );
}

export function VendorClaimLabel({ className }: { className?: string }) {
  return (
    <span title="Figures published by the manufacturer, not independently tested." className={cn("text-[11px] font-medium text-warn", className)}>
      Vendor claim
    </span>
  );
}

/** Value or a faint "Not published" placeholder. */
export function Figure({ value, className, estimate }: { value: string; className?: string; estimate?: boolean }) {
  const missing = value === NOT_PUBLISHED;
  return (
    <span className={cn(missing ? "text-faint" : "num text-ink", className)}>
      <Estimate on={estimate && !missing}>{value}</Estimate>
    </span>
  );
}

export function Facts({ facts, className }: { facts: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2", className)}>
      {facts.map((f) => (
        <div key={f.label} className="min-w-0 border-b border-line-2 pb-2.5">
          <dt className="text-xs text-muted">{f.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Native checkbox styled for "Add to compare". */
export function CompareToggle({
  checked,
  disabled,
  onChange,
  label,
  showText = true,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
  showText?: boolean;
}) {
  return (
    <label
      title={disabled ? "You can compare up to 4 products. Remove one first." : undefined}
      className={cn("inline-flex items-center gap-2 text-[13px] text-ink-2 select-none", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="size-4 rounded border-line accent-forest"
      />
      {showText && <span>Compare</span>}
    </label>
  );
}
