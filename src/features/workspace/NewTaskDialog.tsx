"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { SelectField, TextField } from "@/components/ui/Fields";
import type { WorkspaceTask } from "@/domain/types";
import { PHASES, TASK_STATUS, TASK_STATUSES } from "./model";

type Draft = Omit<WorkspaceTask, "id">;

/** Modal form for adding a task to the demo workspace (kept in this session only). */
export function NewTaskDialog({
  open,
  owners,
  defaultPhase,
  onClose,
  onCreate,
}: {
  open: boolean;
  /** Existing owners, offered as suggestions. */
  owners: string[];
  defaultPhase: WorkspaceTask["phase"];
  onClose: () => void;
  onCreate: (task: Draft) => void;
}) {
  const formId = useId();
  const listId = useId();
  const blank: Draft = { title: "", phase: defaultPhase, owner: "", due: "", status: "todo" };
  const [draft, setDraft] = useState<Draft>(blank);
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const errors = {
    title: draft.title.trim() ? undefined : "Enter a task title.",
    owner: draft.owner.trim() ? undefined : "Enter an owner.",
    due: draft.due ? undefined : "Choose a due date.",
  };
  const valid = !errors.title && !errors.owner && !errors.due;

  const close = () => {
    setDraft(blank);
    setTouched(false);
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onCreate({ ...draft, title: draft.title.trim(), owner: draft.owner.trim() });
    setDraft(blank);
    setTouched(false);
  };

  return (
    <Drawer
      open={open}
      side="center"
      width="max-w-lg"
      onClose={close}
      title={
        <div>
          <div className="text-base font-semibold text-ink">Create new task</div>
          <p className="mt-0.5 text-xs text-muted">Demo workspace — new tasks stay in this browser session.</p>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Create task
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Title" value={draft.title} onChange={(e) => set("title", e.target.value)} error={touched ? errors.title : undefined} placeholder="e.g. Compressor RFQ package" autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Phase" value={draft.phase} onChange={(e) => set("phase", e.target.value as Draft["phase"])} options={PHASES.map((p) => ({ value: p, label: p }))} />
          <SelectField label="Status" value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])} options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS[s].label }))} />
          <TextField label="Owner" list={listId} value={draft.owner} onChange={(e) => set("owner", e.target.value)} error={touched ? errors.owner : undefined} placeholder="Team or person" />
          <TextField label="Due date" type="date" value={draft.due} onChange={(e) => set("due", e.target.value)} error={touched ? errors.due : undefined} />
        </div>
        <datalist id={listId}>
          {owners.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </form>
    </Drawer>
  );
}
