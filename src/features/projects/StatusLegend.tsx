import type { ProjectStatus } from "@/domain/types";
import { cn } from "@/components/ui/cn";
import { PROJECT_STATUS } from "@/lib/labels";
import { STATUS_ORDER } from "./model";

/**
 * Methodology definitions — how a record's status is assigned. These describe
 * the classification rule, not any project's data.
 */
export const STATUS_DEFINITIONS: Record<ProjectStatus, string> = {
  announced: "Publicly announced by the developer. Site, partners, financing or permits are not yet documented.",
  planned: "Development documented — e.g. site secured, permitting, FEED or offtake agreements — but construction has not started.",
  "under-construction": "Construction or equipment installation is under way at the site.",
  operational: "Producing hydrogen, including phased start-up or commissioning reported by the developer.",
  delayed: "The developer or reliable reporting indicates the schedule slipped or work is paused. Not cancelled.",
  cancelled: "Withdrawn or terminated by the developer. Excluded from pipeline capacity totals.",
};

export const FID_DEFINITION =
  "Final investment decision: financing is committed. Tracked as a separate flag, not a status — a project can be planned or under construction with FID taken.";

export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full", className)} style={{ background: PROJECT_STATUS[status].color }} />;
}

/**
 * Status legend.
 * - `variant="inline"`: compact coloured dots with labels (map legends), optional counts.
 * - `variant="definitions"`: each status with its meaning, plus the FID rule.
 */
export function StatusLegend({
  variant = "definitions",
  highlight,
  counts,
  showFid = true,
  className,
}: {
  variant?: "inline" | "definitions";
  highlight?: ProjectStatus;
  counts?: Partial<Record<ProjectStatus, number>>;
  showFid?: boolean;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2", className)} aria-label="Project status legend">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center gap-1.5" title={STATUS_DEFINITIONS[s]}>
            <StatusDot status={s} className="size-2" />
            {PROJECT_STATUS[s].label}
            {counts && <span className="num text-faint">{counts[s] ?? 0}</span>}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <dl className={cn("space-y-1", className)}>
      {STATUS_ORDER.map((s) => (
        <div
          key={s}
          className={cn("grid grid-cols-[16px_1fr] gap-x-2 rounded-btn px-2 py-2", highlight === s ? "bg-paper-2 ring-1 ring-line" : "", highlight && highlight !== s && "opacity-70")}
          aria-current={highlight === s ? "true" : undefined}
        >
          <StatusDot status={s} className="mt-1" />
          <div>
            <dt className="text-[13px] font-semibold text-ink">
              {PROJECT_STATUS[s].label}
              {highlight === s && <span className="ml-2 text-[11px] font-medium text-muted">This project</span>}
            </dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-muted">{STATUS_DEFINITIONS[s]}</dd>
          </div>
        </div>
      ))}
      {showFid && (
        <div className="grid grid-cols-[16px_1fr] gap-x-2 border-t border-line-2 px-2 pt-3 mt-2">
          <span aria-hidden className="mt-1 inline-block size-2.5 rounded-sm border-2 border-forest" />
          <div>
            <dt className="text-[13px] font-semibold text-ink">FID taken</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-muted">{FID_DEFINITION}</dd>
          </div>
        </div>
      )}
    </dl>
  );
}
