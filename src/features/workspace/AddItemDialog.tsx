"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { SelectField, TextField } from "@/components/ui/Fields";

export interface AddField {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  placeholder?: string;
  /** Default value; select fields default to their first option. */
  initial?: string;
  /** Spans both columns. */
  wide?: boolean;
}

/**
 * Small modal form for adding an item to a workspace view (risk, cost line,
 * document, package). Every field is required; numbers must be ≥ 0. Values are
 * returned as strings for the caller to map onto its record type.
 */
export function AddItemDialog({
  open,
  title,
  submitLabel,
  fields,
  onClose,
  onCreate,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  fields: AddField[];
  onClose: () => void;
  onCreate: (values: Record<string, string>) => void;
}) {
  const formId = useId();
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.initial ?? (f.type === "select" ? (f.options?.[0] ?? "") : "")]));
  const [values, setValues] = useState<Record<string, string>>(blank);
  const [touched, setTouched] = useState(false);

  const errorFor = (f: AddField) => {
    const v = (values[f.key] ?? "").trim();
    if (!v) return `Enter ${f.label.toLowerCase()}.`;
    if (f.type === "number" && !(Number(v) >= 0)) return "Enter a number of 0 or more.";
    return undefined;
  };
  const valid = fields.every((f) => !errorFor(f));

  const reset = () => {
    setValues(blank());
    setTouched(false);
  };
  const close = () => {
    reset();
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onCreate(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])));
    reset();
  };

  return (
    <Drawer
      open={open}
      side="center"
      width="max-w-lg"
      onClose={close}
      title={<div className="text-base font-semibold text-ink">{title}</div>}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId} size="sm">
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        {fields.map((f, i) =>
          f.type === "select" ? (
            <SelectField
              key={f.key}
              label={f.label}
              className={f.wide ? "sm:col-span-2" : undefined}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
            />
          ) : (
            <TextField
              key={f.key}
              label={f.label}
              type={f.type ?? "text"}
              inputMode={f.type === "number" ? "decimal" : undefined}
              min={f.type === "number" ? 0 : undefined}
              className={f.wide ? "sm:col-span-2" : undefined}
              value={values[f.key]}
              placeholder={f.placeholder}
              autoFocus={i === 0}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              error={touched ? errorFor(f) : undefined}
            />
          ),
        )}
      </form>
    </Drawer>
  );
}
