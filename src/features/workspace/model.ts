/** Pure helpers for the Project Workspace preview (demo data only). */
import type { WorkspaceMilestone, WorkspaceRisk, WorkspaceTask } from "@/domain/types";
import type { Tone } from "@/lib/labels";
import { SNAPSHOT_DATE } from "@/lib/format";
import type { WorkspaceRepository } from "@/services";

export type WorkspaceSnapshot = Awaited<ReturnType<WorkspaceRepository["snapshot"]>>;
export type Phase = WorkspaceTask["phase"];
export type TaskStatus = WorkspaceTask["status"];

export const PHASES: Phase[] = ["Feasibility", "Pre-FEED", "FEED", "Procurement", "Construction", "Commissioning"];

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: Tone }> = {
  todo: { label: "To do", tone: "neutral" },
  "in-progress": { label: "In progress", tone: "info" },
  blocked: { label: "Blocked", tone: "bad" },
  done: { label: "Done", tone: "ok" },
};
export const TASK_STATUSES = Object.keys(TASK_STATUS) as TaskStatus[];

export type PhaseState = "done" | "current" | "upcoming";

/**
 * Phase progress from task status: phases whose tasks are all done are
 * complete; the first phase with open work is current; the rest upcoming.
 */
export function phaseProgress(tasks: WorkspaceTask[]): { phase: Phase; state: PhaseState; done: number; total: number }[] {
  const current = PHASES.find((p) => tasks.some((t) => t.phase === p && t.status !== "done")) ?? null;
  const currentIdx = current ? PHASES.indexOf(current) : PHASES.length;
  return PHASES.map((phase, i) => {
    const ts = tasks.filter((t) => t.phase === phase);
    return {
      phase,
      state: i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming",
      done: ts.filter((t) => t.status === "done").length,
      total: ts.length,
    };
  });
}

export const riskScore = (r: Pick<WorkspaceRisk, "likelihood" | "impact">) => r.likelihood * r.impact;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_LEVEL: Record<RiskLevel, { label: string; tone: Tone; cell: string; range: string }> = {
  low: { label: "Low", tone: "ok", cell: "bg-ok-soft", range: "1–4" },
  medium: { label: "Medium", tone: "info", cell: "bg-[#eef3d9]", range: "5–9" },
  high: { label: "High", tone: "warn", cell: "bg-warn-soft", range: "10–14" },
  critical: { label: "Critical", tone: "bad", cell: "bg-bad-soft", range: "15–25" },
};

export function riskLevel(score: number): RiskLevel {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
}

export const sortRisks = (risks: WorkspaceRisk[]) => [...risks].sort((a, b) => riskScore(b) - riskScore(a) || b.impact - a.impact || a.id.localeCompare(b.id));

export function nextMilestone(ms: WorkspaceMilestone[], today = SNAPSHOT_DATE) {
  return [...ms].filter((m) => m.status !== "done" && m.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
}

export function budgetTotals<T extends { budgetEur: number; committedEur: number }>(budget: T[]) {
  const budgetEur = budget.reduce((a, b) => a + b.budgetEur, 0);
  const committedEur = budget.reduce((a, b) => a + b.committedEur, 0);
  return { budgetEur, committedEur, committedPct: budgetEur > 0 ? (committedEur / budgetEur) * 100 : 0 };
}

/** "in 12 days" / "3 days ago" / "today", relative to the snapshot date. */
export const dayDiff = (iso: string, from = SNAPSHOT_DATE) => Math.round((Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);

export function relativeDays(iso: string) {
  const d = dayDiff(iso);
  if (!Number.isFinite(d)) return "";
  if (d === 0) return "today";
  if (d > 0) return `in ${d} day${d === 1 ? "" : "s"}`;
  return `${-d} day${d === -1 ? "" : "s"} ago`;
}
