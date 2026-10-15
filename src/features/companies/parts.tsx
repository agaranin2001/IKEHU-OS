/** Presentational building blocks shared by list, deals and profile views (server-safe). */
import { Estimate } from "@/components/ui/Estimate";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import type { MoneyAmount } from "@/domain/types";
import { fmtMoney } from "@/lib/format";
import { DEAL_KIND, profileHref, type DealKind, type EntityRef } from "./model";

export function DealKindBadge({ kind }: { kind: DealKind }) {
  const k = DEAL_KIND[kind];
  return <Badge tone={k.tone}>{k.label}</Badge>;
}

/** Deal amount as published, or "Undisclosed" — never 0. */
export function DealAmount({ amount, estimated, className }: { amount: MoneyAmount | null; estimated?: boolean; className?: string }) {
  if (!amount) return <span className={cn("text-faint", className)}>Undisclosed</span>;
  if (estimated)
    return (
      <Estimate on className={cn("num", className)}>
        {fmtMoney(amount)}
      </Estimate>
    );
  return (
    <span className={cn("num text-ink", className)} title={amount.scope}>
      {fmtMoney(amount)}
      {amount.scope && <span className="block text-[11px] font-normal text-faint">{amount.scope}</span>}
    </span>
  );
}

export function TagList({ tags, max, className }: { tags: string[]; max?: number; className?: string }) {
  if (!tags.length) return <span className="text-sm text-faint">—</span>;
  const shown = max ? tags.slice(0, max) : tags;
  const rest = tags.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((t) => (
        <li key={t} className="rounded-md border border-line-2 bg-paper-2 px-2 py-0.5 text-xs text-ink-2">
          {t}
        </li>
      ))}
      {rest > 0 && <li className="px-1 py-0.5 text-xs text-faint">+{rest} more</li>}
    </ul>
  );
}

export function FactList({ facts, className }: { facts: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line-2", className)}>
      {facts.map((f) => (
        <div key={f.label} className="grid grid-cols-[minmax(96px,40%)_1fr] gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
          <dt className="text-muted">{f.label}</dt>
          <dd className="min-w-0 break-words text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Missing values render as "Not disclosed" in faint ink, never as 0. */
export const orMissing = (v: ReactNode | null | undefined, missing = "Not disclosed") =>
  v == null || v === "" ? <span className="text-faint">{missing}</span> : v;

export function EntityLink({ entity, className }: { entity: EntityRef; className?: string }) {
  return (
    <Link href={profileHref(entity.id)} className={cn("text-ink underline decoration-line underline-offset-2 hover:text-forest hover:decoration-forest", className)}>
      {entity.name}
    </Link>
  );
}
