import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { RecordProvenance, SourceRef } from "@/domain/types";
import { fmtDate, hostOf } from "@/lib/format";
import { VerificationPill } from "./StatusPill";
import { cn } from "./cn";

export function SourceLink({ source, className }: { source: SourceRef; className?: string }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className={cn("group flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-ink/[0.04]", className)}>
      <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-faint group-hover:text-forest" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm text-ink group-hover:text-forest">{source.title}</span>
        <span className="block text-xs text-muted">
          {source.publisher} · {hostOf(source.url)}
          {source.publishedAt ? ` · ${fmtDate(source.publishedAt)}` : ""}
        </span>
      </span>
    </a>
  );
}

/** Provenance block: verification status, last verified date and source links. */
export function ProvenanceBlock({ record, className }: { record: RecordProvenance; className?: string }) {
  return (
    <div className={cn("rounded-card border border-ok/15 bg-ok-soft p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="size-4 text-forest" aria-hidden />
        <span className="text-sm font-semibold text-ink">Sources & verification</span>
        <VerificationPill status={record.verification} className="ring-1 ring-current/20 ring-inset" />
        <span className="text-xs text-muted">Confidence: {record.confidence}</span>
      </div>
      <p className="mt-1 text-xs text-muted">Last verified {fmtDate(record.verifiedAt)}</p>
      <div className="mt-3 space-y-0.5">
        {record.sources.map((s) => (
          <SourceLink key={s.url} source={s} />
        ))}
      </div>
      {record.notes && <p className="mt-3 border-t border-ok/15 pt-3 text-xs leading-relaxed text-ink-2">{record.notes}</p>}
    </div>
  );
}

/** Inline dataset footnote shown beside every aggregate metric. */
export function DatasetNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] leading-snug text-faint", className)}>{children}</p>;
}
