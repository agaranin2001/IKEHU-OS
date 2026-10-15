"use client";

import { AlertTriangle, CheckCircle2, Info, Loader2, RotateCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { OriginTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { SelectField, TextArea, TextField } from "@/components/ui/Fields";
import { services } from "@/services";
import type { QuoteRequest, QuoteRequestResult } from "@/services/contracts";
import { fmtDate } from "@/lib/format";
import { EQUIPMENT_CATEGORY } from "@/lib/labels";
import { type CatalogueProduct, joinNames, uniqueSupplierNames } from "./model";

const TIMELINES = [
  { value: "", label: "Select a timeline" },
  { value: "Within 3 months", label: "Within 3 months" },
  { value: "3–6 months", label: "3–6 months" },
  { value: "6–12 months", label: "6–12 months" },
  { value: "More than 12 months", label: "More than 12 months" },
  { value: "Budgetary estimate only", label: "Budgetary estimate only" },
];

interface FormValues {
  company: string;
  email: string;
  projectSizeMw: string;
  timeline: string;
  message: string;
}
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = { company: "", email: "", projectSizeMw: "", timeline: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 2000;
const noop = () => undefined;

export function validateQuoteForm(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.company.trim()) e.company = "Enter your company name.";
  if (!v.email.trim()) e.email = "Enter your work email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address, e.g. name@company.com.";
  const mw = Number(v.projectSizeMw.replace(",", "."));
  if (!v.projectSizeMw.trim()) e.projectSizeMw = "Enter the project size in MW.";
  else if (!Number.isFinite(mw) || mw <= 0) e.projectSizeMw = "Project size must be a positive number.";
  else if (mw > 100_000) e.projectSizeMw = "Enter a size below 100,000 MW.";
  if (!v.timeline) e.timeline = "Select a procurement timeline.";
  if (v.message.length > MAX_MESSAGE) e.message = `Keep the message under ${MAX_MESSAGE.toLocaleString("en-GB")} characters.`;
  return e;
}

type Phase = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; result: QuoteRequestResult } | { kind: "error"; message: string };

/**
 * Request-for-quotation form. Mount with a fresh `key` per request so state
 * resets. The demo provider only returns a reference — nothing is transmitted.
 */
export function QuoteRequestDrawer({ products, onClose }: { products: CatalogueProduct[]; onClose: () => void }) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  const suppliers = uniqueSupplierNames(products);
  const routedTo = suppliers.length ? `${joinNames(suppliers)}'s sales team${suppliers.length > 1 ? "s" : ""}` : "the manufacturer";

  const set = (k: keyof FormValues) => (value: string) => {
    const next = { ...values, [k]: value };
    setValues(next);
    if (attempted) setErrors(validateQuoteForm(next));
  };

  async function submit() {
    const e = validateQuoteForm(values);
    setAttempted(true);
    setErrors(e);
    if (Object.keys(e).length) return;
    setPhase({ kind: "submitting" });
    const req: QuoteRequest = {
      productIds: products.map((p) => p.id),
      company: values.company.trim(),
      email: values.email.trim(),
      projectSizeMw: Number(values.projectSizeMw.replace(",", ".")),
      timeline: values.timeline,
      message: values.message.trim() || undefined,
    };
    try {
      const result = await services.procurement.requestQuote(req);
      setPhase({ kind: "success", result });
    } catch (err) {
      setPhase({ kind: "error", message: err instanceof Error ? err.message : "The request could not be recorded." });
    }
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (phase.kind !== "submitting") void submit();
  };

  const submitting = phase.kind === "submitting";

  const footer =
    phase.kind === "success" ? (
      <div className="flex justify-end">
        <Button size="sm" onClick={onClose}>Done</Button>
      </div>
    ) : phase.kind === "error" ? (
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setPhase({ kind: "idle" })}>
          Edit details
        </Button>
        <Button size="sm" onClick={() => void submit()}>
          <RotateCw className="size-4" aria-hidden /> Retry
        </Button>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button size="sm" type="submit" form="rfq-form" disabled={submitting} aria-busy={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {submitting ? "Recording request…" : "Request quotation"}
        </Button>
      </div>
    );

  return (
    <Drawer
      open
      onClose={submitting ? noop : onClose}
      side="center"
      width="max-w-xl"
      title={
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Request for quotation</span>
            <OriginTag origin="demo" />
          </div>
          <h2 className="mt-1 text-xl font-light text-ink">
            {products.length === 1 ? products[0].model : `${products.length} products`}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{joinNames(suppliers)}</p>
        </div>
      }
      footer={footer}
    >
      {phase.kind === "success" ? (
        <div role="status" className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-ok" aria-hidden />
            <div>
              <p className="text-lg font-light text-ink">Request recorded in this demo</p>
              <p className="mt-1 text-sm text-ink-2">
                Reference <span className="num font-mono font-medium text-ink">{phase.result.reference}</span> · {fmtDate(phase.result.createdAt)}
              </p>
            </div>
          </div>
          <p className="rounded-btn border border-warn/30 bg-warn-soft px-3 py-2.5 text-sm leading-relaxed text-warn">
            Demo: this request was not sent to the supplier. In production it would be routed to {routedTo}, and you would receive a confirmation at{" "}
            {values.email.trim()}.
          </p>
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted">Products in this request</div>
            <ul className="divide-y divide-line-2 rounded-card border border-line-2 bg-paper">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="text-ink">{p.model}</span>
                  <span className="text-xs text-muted">{p.supplierName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {phase.kind === "error" && (
            <div role="alert" className="flex items-start gap-2 rounded-btn border border-bad/30 bg-bad-soft px-3 py-2.5 text-sm text-bad">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                The request could not be recorded: {phase.message} Your details are kept — retry or edit them.
              </span>
            </div>
          )}
          <ul className="flex flex-wrap gap-1.5" aria-label="Products in this request">
            {products.map((p) => (
              <li key={p.id} className="rounded-md border border-line-2 bg-paper px-2 py-1 text-xs text-ink-2">
                {p.model} <span className="text-faint">· {EQUIPMENT_CATEGORY[p.category]}</span>
              </li>
            ))}
          </ul>
          <form id="rfq-form" noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-busy={submitting}>
            <TextField
              label="Company"
              name="company"
              autoComplete="organization"
              value={values.company}
              onChange={(e) => set("company")(e.target.value)}
              error={errors.company}
              disabled={submitting || phase.kind === "error"}
              className="sm:col-span-2"
            />
            <TextField
              label="Work email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => set("email")(e.target.value)}
              error={errors.email}
              disabled={submitting || phase.kind === "error"}
              className="sm:col-span-2"
            />
            <TextField
              label="Project size"
              hint="MW(e)"
              name="projectSizeMw"
              inputMode="decimal"
              placeholder="e.g. 20"
              value={values.projectSizeMw}
              onChange={(e) => set("projectSizeMw")(e.target.value)}
              error={errors.projectSizeMw}
              disabled={submitting || phase.kind === "error"}
            />
            <div>
              <SelectField
                label="Procurement timeline"
                name="timeline"
                options={TIMELINES}
                value={values.timeline}
                onChange={(e) => set("timeline")(e.target.value)}
                aria-invalid={!!errors.timeline}
                disabled={submitting || phase.kind === "error"}
              />
              {errors.timeline && <p className="mt-1 text-xs text-bad">{errors.timeline}</p>}
            </div>
            <TextArea
              label="Message (optional)"
              name="message"
              placeholder="Site conditions, required output pressure, delivery location…"
              value={values.message}
              onChange={(e) => set("message")(e.target.value)}
              error={errors.message}
              disabled={submitting || phase.kind === "error"}
              className="sm:col-span-2"
              maxLength={MAX_MESSAGE + 200}
            />
          </form>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Demo environment: submitting records a reference only. Nothing is sent to {joinNames(suppliers) || "the manufacturer"}.
          </p>
        </div>
      )}
    </Drawer>
  );
}
