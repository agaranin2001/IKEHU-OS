import type { ReactNode } from "react";
import type { Tone } from "@/lib/labels";
import { cn } from "./cn";

const tones: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  neutral: "bg-stone text-ink-2",
};

export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Small label distinguishing demo data from sourced data. */
export function OriginTag({ origin, className }: { origin: "sourced" | "demo" | "preview" | "planned"; className?: string }) {
  const map = {
    sourced: { t: "Sourced data", c: "border-ok/30 text-ok" },
    demo: { t: "Demo data", c: "border-warn/40 text-warn" },
    preview: { t: "Product preview", c: "border-violet/30 text-violet" },
    planned: { t: "Planned feature", c: "border-line text-muted" },
  }[origin];
  return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", map.c, className)}>{map.t}</span>;
}
