import { CalendarClock, ChevronRight, Coins, MapPin, type LucideIcon } from "lucide-react";
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { OpportunityStatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { Opportunity } from "@/domain/types";
import { OPPORTUNITY_TYPE } from "@/lib/labels";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { INACTIVE_LABEL, deadlineInfo, effectiveStatus, fmtBudget, isInactive } from "./model";

const toneText = { ok: "text-ok", warn: "text-warn", bad: "text-bad", info: "text-info", violet: "text-violet", neutral: "text-ink-2" } as const;

/** One fact tile (deadline, budget, country) on the card. */
function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-btn border border-line-2 bg-paper-2 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden />
      <div className="min-w-0">
        <dt className="text-[11px] text-muted">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  );
}

export function OpportunityCard({ opportunity: o }: { opportunity: Opportunity }) {
  const status = effectiveStatus(o);
  const inactive = isInactive(status);
  const dl = deadlineInfo(o);
  const techShown = o.technologies.slice(0, 4);

  return (
    <li>
      <Link
        href={`/app/opportunities/${o.id}`}
        className={cn(
          "group block rounded-card border p-5 shadow-card transition-colors",
          inactive ? "border-line-2 bg-paper-2 hover:border-line" : "border-line-2 bg-paper hover:border-sage",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={inactive ? "neutral" : "violet"}>{OPPORTUNITY_TYPE[o.type]}</Badge>
            <OpportunityStatusPill status={status} />
            {inactive && <span className="text-xs text-muted">{INACTIVE_LABEL[status as "closed" | "historical"]}</span>}
          </div>
          {/* Countdown sits in the card's top-right corner */}
          {!inactive && o.deadline && !isEstimated(o, "deadline") && dl.days != null && dl.days >= 0 && <DeadlineCountdown deadline={o.deadline} tone={dl.tone} />}
        </div>

        <div className="mt-3 min-w-0">
          <h3 className={cn("text-lg leading-snug font-normal group-hover:text-forest", inactive ? "text-ink-2" : "text-ink")}>{o.title}</h3>
          <p className="mt-1 text-[13px] text-muted">
            {o.organization}
            {o.programme && <> · {o.programme}</>}
          </p>
        </div>

        <dl className={cn("mt-4 grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-3", inactive && "opacity-80")}>
          <Fact icon={CalendarClock} label="Deadline">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <Estimate on={isEstimated(o, "deadline")}>
                <span className={cn(inactive ? "text-muted" : "text-ink")}>{dl.date && !inactive ? dl.date : dl.label}</span>
              </Estimate>
              {dl.date && !inactive && <span className={cn("text-xs", toneText[dl.tone])}>{dl.label}</span>}
            </div>
          </Fact>
          <Fact icon={Coins} label="Total budget">
            <div className={cn("num", o.budget ? "text-ink" : "text-faint")} title={o.budget?.scope}>
              <Estimate on={isEstimated(o, "budget")}>{fmtBudget(o.budget)}</Estimate>
            </div>
          </Fact>
          <Fact icon={MapPin} label="Country">
            <div className="text-ink-2">{o.countryName}</div>
          </Fact>
        </dl>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line-2 pt-3">
          {techShown.length ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
              {techShown.map((t) => (
                <li key={t} className="rounded-md border border-line-2 bg-paper-2 px-2 py-0.5 text-xs text-ink-2">
                  {t}
                </li>
              ))}
              {o.technologies.length > techShown.length && <li className="px-1 py-0.5 text-xs text-faint">+{o.technologies.length - techShown.length}</li>}
            </ul>
          ) : (
            <span className="text-xs text-faint">No technology scope recorded</span>
          )}
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-forest">
            Details <ChevronRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}
