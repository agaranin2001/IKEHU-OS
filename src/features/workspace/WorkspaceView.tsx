"use client";

import { FileText, LayoutDashboard, ListChecks, Package, Plus, ShieldAlert, Wallet, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Segmented } from "@/components/ui/Fields";
import { LoadingRows, ResourceView, Skeleton } from "@/components/ui/States";
import { useResource } from "@/hooks/useResource";
import { SNAPSHOT_DATE } from "@/lib/format";
import { services } from "@/services";
import type { WorkspaceTask } from "@/domain/types";
import { phaseProgress, type TaskStatus, type WorkspaceSnapshot } from "./model";
import { AddItemDialog, type AddField } from "./AddItemDialog";
import { NewTaskDialog } from "./NewTaskDialog";
import { Overview, type WorkspaceSection } from "./Overview";
import { Budget, Documents, Packages, Risks } from "./Sections";
import { Tasks, type TaskNotes } from "./Tasks";

const SECTIONS: { value: WorkspaceSection; label: string; icon: LucideIcon }[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "tasks", label: "Tasks", icon: ListChecks },
  { value: "budget", label: "Budget", icon: Wallet },
  { value: "risks", label: "Risks", icon: ShieldAlert },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "packages", label: "Suppliers & packages", icon: Package },
];

function WorkspaceSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading workspace">
      <Skeleton className="h-28 w-full rounded-card" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-card" />
        ))}
      </div>
      <LoadingRows rows={4} />
    </div>
  );
}

/** `/app/workspace`: full-height section sidebar on the left; the project name is the page title. */
export function WorkspaceView() {
  const res = useResource("workspace:snapshot", () => services.workspace.snapshot());
  if (res.data && res.status !== "error") return <Workspace data={res.data} />;
  return (
    <>
      <PageHeader title={<Skeleton className="h-9 w-80 max-w-full" />} />
      <PageBody>
        <ResourceView resource={res} loading={<WorkspaceSkeleton />}>
          {() => null}
        </ResourceView>
      </PageBody>
    </>
  );
}

