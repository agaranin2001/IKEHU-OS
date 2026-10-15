import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Marks a value that was filled in as an estimate (see lib/estimates.ts):
 * slightly lighter text with a dotted underline and an "Estimate" tooltip.
 * Renders children unchanged when `on` is false.
 */
export function Estimate({ on, children, className }: { on: boolean | undefined; children: ReactNode; className?: string }) {
  if (!on) return <>{children}</>;
  return (
    <span title="Estimate" className={cn("cursor-help text-ink-2 underline decoration-faint decoration-dotted underline-offset-[3px]", className)}>
      {children}
    </span>
  );
}

/** True when `field` of `record` is an estimate rather than a sourced value. */
export const isEstimated = (record: { estimated?: readonly string[] } | null | undefined, field: string) => !!record?.estimated?.includes(field);
