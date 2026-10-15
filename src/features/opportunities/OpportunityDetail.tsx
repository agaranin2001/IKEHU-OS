/** Opportunity detail composition (server component; interactive parts are client islands). */
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowLeft, ArrowUpRight, CalendarClock, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ProvenanceBlock } from "@/components/ui/Sources";
import { OpportunityStatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { Opportunity } from "@/domain/types";
import { SNAPSHOT_DATE, fmtDate, hostOf } from "@/lib/format";
import { OPPORTUNITY_TYPE } from "@/lib/labels";
import { ApplicationChecklist } from "./ApplicationChecklist";
import { TenderReviewAssistant } from "./TenderReviewAssistant";
import { INACTIVE_LABEL, deadlineInfo, effectiveStatus, fmtBudget, isInactive } from "./model";

const toneText = { ok: "text-ok", warn: "text-warn", bad: "text-bad", info: "text-info", violet: "text-violet", neutral: "text-ink-2" } as const;

function Fact({ label, children, missing }: { label: string; children: ReactNode; missing?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("mt-1 text-sm break-words", missing ? "text-faint" : "text-ink")}>{children}</dd>
    </div>
  );
}

function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-sage" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function OpportunityDetail({ opportunity: o }: { opportunity: Opportunity }) {
  const status = effectiveStatus(o);
  const inactive = isInactive(status);
  const dl = deadlineInfo(o);
  const officialLink = (
    <a href={o.officialUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ size: "md" })}>
      Open official call page
    </a>
  );

  return (
    <>
      <PageHeader
        eyebrow={
          <ButtonLink href="/app/opportunities" variant="secondary" size="sm" className="rounded-full!">
            <ArrowLeft className="size-4" aria-hidden /> Opportunity Radar
          </ButtonLink>
        }
        title={o.title}
        description={`${o.organization}${o.programme ? ` · ${o.programme}` : ""}`}
        meta={
          <>
            <Badge tone="violet">{OPPORTUNITY_TYPE[o.type]}</Badge>
            <OpportunityStatusPill status={status} />
            <span className={cn("inline-flex items-center gap-1.5 text-sm", toneText[dl.tone])}>
              <CalendarClock className="size-4" aria-hidden />
              {dl.date && !inactive ? `${dl.label} · deadline ${dl.date}` : dl.label}
            </span>
            <span className="text-xs text-faint">Status as of {fmtDate(SNAPSHOT_DATE)} snapshot</span>
          </>
        }
        actions={officialLink}
      />
      <PageBody className="space-y-6">
        {inactive && (
          <p className="flex items-start gap-2 rounded-card border border-line-2 bg-paper-2 px-4 py-3 text-sm text-ink-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <span>
              {INACTIVE_LABEL[status as "closed" | "historical"]}. The details below describe the call as published and can help prepare for a future round.
            </span>
          </p>
        )}

        <Panel title="Key facts">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Organisation">{o.organization}</Fact>
            <Fact label="Programme" missing={!o.programme}>
              {o.programme || "Not stated"}
            </Fact>
            <Fact label="Published" missing={!o.publishedAt}>
              {o.publishedAt ? fmtDate(o.publishedAt) : "Not stated"}
            </Fact>
            <Fact label="Deadline" missing={!o.deadline}>
              {o.deadline ? <Estimate on={isEstimated(o, "deadline")}>{fmtDate(o.deadline)}</Estimate> : "Rolling / not stated"}
            </Fact>
            <Fact label="Total budget" missing={!o.budget}>
              <Estimate on={isEstimated(o, "budget")}>
                <span className="num">{fmtBudget(o.budget)}</span>
              </Estimate>
              {o.budget?.scope && <span className="block text-xs text-muted">{o.budget.scope}</span>}
            </Fact>
            <Fact label="Max per project" missing={!o.maxPerProject}>
              <span className="num">{fmtBudget(o.maxPerProject)}</span>
              {o.maxPerProject?.scope && <span className="block text-xs text-muted">{o.maxPerProject.scope}</span>}
            </Fact>
            <Fact label="Country / region">{o.countryName}</Fact>
            <Fact label="Official page">
              <a href={o.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-forest hover:underline">
                {hostOf(o.officialUrl)} <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </Fact>
          </dl>
          {o.technologies.length > 0 && (
            <div className="mt-5 border-t border-line-2 pt-4">
              <div className="mb-2 text-xs text-muted">Technologies in scope</div>
              <ul className="flex flex-wrap gap-1.5">
                {o.technologies.map((t) => (
                  <li key={t} className="rounded-md border border-line-2 bg-paper-2 px-2 py-0.5 text-xs text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            <Panel title="Summary">
              <p className="text-[15px] leading-relaxed text-ink-2">{o.summary}</p>
            </Panel>
            <Panel title="Requirements summary" subtitle="As recorded from the official call; the call documents prevail">
              <BulletList items={o.requirements} empty="No requirements are recorded. Check the official call documents." />
            </Panel>
            <Panel title="Eligibility" subtitle="Who can apply, as recorded">
              <BulletList items={o.eligibility} empty="No eligibility conditions are recorded. Check the official call documents." />
            </Panel>
            <TenderReviewAssistant opportunity={o} />
          </div>
          <aside className="min-w-0 space-y-6">
            <ApplicationChecklist opportunity={o} />
            <ProvenanceBlock record={o} />
          </aside>
        </div>
      </PageBody>
    </>
  );
}
