"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Chip, Segmented } from "@/components/ui/Fields";
import { EmptyState } from "@/components/ui/States";
import type { WorkspaceTask } from "@/domain/types";
import { fmtDate } from "@/lib/format";
import { dayDiff, PHASES, TASK_STATUS, TASK_STATUSES, type TaskStatus } from "./model";
import { TaskModal, type TaskActivity } from "./TaskModal";

export interface TaskNotes {
  description: string;
  activity: TaskActivity[];
}

const isOverdue = (t: WorkspaceTask) => t.status !== "done" && dayDiff(t.due) < 0;

/**
 * Minimum height that takes an element from its top down to the bottom of the visible
 * scroll area (the app content panel on desktop, the window on mobile), less `gap`.
 */
function useFillHeight(ref: RefObject<HTMLElement | null>, gap: number) {
  const [minHeight, setMinHeight] = useState<number>();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const panel = document.getElementById("app-content");
    const root = panel && getComputedStyle(panel).overflowY !== "visible" ? panel : null;
    const measure = () => {
      const rootTop = root ? root.getBoundingClientRect().top + root.clientTop : 0;
      const scrolled = root ? root.scrollTop : window.scrollY;
      const top = el.getBoundingClientRect().top - rootTop + scrolled;
      const viewport = root ? root.clientHeight : window.innerHeight;
      setMinHeight(Math.max(0, Math.floor(viewport - top - gap)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root ?? document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, gap]);
  return minHeight;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const s = TASK_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function Tasks({
  tasks,
  onStatusChange,
  edited,
  onReset,
  projectName,
  notes,
  onNotesChange,
}: {
  tasks: WorkspaceTask[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  edited: boolean;
  onReset: () => void;
  projectName: string;
  /** Per-task description and activity, kept by the workspace for this session. */
  notes: Record<string, TaskNotes>;
  onNotesChange: (id: string, update: (n: TaskNotes) => TaskNotes) => void;
}) {
  const [view, setView] = useState<"board" | "table">("board");
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  // Board drag & drop: dropping a card on a column sets its status.
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const endDrag = () => {
    setDragId(null);
    setOverCol(null);
  };
  const boardRef = useRef<HTMLDivElement>(null);
  // Columns run to the bottom of the screen: page bottom padding (24) + scroller padding (8).
  const boardMinHeight = useFillHeight(boardRef, 32);
  const open = tasks.find((t) => t.id === openId) ?? null;
  const changeStatus = (id: string, status: TaskStatus) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    onStatusChange(id, status);
    onNotesChange(id, (n) => ({ ...n, activity: [...n.activity, { at: Date.now(), kind: "status", text: `Status changed from ${TASK_STATUS[t.status].label} to ${TASK_STATUS[status].label}` }] }));
  };

  const visible = tasks.filter((t) => !statuses.length || statuses.includes(t.status));
  const visibleIndex = (id: string) => visible.findIndex((t) => t.id === id);
  const columns = TASK_STATUSES.filter((s) => !statuses.length || statuses.includes(s));
  const toggle = (s: TaskStatus) => setStatuses((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0" role="group" aria-label="Filter by status">
          {TASK_STATUSES.map((s) => (
            <Chip key={s} active={statuses.includes(s)} onClick={() => toggle(s)} count={tasks.filter((t) => t.status === s).length}>
              {TASK_STATUS[s].label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {edited && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset demo changes
            </Button>
          )}
          <Segmented
            size="sm"
            label="Task view"
            value={view}
            onChange={setView}
            options={[
              { value: "board", label: "Board" },
              { value: "table", label: "By phase" },
            ]}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No tasks with this status"
          action={
            <Button variant="secondary" size="sm" onClick={() => setStatuses([])}>
              Show all tasks
            </Button>
          }
        />
      ) : view === "board" ? (
        <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          <div ref={boardRef} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, minWidth: columns.length * 220, minHeight: boardMinHeight }}>
            {columns.map((s) => {
              const col = visible.filter((t) => t.status === s);
              return (
                <section
                  key={s}
                  aria-label={TASK_STATUS[s].label}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (overCol !== s) setOverCol(s);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverCol((c) => (c === s ? null : c));
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) changeStatus(id, s);
                    endDrag();
                  }}
                  className={cn(
                    "flex flex-col rounded-card border border-line-2 bg-paper-2 p-2.5 transition-colors",
                    overCol === s && dragId && "border-forest/40 bg-mint-soft/60",
                  )}
                >
                  <header className="flex items-center justify-between px-1.5 pt-0.5 pb-2.5">
                    <StatusBadge status={s} />
                    <span className="num text-xs text-faint">{col.length}</span>
                  </header>
                  <ul className="space-y-2">
                    {col.map((t) => (
                      <li
                        key={t.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", t.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(t.id);
                        }}
                        onDragEnd={endDrag}
                        className={cn("cursor-grab active:cursor-grabbing", dragId === t.id && "opacity-40")}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(t.id)}
                          className="w-full cursor-[inherit] rounded-btn border border-line-2 bg-paper p-3 text-left shadow-card transition-colors hover:border-sage"
                        >
                          <div className="text-sm leading-snug text-ink">{t.title}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                            <span className="rounded bg-stone px-1.5 py-px text-ink-2">{t.phase}</span>
                            <span>{t.owner}</span>
                            <span className={cn("num", isOverdue(t) && "font-medium text-bad")}>
                              {isOverdue(t) ? "Overdue · " : ""}
                              {fmtDate(t.due)}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                    {col.length === 0 && <li className="rounded-btn border border-dashed border-line px-3 py-6 text-center text-xs text-faint">No tasks</li>}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line-2 bg-paper shadow-card">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-paper-2 text-xs text-muted">
                <tr className="border-b border-line-2">
                  <th scope="col" className="px-4 py-2.5 font-medium">Task</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Owner</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Due</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              {PHASES.map((phase) => {
                const rows = visible.filter((t) => t.phase === phase);
                if (!rows.length) return null;
                return (
                  <tbody key={phase}>
                    <tr className="border-b border-line-2 bg-paper-2/60">
                      <th scope="rowgroup" colSpan={4} className="px-4 py-2 text-xs font-semibold text-ink-2">
                        {phase} <span className="num font-normal text-faint">· {rows.length}</span>
                      </th>
                    </tr>
                    {rows.map((t) => (
                      <tr key={t.id} className="border-b border-line-2 hover:bg-paper-2">
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => setOpenId(t.id)} className="text-left text-ink hover:text-forest">
                            {t.title}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-ink-2">{t.owner}</td>
                        <td className={cn("num px-4 py-2.5", isOverdue(t) ? "font-medium text-bad" : "text-ink-2")}>
                          {fmtDate(t.due)}
                          {isOverdue(t) && <span className="block text-[11px] font-normal">Overdue</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
      )}

      {open && (
        <TaskModal
          task={open}
          projectName={projectName}
          position={{ index: Math.max(0, visible.findIndex((t) => t.id === open.id)), total: visible.length }}
          onPrev={visibleIndex(open.id) > 0 ? () => setOpenId(visible[visibleIndex(open.id) - 1].id) : undefined}
          onNext={visibleIndex(open.id) >= 0 && visibleIndex(open.id) < visible.length - 1 ? () => setOpenId(visible[visibleIndex(open.id) + 1].id) : undefined}
          onClose={() => setOpenId(null)}
          onStatusChange={(st) => changeStatus(open.id, st)}
          description={notes[open.id]?.description ?? ""}
          onDescriptionChange={(text) => onNotesChange(open.id, (n) => ({ ...n, description: text }))}
          activity={notes[open.id]?.activity ?? []}
          onComment={(text) => onNotesChange(open.id, (n) => ({ ...n, activity: [...n.activity, { at: Date.now(), kind: "comment", text }] }))}
        />
      )}
    </div>
  );
}
