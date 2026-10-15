"use client";

import { Check, CheckCircle2, CircleDashed, ClipboardCopy, FileWarning, Loader2, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, OriginTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Fields";
import { cn } from "@/components/ui/cn";
import type { Opportunity } from "@/domain/types";
import { type TenderReview, analyseOpportunity, outlineToMarkdown } from "./review";
import { type SelfAssessment, docItemId, useChecklistState, useSelfAssessment } from "./useBrowserStore";

const STEPS = ["Reading the structured record", "Grouping requirements by theme", "Mapping eligibility conditions", "Building checklist and outline"];
const STEP_MS = 380;

type Section = "requirements" | "eligibility" | "compliance" | "missing" | "outline";
type Phase = { kind: "idle" } | { kind: "running"; step: number } | { kind: "done" };
type CopyState = "idle" | "copied" | "failed";

const ANSWERS: { value: SelfAssessment; label: string; on: string }[] = [
  { value: "yes", label: "Yes", on: "border-ok bg-ok-soft text-ok" },
  { value: "no", label: "No", on: "border-bad bg-bad-soft text-bad" },
  { value: "unsure", label: "Unsure", on: "border-warn bg-warn-soft text-warn" },
];

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function Progress({ step }: { step: number }) {
  return (
    <div role="status" aria-live="polite" className="rounded-card border border-line-2 bg-paper-2 p-4">
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 text-sm", i < step ? "text-ink-2" : i === step ? "text-ink" : "text-faint")}>
            {i < step ? (
              <CheckCircle2 className="size-4 text-ok" aria-hidden />
            ) : i === step ? (
              <Loader2 className="size-4 animate-spin text-forest" aria-hidden />
            ) : (
              <CircleDashed className="size-4" aria-hidden />
            )}
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function RequirementsView({ review }: { review: TenderReview }) {
  return (
    <div className="space-y-5">
      <ul className="space-y-1.5 text-sm leading-relaxed text-ink-2">
        {review.headline.map((h) => (
          <li key={h} className="flex gap-2">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-faint" />
            {h}
          </li>
        ))}
      </ul>
      {review.requirementGroups.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {review.requirementGroups.map((g) => (
            <div key={g.theme} className="rounded-card border border-line-2 bg-paper-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-ink">{g.label}</h4>
                <span className="num text-xs text-muted">{g.items.length}</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-ink-2">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {review.caveats.length > 0 && (
        <ul className="space-y-1 text-xs text-warn">
          {review.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EligibilityView({ review, opportunityId }: { review: TenderReview; opportunityId: string }) {
  const { answers, answer, clear, persisted } = useSelfAssessment(opportunityId);
  if (!review.eligibility.length) return <p className="text-sm text-muted">The record lists no eligibility conditions. Check the official call documents.</p>;
  const counts = { yes: 0, no: 0, unsure: 0, open: 0 };
  for (const e of review.eligibility) {
    const a = answers[e.id];
    if (a) counts[a]++;
    else counts.open++;
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone="ok">{counts.yes} met</Badge>
        <Badge tone="bad">{counts.no} not met</Badge>
        <Badge tone="warn">{counts.unsure} unsure</Badge>
        <Badge tone="neutral">{counts.open} not answered</Badge>
        {counts.yes + counts.no + counts.unsure > 0 && (
          <button type="button" onClick={clear} className="ml-auto text-forest hover:underline">
            Reset answers
          </button>
        )}
      </div>
      {counts.no > 0 && (
        <p className="rounded-btn border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          You marked at least one condition as not met. Check the official eligibility rules before investing effort in an application.
        </p>
      )}
      {counts.no === 0 && counts.open === 0 && counts.unsure === 0 && (
        <p className="rounded-btn border border-ok/30 bg-ok-soft px-3 py-2 text-sm text-ok">
          You marked every recorded condition as met. This is a self-assessment only — eligibility is decided by the call&apos;s organiser.
        </p>
      )}
      <ul className="divide-y divide-line-2 rounded-card border border-line-2 bg-paper">
        {review.eligibility.map((e) => {
          const current = answers[e.id];
          return (
            <li key={e.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-snug text-ink-2">{e.text}</p>
              <div role="radiogroup" aria-label={`Self-assessment: ${e.text}`} className="flex shrink-0 gap-1">
                {ANSWERS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    role="radio"
                    aria-checked={current === a.value}
                    onClick={() => answer(e.id, a.value)}
                    className={cn(
                      "h-7 rounded-full border px-3 text-xs font-medium transition-colors",
                      current === a.value ? a.on : "border-line bg-paper text-muted hover:border-sage hover:text-ink",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-faint">
        {persisted ? "Answers are stored only in this browser." : "Browser storage is unavailable — answers reset when you leave the page."}
      </p>
    </div>
  );
}

function ComplianceView({ review }: { review: TenderReview }) {
  const groups = useMemo(() => {
    const m = new Map<string, TenderReview["compliance"]>();
    for (const c of review.compliance) m.set(c.group, [...(m.get(c.group) ?? []), c]);
    return [...m];
  }, [review.compliance]);
  return (
    <div className="space-y-4">
      {groups.map(([group, items]) => (
        <div key={group}>
          <h4 className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">{group}</h4>
          <ul className="space-y-1.5">
            {items.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm leading-snug text-ink-2">
                <Check className={cn("mt-0.5 size-4 shrink-0", c.origin === "record" ? "text-forest" : "text-faint")} aria-hidden />
                <span className="flex-1">{c.text}</span>
                <span className={cn("shrink-0 text-[11px]", c.origin === "record" ? "text-muted" : "text-violet")}>{c.origin === "record" ? "From record" : "Standard check"}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MissingView({ review, opportunityId }: { review: TenderReview; opportunityId: string }) {
  const { checked } = useChecklistState(opportunityId);
  if (!review.documents.length) return <p className="text-sm text-muted">The record lists no required documents. Check the official application template.</p>;
  const missing = review.documents.filter((d) => !checked.has(docItemId(d)));
  if (!missing.length)
    return (
      <p className="flex items-center gap-2 rounded-btn border border-ok/30 bg-ok-soft px-3 py-2 text-sm text-ok">
        <CheckCircle2 className="size-4" aria-hidden /> All {review.documents.length} documents listed in the record are ticked in your checklist.
      </p>
    );
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-2">
        <span className="num font-medium text-ink">{missing.length}</span> of {review.documents.length} documents listed in the record are not yet ticked in your
        application checklist.
      </p>
      <ul className="space-y-1.5">
        {missing.map((d) => (
          <li key={d} className="flex items-start gap-2 rounded-btn border border-warn/25 bg-warn-soft/60 px-3 py-2 text-sm text-ink-2">
            <FileWarning className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
            {d}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-faint">Tick documents in the application checklist as you prepare them; this list updates automatically.</p>
    </div>
  );
}

function OutlineView({ review, opportunity }: { review: TenderReview; opportunity: Opportunity }) {
  const [copy, setCopy] = useState<CopyState>("idle");
  const markdown = useMemo(() => outlineToMarkdown(opportunity, review), [opportunity, review]);
  const onCopy = async () => {
    const ok = await copyText(markdown);
    setCopy(ok ? "copied" : "failed");
    if (ok) setTimeout(() => setCopy("idle"), 2000);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Typical structure for a {review.outline.length}-section application of this type. Not an official template.</p>
        <Button size="sm" variant="secondary" onClick={() => void onCopy()}>
          {copy === "copied" ? <Check className="size-4" aria-hidden /> : <ClipboardCopy className="size-4" aria-hidden />}
          {copy === "copied" ? "Copied" : "Copy outline"}
        </Button>
      </div>
      {copy === "failed" && (
        <div role="alert" className="space-y-2">
          <p className="text-xs text-bad">Copying is blocked in this browser. Select the text below and copy it manually.</p>
          <textarea readOnly value={markdown} className="h-48 w-full rounded-btn border border-line bg-paper p-3 font-mono text-xs text-ink-2" onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
      <ol className="space-y-3">
        {review.outline.map((s, i) => (
          <li key={s.title} className="rounded-card border border-line-2 bg-paper p-4">
            <h4 className="text-sm font-semibold text-ink">
              <span className="num mr-1.5 text-muted">{i + 1}.</span>
              {s.title}
            </h4>
            <p className="mt-0.5 text-xs text-muted">{s.guidance}</p>
            {s.points.length > 0 ? (
              <ul className="mt-2 space-y-1 text-[13px] leading-snug text-ink-2">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-faint" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-faint">No record items mapped to this section.</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Rule-based reading aid for a call. Deterministic: derives every output from
 * the structured record (see ./review.ts). Never states that an application
 * was submitted, assessed or approved.
 */
export function TenderReviewAssistant({ opportunity }: { opportunity: Opportunity }) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [section, setSection] = useState<Section>("requirements");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const review = useMemo(() => analyseOpportunity(opportunity), [opportunity]);
  const { checked } = useChecklistState(opportunity.id);
  const missingCount = review.documents.filter((d) => !checked.has(docItemId(d))).length;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const generate = () => {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    setPhase({ kind: "running", step: 0 });
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setPhase(i === STEPS.length - 1 ? { kind: "done" } : { kind: "running", step: i + 1 }), STEP_MS * (i + 1)));
    });
  };

  return (
    <section aria-labelledby="tra-title" className="rounded-card border border-violet/20 bg-paper shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line-2 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ScanSearch className="size-4 text-violet" aria-hidden />
            <h2 id="tra-title" className="text-[15px] font-semibold text-ink">
              Tender review assistant
            </h2>
            <OriginTag origin="preview" />
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
            Preview: generated from the structured record by rules, not by an AI model. Always read the official call documents.
          </p>
        </div>
        {phase.kind === "done" ? (
          <Button size="sm" variant="ghost" onClick={() => setPhase({ kind: "idle" })}>
            Clear review
          </Button>
        ) : (
          <Button size="sm" onClick={generate} disabled={phase.kind === "running"}>
            {phase.kind === "running" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {phase.kind === "running" ? "Generating…" : "Generate review"}
          </Button>
        )}
      </header>

      <div className="p-5">
        {phase.kind === "idle" && (
          <div className="grid grid-cols-1 gap-3 text-sm text-ink-2 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Requirements summary", "Key facts and requirements grouped by theme"],
              ["Eligibility", "Each condition with a Yes / No / Unsure self-check"],
              ["Compliance checklist", "Record items plus standard checks"],
              ["Missing documents", "Listed documents not yet ticked"],
              ["Draft outline", "Section structure you can copy"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-card border border-dashed border-line px-3 py-3">
                <div className="text-[13px] font-medium text-ink">{t}</div>
                <div className="mt-0.5 text-xs text-muted">{d}</div>
              </div>
            ))}
          </div>
        )}
        {phase.kind === "running" && <Progress step={phase.step} />}
        {phase.kind === "done" && (
          <div className="space-y-5">
            <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-1">
              <Segmented<Section>
                label="Review sections"
                className="whitespace-nowrap"
                value={section}
                onChange={setSection}
                options={[
                  { value: "requirements", label: "Requirements" },
                  { value: "eligibility", label: `Eligibility (${review.eligibility.length})` },
                  { value: "compliance", label: `Compliance (${review.compliance.length})` },
                  { value: "missing", label: `Missing documents (${missingCount})` },
                  { value: "outline", label: "Draft outline" },
                ]}
              />
            </div>
            <div role="tabpanel">
              {section === "requirements" && <RequirementsView review={review} />}
              {section === "eligibility" && <EligibilityView review={review} opportunityId={opportunity.id} />}
              {section === "compliance" && <ComplianceView review={review} />}
              {section === "missing" && <MissingView review={review} opportunityId={opportunity.id} />}
              {section === "outline" && <OutlineView review={review} opportunity={opportunity} />}
            </div>
            <p className="border-t border-line-2 pt-3 text-[11px] leading-relaxed text-faint">
              This review is a reading aid. It does not submit, assess or approve an application, and it may miss conditions that appear only in the official
              documents.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