function Workspace({ data }: { data: WorkspaceSnapshot }) {
  const [section, setSection] = useState<WorkspaceSection>("overview");
  const [overrides, setOverrides] = useState<Record<string, TaskStatus>>({});
  // Tasks created in this session (demo workspace: nothing is persisted).
  const [added, setAdded] = useState<WorkspaceTask[]>([]);
  const [creating, setCreating] = useState(false);
  const [taskNotes, setTaskNotes] = useState<Record<string, TaskNotes>>({});
  const [extra, setExtra] = useState<{ risks: Snapshot["risks"]; budget: Snapshot["budget"]; documents: Snapshot["documents"]; suppliers: Snapshot["suppliers"] }>({
    risks: [],
    budget: [],
    documents: [],
    suppliers: [],
  });
  const [adding, setAdding] = useState<AddKind | null>(null);
  const risks = useMemo(() => [...data.risks, ...extra.risks], [data.risks, extra.risks]);
  const budget = useMemo(() => [...data.budget, ...extra.budget], [data.budget, extra.budget]);
  const documents = useMemo(() => [...data.documents, ...extra.documents], [data.documents, extra.documents]);
  const suppliers = useMemo(() => [...data.suppliers, ...extra.suppliers], [data.suppliers, extra.suppliers]);
  const tasks = useMemo(() => [...data.tasks, ...added].map((t) => (overrides[t.id] ? { ...t, status: overrides[t.id] } : t)), [data.tasks, added, overrides]);
  const edited = added.length > 0 || Object.keys(overrides).some((id) => data.tasks.find((t) => t.id === id)?.status !== overrides[id]);
  const owners = useMemo(() => [...new Set(tasks.map((t) => t.owner))].sort((a, b) => a.localeCompare(b)), [tasks]);
  const currentPhase = phaseProgress(tasks).find((p) => p.state === "current")?.phase ?? "Feasibility";

  const counts: Partial<Record<WorkspaceSection, number>> = {
    tasks: tasks.length,
    risks: risks.length,
    documents: documents.length,
    packages: suppliers.length,
  };

  // The header action follows the view: tasks on Overview/Tasks, otherwise that view's own item.
  const addKind: AddKind | null = section === "budget" || section === "risks" || section === "documents" || section === "packages" ? section : null;

  const go = (s: WorkspaceSection) => {
    setSection(s);
    if (typeof window !== "undefined") {
      // Desktop scrolls inside the app content panel; mobile scrolls the window.
      document.getElementById("app-content")?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="lg:flex lg:items-start">
      {/* Section sidebar: flush with the panel edge, full height, pinned while the content scrolls */}
      <nav
        aria-label="Project views"
        className="scrollbar-thin hidden w-[248px] shrink-0 overflow-y-auto border-r border-line bg-paper-2 px-3 py-4 lg:sticky lg:top-0 lg:block lg:h-[calc(100dvh-74px)]"
      >
        <div className="px-2.5 pb-3 text-[11px] font-medium tracking-[0.06em] text-muted uppercase">Workspace</div>
        <ul className="space-y-0.5">
          {SECTIONS.map(({ value, label, icon: Icon }) => {
            const active = value === section;
            const count = counts[value];
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => go(value)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-btn px-2.5 py-2 text-left text-sm transition-colors",
                    active ? "bg-mint-soft font-medium text-forest" : "text-ink-2 hover:bg-stone/70 hover:text-ink",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-forest" : "text-muted")} aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {count != null && <span className="num text-xs text-faint">{count}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        <PageHeader
          title={data.projectName}
          actions={
            <Button size="md" onClick={() => (addKind ? setAdding(addKind) : setCreating(true))} aria-haspopup="dialog">
              <Plus className="size-4" aria-hidden /> {addKind ? ADD[addKind].button : "Create new task"}
            </Button>
          }
        />
        <PageBody className="space-y-5">
          <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0 lg:hidden">
            <Segmented label="Workspace sections" value={section} onChange={setSection} options={SECTIONS.map(({ value, label }) => ({ value, label }))} />
          </div>
          <div role="tabpanel" aria-label={SECTIONS.find((s) => s.value === section)?.label}>
            {section === "overview" && <Overview data={data} tasks={tasks} onNavigate={go} />}
            {section === "tasks" && (
              <Tasks
                tasks={tasks}
                edited={edited}
                onReset={() => {
                  setOverrides({});
                  setAdded([]);
                }}
                onStatusChange={(id, status) => setOverrides((o) => ({ ...o, [id]: status }))}
                projectName={data.projectName}
                notes={taskNotes}
                onNotesChange={(id, update) => setTaskNotes((all) => ({ ...all, [id]: update(all[id] ?? { description: "", activity: [] }) }))}
              />
            )}
            {section === "budget" && <Budget budget={budget} />}
            {section === "risks" && <Risks risks={risks} />}
            {section === "documents" && <Documents documents={documents} />}
            {section === "packages" && <Packages suppliers={suppliers} />}
          </div>
        </PageBody>
      </div>

      <NewTaskDialog
        open={creating}
        owners={owners}
        defaultPhase={currentPhase}
        onClose={() => setCreating(false)}
        onCreate={(t) => {
          setAdded((list) => [...list, { ...t, id: `new-${Date.now()}` }]);
          setCreating(false);
          go("tasks");
        }}
      />
      {adding && (
        <AddItemDialog
          key={adding}
          open
          title={ADD[adding].title}
          submitLabel={ADD[adding].submit}
          fields={ADD[adding].fields}
          onClose={() => setAdding(null)}
          onCreate={(v) => {
            const id = `new-${Date.now()}`;
            if (adding === "risks")
              setExtra((e) => ({
                ...e,
                risks: [
                  ...e.risks,
                  { id, title: v.title, category: v.category, likelihood: Number(v.likelihood) as Score, impact: Number(v.impact) as Score, mitigation: v.mitigation, owner: v.owner },
                ],
              }));
            else if (adding === "budget")
              setExtra((e) => ({
                ...e,
                budget: [
                  ...e.budget,
                  {
                    line: v.line,
                    budgetEur: Number(v.budgetEur),
                    committedEur: 0,
                    suppliers: [],
                    deadline: { date: v.deadline, label: v.deadlineLabel },
                    items: [{ item: v.line, budgetEur: Number(v.budgetEur), committedEur: 0 }],
                  },
                ],
              }));
            else if (adding === "documents")
              setExtra((e) => ({ ...e, documents: [...e.documents, { id, title: v.title, type: v.type, updated: SNAPSHOT_DATE, status: v.status }] }));
            else setExtra((e) => ({ ...e, suppliers: [...e.suppliers, { name: v.name, scope: v.scope, status: v.status }] }));
            setAdding(null);
          }}
        />
      )}
    </div>
  );
}

type Snapshot = WorkspaceSnapshot;
type AddKind = "budget" | "risks" | "documents" | "packages";
type Score = Snapshot["risks"][number]["likelihood"];

const SCALE = ["1", "2", "3", "4", "5"];

/** Header action per workspace view (session-only additions, like new tasks). */
const ADD: Record<AddKind, { button: string; title: string; submit: string; fields: AddField[] }> = {
  budget: {
    button: "Add cost line",
    title: "Add cost line",
    submit: "Add line",
    fields: [
      { key: "line", label: "Cost line", placeholder: "e.g. Compression & storage", wide: true },
      { key: "budgetEur", label: "Budget (€)", type: "number", placeholder: "e.g. 2500000" },
      { key: "deadline", label: "Next commitment date", type: "date" },
      { key: "deadlineLabel", label: "Commitment", placeholder: "e.g. Award compressor package", wide: true },
    ],
  },
  risks: {
    button: "Add risk",
    title: "Add risk",
    submit: "Add risk",
    fields: [
      { key: "title", label: "Risk", placeholder: "e.g. Transformer delivery delay", wide: true },
      { key: "category", label: "Category", type: "select", options: ["Schedule", "Supply chain", "Commercial", "Permitting", "Technical", "Market"] },
      { key: "owner", label: "Owner", placeholder: "Team or person" },
      { key: "likelihood", label: "Likelihood (1–5)", type: "select", options: SCALE, initial: "3" },
      { key: "impact", label: "Impact (1–5)", type: "select", options: SCALE, initial: "3" },
      { key: "mitigation", label: "Mitigation", placeholder: "Planned response", wide: true },
    ],
  },
  documents: {
    button: "Add document",
    title: "Add document",
    submit: "Add document",
    fields: [
      { key: "title", label: "Title", placeholder: "e.g. Single-line diagram", wide: true },
      { key: "type", label: "Type", type: "select", options: ["Report", "Drawing", "Specification", "HSE", "Permit"] },
      { key: "status", label: "Status", type: "select", options: ["Draft", "IFR", "Submitted", "Issued", "Approved"] },
    ],
  },
  packages: {
    button: "Add supplier",
    title: "Add supplier",
    submit: "Add supplier",
    fields: [
      { key: "name", label: "Supplier / package", placeholder: "e.g. Compressor supplier", wide: true },
      { key: "scope", label: "Scope", placeholder: "e.g. 2 × 50 % reciprocating compressors", wide: true },
      { key: "status", label: "Status", type: "select", options: ["Not started", "Market sounding", "RFQ issued", "Awarded"] },
    ],
  },
};
