"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, SelectField, TextArea, TextField } from "@/components/ui/Fields";
import { services } from "@/services";
import type { DemoRequest } from "@/services/contracts";

const INTERESTS = ["Market intelligence", "Hydrogen economics", "Technology & suppliers", "Tenders & funding", "Investment screening", "Project delivery"];
const ROLES = ["Project developer", "Investor / fund", "EPC / engineering", "Equipment manufacturer", "Industrial offtaker", "Public sector / funder", "Consultant", "Other"];

type Errors = Partial<Record<keyof DemoRequest, string>>;

export function validateDemoRequest(v: DemoRequest): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid work email.";
  if (v.company.trim().length < 2) e.company = "Enter your organisation.";
  if (!v.role) e.role = "Select your role.";
  if (v.interest.length === 0) e.interest = "Choose at least one area.";
  if ((v.message ?? "").length > 1000) e.message = "Keep the message under 1,000 characters.";
  return e;
}

export function DemoRequestForm() {
  const [v, setV] = useState<DemoRequest>({ name: "", email: "", company: "", role: "", interest: [], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [ref, setRef] = useState("");

  const set = <K extends keyof DemoRequest>(k: K, val: DemoRequest[K]) => {
    setV((s) => ({ ...s, [k]: val }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateDemoRequest(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("submitting");
    try {
      const r = await services.leads.submitDemoRequest(v);
      setRef(r.reference);
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-panel bg-paper p-8 text-center shadow-card md:p-12" role="status">
        <CheckCircle2 className="mx-auto size-10 text-ok" />
        <h2 className="mt-4 text-2xl font-light text-ink">Request recorded</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-2">
          Reference <span className="num font-medium text-ink">{ref}</span>. This is a prototype: the request was validated but <b>not sent</b> to anyone. In production it would reach the team at the configured API endpoint.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => (setState("idle"), setV({ name: "", email: "", company: "", role: "", interest: [], message: "" }))}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="rounded-panel bg-paper p-6 shadow-card md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Full name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <TextField label="Work email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
        <TextField label="Organisation" autoComplete="organization" value={v.company} onChange={(e) => set("company", e.target.value)} error={errors.company} />
        <div>
          <SelectField label="Role" value={v.role} onChange={(e) => set("role", e.target.value)} options={[{ value: "", label: "Select…" }, ...ROLES.map((r) => ({ value: r, label: r }))]} aria-invalid={!!errors.role} />
          {errors.role && <p className="mt-1 text-xs text-bad">{errors.role}</p>}
        </div>
      </div>
      <fieldset className="mt-6">
        <legend className="mb-2 text-xs font-medium text-ink-2">Areas of interest</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {INTERESTS.map((i) => (
            <Checkbox key={i} label={i} checked={v.interest.includes(i)} onChange={(c) => set("interest", c ? [...v.interest, i] : v.interest.filter((x) => x !== i))} />
          ))}
        </div>
        {errors.interest && <p className="mt-1 text-xs text-bad">{errors.interest}</p>}
      </fieldset>
      <TextArea className="mt-6" label="What would you like to see? (optional)" value={v.message} onChange={(e) => set("message", e.target.value)} error={errors.message} />
      {state === "error" && <p className="mt-4 text-sm text-bad">Something went wrong. Please try again.</p>}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={state === "submitting"}>
          {state === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Request a demo"
          )}
        </Button>
        <p className="text-xs text-muted">Prototype form: submissions are validated locally and not transmitted.</p>
      </div>
    </form>
  );
}
