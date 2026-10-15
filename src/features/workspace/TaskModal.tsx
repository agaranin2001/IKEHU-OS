"use client";

import { CalendarDays, ChevronDown, ChevronRight, ChevronUp, CircleDot, Flag, Hash, Layers, MessageSquare, User, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Fields";
import { cn } from "@/components/ui/cn";
import type { WorkspaceTask } from "@/domain/types";
import { fmtDate } from "@/lib/format";
import { dayDiff, relativeDays, TASK_STATUS, TASK_STATUSES, type TaskStatus } from "./model";

export interface TaskActivity {
  at: number;
  kind: "status" | "comment";
  text: string;
}

const timeFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Property({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3 py-1.5">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <span className="text-faint" aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * Full task view (ClickUp-style): breadcrumb + prev/next, title and properties
 * on the left, activity and comments on the right. Description, comments and
 * activity are kept by the parent for this session only.
 */
export function TaskModal({
  task,
  projectName,
  position,
  onPrev,
  onNext,
  onClose,
  onStatusChange,
  description,
  onDescriptionChange,
  activity,
  onComment,
}: {
  task: WorkspaceTask;
  projectName: string;
  position: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  onStatusChange: (status: TaskStatus) => void;
  description: string;
  onDescriptionChange: (text: string) => void;
  activity: TaskActivity[];
  onComment: (text: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const overdue = task.status !== "done" && dayDiff(task.due) < 0;

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submitComment = () => {
    const text = comment.trim();
    if (!text) return;
    onComment(text);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center p-3 md:p-6">
      <button aria-label="Close task" className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fade_.2s_ease-out]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={task.title}
        className="relative flex w-full max-w-[1280px] flex-col overflow-hidden rounded-card bg-paper shadow-float outline-none animate-[pop_.2s_ease-out]"
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-line-2 px-4 py-2.5">
          <div className="flex items-center">
            <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous task" className="grid size-8 place-items-center rounded-btn text-ink-2 hover:bg-paper-2 disabled:text-faint disabled:hover:bg-transparent">
              <ChevronUp className="size-4" />
            </button>
            <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next task" className="grid size-8 place-items-center rounded-btn text-ink-2 hover:bg-paper-2 disabled:text-faint disabled:hover:bg-transparent">
              <ChevronDown className="size-4" />
            </button>
          </div>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-ink-2">
            <span className="shrink-0">Workspace</span>
            <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden />
            <span className="truncate">{projectName}</span>
            <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden />
            <span className="shrink-0">{task.phase}</span>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="num hidden text-xs text-muted sm:inline">
              {task.id.toUpperCase()} · {position.index + 1} of {position.total}
            </span>
            <button type="button" onClick={onClose} aria-label="Close task" className="grid size-8 place-items-center rounded-btn text-ink-2 hover:bg-paper-2">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Task */}
          <div className="scrollbar-thin min-h-0 overflow-y-auto px-6 py-6 md:px-10">
            <span className="inline-flex items-center gap-1.5 rounded-btn border border-line px-2.5 py-1 text-xs text-ink-2">
              <CircleDot className="size-3.5" aria-hidden /> Task
            </span>
            <h2 className="mt-4 text-[28px] leading-tight font-normal tracking-[-0.01em] text-ink">{task.title}</h2>

            <dl className="mt-6 grid gap-x-10 md:grid-cols-2">
              <Property icon={<CircleDot className="size-4" />} label="Status">
                <SelectField
                  aria-label="Task status"
                  className="max-w-[200px]"
                  value={task.status}
                  onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
                  options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS[s].label }))}
                />
              </Property>
              <Property icon={<User className="size-4" />} label="Owner">
                {task.owner}
              </Property>
              <Property icon={<CalendarDays className="size-4" />} label="Due">
                <span className={cn("num", overdue && "font-medium text-bad")}>{fmtDate(task.due)}</span>
                <span className="ml-2 text-xs text-muted">{overdue ? `Overdue — ${relativeDays(task.due)}` : relativeDays(task.due)}</span>
              </Property>
              <Property icon={<Layers className="size-4" />} label="Phase">
                <span className="rounded bg-stone px-1.5 py-px text-ink-2">{task.phase}</span>
              </Property>
            </dl>

            <div className="mt-6 border-t border-line-2 pt-6">
              <label htmlFor={`desc-${task.id}`} className="sr-only">
                Description
              </label>
              <textarea
                id={`desc-${task.id}`}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Add a description…"
                rows={4}
                className="w-full resize-y rounded-btn border border-transparent bg-transparent px-0 py-1 text-[15px] leading-relaxed text-ink placeholder:text-faint hover:border-line hover:px-3 focus:border-forest focus:px-3 focus:ring-2 focus:ring-forest/15 focus:outline-none"
              />
            </div>

            <section className="mt-6">
              <button type="button" onClick={() => setFieldsOpen((v) => !v)} aria-expanded={fieldsOpen} className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <ChevronDown className={cn("size-4 transition-transform", !fieldsOpen && "-rotate-90")} aria-hidden /> Fields
              </button>
              {fieldsOpen && (
                <dl className="mt-3 divide-y divide-line-2 border-y border-line-2">
                  {[
                    { icon: <Hash className="size-4" />, label: "Task ID", value: task.id.toUpperCase() },
                    { icon: <Layers className="size-4" />, label: "Phase", value: task.phase },
                    { icon: <User className="size-4" />, label: "Owner", value: task.owner },
                    { icon: <CalendarDays className="size-4" />, label: "Due date", value: fmtDate(task.due) },
                    { icon: <Flag className="size-4" />, label: "Status", value: TASK_STATUS[task.status].label },
                  ].map((f) => (
                    <div key={f.label} className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-3 px-1 py-2.5 text-sm">
                      <dt className="flex items-center gap-2.5 text-ink-2">
                        <span className="text-faint" aria-hidden>
                          {f.icon}
                        </span>
                        {f.label}
                      </dt>
                      <dd className="num text-ink">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          </div>

          {/* Activity */}
          <aside aria-label="Activity" className="flex min-h-0 flex-col border-t border-line-2 bg-paper-2 lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between border-b border-line-2 px-5 py-3.5">
              <h3 className="text-[15px] font-semibold text-ink">Activity</h3>
              <span className="num text-xs text-muted">{activity.length}</span>
            </div>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {activity.length === 0 ? (
                <p className="py-6 text-center text-sm text-faint">No activity yet. Comments and status changes appear here.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((a, i) =>
                    a.kind === "comment" ? (
                      <li key={i} className="rounded-btn border border-line-2 bg-paper p-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted">
                          <span className="flex items-center gap-1.5 font-medium text-ink-2">
                            <MessageSquare className="size-3.5" aria-hidden /> You
                          </span>
                          <span className="num">{timeFmt.format(a.at)}</span>
                        </div>
                        <p className="mt-1.5 text-sm whitespace-pre-wrap text-ink">{a.text}</p>
                      </li>
                    ) : (
                      <li key={i} className="flex items-start justify-between gap-3 text-xs text-muted">
                        <span className="flex items-start gap-2">
                          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-faint" />
                          {a.text}
                        </span>
                        <span className="num shrink-0">{timeFmt.format(a.at)}</span>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
            <form
              className="border-t border-line-2 bg-paper p-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitComment();
              }}
            >
              <label htmlFor={`comment-${task.id}`} className="sr-only">
                Write a comment
              </label>
              <textarea
                id={`comment-${task.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder="Write a comment…"
                rows={2}
                className="w-full resize-none rounded-btn border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-faint">⌘↵ to send</span>
                <Button type="submit" size="sm" disabled={!comment.trim()}>
                  Comment
                </Button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
