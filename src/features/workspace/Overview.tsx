"use client";

import { ArrowRight, Check } from "lucide-react";
import { TopicTag } from "@/components/ui/TopicTag";
import { cn } from "@/components/ui/cn";
import { Panel } from "@/components/ui/Panel";
import type { WorkspaceTask } from "@/domain/types";
import { fmtDate, fmtEurCompact, fmtNum } from "@/lib/format";
import { budgetTotals, nextMilestone, phaseProgress, relativeDays, riskLevel, riskScore, RISK_LEVEL, sortRisks, type WorkspaceSnapshot } from "./model";

export type WorkspaceSection = "overview" | "tasks" | "budget" | "risks" | "documents" | "packages";

export function PhaseStepper({ tasks }: { tasks: WorkspaceTask[] }) {
  const phases = phaseProgress(tasks);
  return (
    <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0" aria-label="Project phases">
      {phases.map((p, i) => (
        <li key={p.phase} className="relative flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2 lg:pr-4" aria-current={p.state === "current" ? "step" : undefined}>
          <div className="flex w-auto items-center lg:w-full">
            <span
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                p.state === "done" && "border-forest bg-forest text-white",
                p.state === "current" && "border-violet bg-violet-soft text-violet ring-4 ring-violet/10",
                p.state === "upcoming" && "border-line bg-paper text-faint",
              )}
            >
              {p.state === "current" && <span aria-hidden className="phase-pulse pointer-events-none absolute -inset-px rounded-full" />}
              {p.state === "done" ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            {i < phases.length - 1 && <span aria-hidden className={cn("ml-2 hidden h-px flex-1 lg:block", p.state === "done" ? "bg-forest" : "bg-line")} />}
          </div>
          <div className="min-w-0">
            <div className={cn("text-sm", p.state === "upcoming" ? "text-muted" : "font-medium text-ink")}>{p.phase}</div>
            <div className="text-[11px] text-faint">
              {p.state === "current" ? <span className="font-medium text-violet">Current phase · </span> : p.state === "done" ? "Complete · " : ""}
              {p.total ? (
                <span className="num">
                  {p.done}/{p.total} tasks
                </span>
              ) : (
                "No tasks planned yet"
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-card border border-line-2 bg-paper p-4 shadow-card">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={cn("num mt-1.5 text-[26px] leading-tight font-light tracking-tight text-ink", accent)}>{value}</div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-faint">{hint}</div>}
    </div>
  );
}

export function Overview({ data, tasks, onNavigate }: { data: WorkspaceSnapshot; tasks: WorkspaceTask[]; onNavigate: (s: WorkspaceSection) => void }) {
  const totals = budgetTotals(data.budget);
  const done = tasks.filter((t) => t.status === "done").length;
  const blocked = tasks.filter((t) => t.status === "blocked");
  const risks = sortRisks(data.risks);
  const severe = risks.filter((r) => riskScore(r) >= 10);
  const next = nextMilestone(data.milestones);
  const atRisk = data.milestones.filter((m) => m.status === "at-risk");

  return (
    <div className="space-y-5">
      <Panel title="Project phase" subtitle="Derived from task status: a phase is complete when all its tasks are done.">
        <PhaseStepper tasks={tasks} />
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Budget (total)" value={fmtEurCompact(totals.budgetEur)} hint={`${data.budget.length} cost lines incl. contingency`} />
        <Kpi label="Committed" value={fmtEurCompact(totals.committedEur)} hint={`${fmtNum(totals.committedPct, 1)} % of budget`} />
        <Kpi
          label="Tasks done"
          value={
            <>
              {done}
              <span className="text-base text-muted"> / {tasks.length}</span>
            </>
          }
          hint={blocked.length ? `${blocked.length} blocked` : "None blocked"}
        />
        <Kpi label="Open risks" value={risks.length} hint={`${severe.length} rated high or critical`} />
        <Kpi
          label="Next milestone"
          value={<span className="text-[17px] leading-snug">{next ? next.title : "—"}</span>}
          hint={next ? `${fmtDate(next.date)} · ${relativeDays(next.date)}` : "No upcoming milestones"}
        />
      </div>

      <section aria-labelledby="attention-h">
        <h2 id="attention-h" className="mb-4 text-xl font-light text-ink">
          Needs attention
        </h2>
        {blocked.length + atRisk.length + severe.length === 0 ? (
          <p className="rounded-card bg-paper p-8 text-sm text-muted">Nothing flagged.</p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blocked.map((t) => (
              <AttentionCard
                key={t.id}
                tag="Blocked task"
                tagColor="var(--color-bad)"
                date={fmtDate(t.due)}
                title={t.title}
                meta={`${t.phase} · ${t.owner}`}
                cta="Open tasks"
                onOpen={() => onNavigate("tasks")}
              />
            ))}
            {atRisk.map((m) => (
              <AttentionCard
                key={m.id}
                tag="Milestone at risk"
                tagColor="var(--color-warn)"
                date={fmtDate(m.date)}
                title={m.title}
                meta={relativeDays(m.date)}
              />
            ))}
            {severe.map((r) => {
              const score = riskScore(r);
              const level = riskLevel(score);
              return (
                <AttentionCard
                  key={r.id}
                  tag={`${RISK_LEVEL[level].label} · ${score}`}
                  tagColor={level === "critical" ? "var(--color-bad)" : "var(--color-warn)"}
                  date={r.id.toUpperCase()}
                  title={r.title}
                  meta={`${r.category} · ${r.owner}`}
                  cta="Open risk matrix"
                  onOpen={() => onNavigate("risks")}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** "Needs attention" item in the R&D Library card style: chip + date, large title, action in the notched corner (omitted when there is nowhere to go). */
function AttentionCard({ tag, tagColor, date, title, meta, cta, onOpen }: { tag: string; tagColor: string; date: string; title: string; meta: string; cta?: string; onOpen?: () => void }) {
  const body = (
    <span className={cn("flex h-full min-h-[260px] flex-col rounded-card bg-paper p-8", onOpen && "notched transition-colors duration-300 group-hover:bg-paper-2")}>
      <span className="flex items-center justify-between gap-4">
        <TopicTag color={tagColor}>{tag}</TopicTag>
        <span className="text-[13px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">{date}</span>
      </span>
      <span className="mt-7 block text-[22px] leading-[1.3] text-ink">{title}</span>
      <span className="mt-2 block text-sm text-muted">{meta}</span>
      {cta && <span className="mt-auto block pt-10 text-[13px] font-medium tracking-[0.08em] text-forest uppercase">{cta}</span>}
    </span>
  );
  if (!onOpen) return <li className="h-full">{body}</li>;
  return (
    <li>
      <button type="button" onClick={onOpen} className="group relative block h-full w-full text-left">
        {body}
        <span className="notch-btn" aria-hidden>
          <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </button>
    </li>
  );
}
