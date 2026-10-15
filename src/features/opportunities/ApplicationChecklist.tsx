"use client";

import { HardDrive } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/components/ui/cn";
import type { Opportunity } from "@/domain/types";
import { docItemId, reqItemId, useChecklistState } from "./useBrowserStore";

function Item({ id, text, checked, onToggle }: { id: string; text: string; checked: boolean; onToggle: (id: string, on: boolean) => void }) {
  return (
    <li>
      <label className={cn("flex cursor-pointer items-start gap-3 rounded-btn px-2 py-2 text-sm hover:bg-paper-2", checked ? "text-muted" : "text-ink-2")}>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(id, e.target.checked)} className="mt-0.5 size-4 shrink-0 rounded border-line accent-forest" />
        <span className={cn("leading-snug", checked && "line-through decoration-faint")}>{text}</span>
      </label>
    </li>
  );
}

/** Interactive application checklist built from requiredDocuments + requirements. Client-side only. */
export function ApplicationChecklist({ opportunity: o }: { opportunity: Opportunity }) {
  const { checked, toggle, clear, persisted } = useChecklistState(o.id);
  const docs = [...new Set(o.requiredDocuments)].map((t) => ({ id: docItemId(t), text: t }));
  const reqs = [...new Set(o.requirements)].map((t) => ({ id: reqItemId(t), text: t }));
  const total = docs.length + reqs.length;
  const done = [...docs, ...reqs].filter((i) => checked.has(i.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Panel
      title="Application checklist"
      subtitle="Built from the documents and requirements in this record"
      actions={
        done > 0 ? (
          <button type="button" onClick={clear} className="text-xs text-forest hover:underline">
            Clear
          </button>
        ) : undefined
      }
      footer={
        <span className="flex items-start gap-1.5">
          <HardDrive className="mt-px size-3.5 shrink-0" aria-hidden />
          {persisted
            ? "Your checklist is stored only in this browser."
            : "Browser storage is unavailable, so this checklist resets when you leave the page."}
        </span>
      }
    >
      {total === 0 ? (
        <p className="text-sm text-muted">This record lists no documents or requirements. Use the official call documents to build your checklist.</p>
      ) : (
        <>
          <div className="mb-4">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="text-muted">Progress</span>
              <span className="num text-ink">
                {done} of {total} · {pct}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={done}
              aria-label="Checklist progress"
              className="h-2 overflow-hidden rounded-full bg-stone"
            >
              <div className="h-full rounded-full bg-forest transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {docs.length > 0 && (
            <div>
              <h3 className="px-2 text-[11px] font-semibold tracking-wide text-muted uppercase">Documents to prepare</h3>
              <ul className="mt-1">
                {docs.map((i) => (
                  <Item key={i.id} id={i.id} text={i.text} checked={checked.has(i.id)} onToggle={toggle} />
                ))}
              </ul>
            </div>
          )}
          {reqs.length > 0 && (
            <div className={cn(docs.length > 0 && "mt-4")}>
              <h3 className="px-2 text-[11px] font-semibold tracking-wide text-muted uppercase">Requirements to evidence</h3>
              <ul className="mt-1">
                {reqs.map((i) => (
                  <Item key={i.id} id={i.id} text={i.text} checked={checked.has(i.id)} onToggle={toggle} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
