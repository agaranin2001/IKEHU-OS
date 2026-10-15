/** Static methodology content for /app/sources. Server-safe (no hooks). */
import { Ban, Check, CircleAlert, Minus, Plug } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Panel } from "@/components/ui/Panel";
import { VerificationPill } from "@/components/ui/StatusPill";
import type { Confidence, LcohInputs, VerificationStatus } from "@/domain/types";
import { H2_HHV_KWH_PER_KG } from "@/lib/economics/lcoh";
import { VERIFICATION } from "@/lib/labels";

/* ------------------------------------------------------------------ */
/* Section scaffold                                                    */
/* ------------------------------------------------------------------ */

export function Section({ id, eyebrow, title, intro, children, aside }: { id: string; eyebrow: string; title: string; intro?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 lg:scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-3xl">
          <div className="eyebrow mb-1.5">{eyebrow}</div>
          <h2 id={`${id}-title`} className="text-[24px] leading-tight font-light text-ink md:text-[28px]">
            {title}
          </h2>
          {intro && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{intro}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export const SOURCES_TOC = [
  { id: "datasets", label: "Datasets" },
  { id: "verification", label: "Verification & confidence" },
  { id: "data-rules", label: "Data rules" },
  { id: "lcoh-methodology", label: "LCOH methodology" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "publishers", label: "Source publishers" },
  { id: "future-integrations", label: "Future integrations" },
] as const;

/* ------------------------------------------------------------------ */
/* Verification & confidence                                           */
/* ------------------------------------------------------------------ */

const VERIFICATION_DETAIL: Record<VerificationStatus, string> = {
  verified: "Checked against the developer, manufacturer, regulator or official portal that owns the fact.",
  "partially-verified": "Headline facts trace to a primary source; secondary fields (e.g. partners, dates) rely on reputable reporting.",
  "vendor-claim": "Performance and capacity figures come from the manufacturer’s own datasheets or press material and have not been independently tested.",
  unverified: "Not yet matched to a source. Always shown with a warning; treat figures as leads to check, not facts.",
};

const CONFIDENCE: { level: Confidence; tone: "ok" | "info" | "warn"; help: string }[] = [
  { level: "high", tone: "ok", help: "Primary source is recent and unambiguous; key figures agree across sources." },
  { level: "medium", tone: "info", help: "Single primary source, or figures that are stated but dated, rounded or phase-dependent." },
  { level: "low", tone: "warn", help: "Secondary reporting only, conflicting figures, or a status that may have changed since publication." },
];

export function VerificationDefinitions() {
  return (
    <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <Panel title="Verification status" subtitle="Applied to every record; shown beside its sources">
        <dl className="divide-y divide-line-2">
          {(Object.keys(VERIFICATION) as VerificationStatus[]).map((k) => (
            <div key={k} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt>
                <VerificationPill status={k} />
              </dt>
              <dd className="text-sm">
                <span className="text-ink">{VERIFICATION[k].help}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{VERIFICATION_DETAIL[k]}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
      <Panel title="Confidence" subtitle="How much weight to give a record’s figures">
        <dl className="divide-y divide-line-2">
          {CONFIDENCE.map((c) => (
            <div key={c.level} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[90px_1fr] sm:gap-4">
              <dt>
                <Badge tone={c.tone}>{c.level[0].toUpperCase() + c.level.slice(1)}</Badge>
              </dt>
              <dd className="text-sm leading-relaxed text-ink-2">{c.help}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-line-2 pt-3 text-xs leading-relaxed text-muted">
          Every record also carries a <span className="text-ink">last verified</span> date — the day it was last checked against its sources, not the source’s publication date.
        </p>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data rules                                                          */
/* ------------------------------------------------------------------ */

const RULES: { title: string; body: ReactNode }[] = [
  {
    title: "Announced is not operational",
    body: "Project status follows the latest public evidence (announced, planned, under construction, operational, delayed, cancelled). Announced capacity is never added to operational totals, and FID is shown only when publicly confirmed.",
  },
  {
    title: "Electrolyser MW is electrical input",
    body: "Capacity means electrolyser input power in MW(e). Wind, solar or grid-connection capacity is never substituted; if only generation capacity is published, electrolyser capacity stays blank.",
  },
  {
    title: "Vendor claims are labelled",
    body: "Efficiency, output pressure, lifetime and capacity figures from manufacturers are vendor claims unless an independent test is cited. Specifications state their basis.",
  },
  {
    title: "Prices only when public",
    body: "Equipment prices appear only when a public source discloses them, with that source attached. Otherwise the product shows “Quotation required”. No price is estimated.",
  },
  {
    title: "Missing data is shown as missing",
    body: "Undisclosed values render as “Undisclosed”, “Not disclosed” or “—” — never as 0. Where a value is filled in, it is marked as an estimate and left out of totals.",
  },
  {
    title: "Every figure has a source",
    body: "Each record lists its source documents and a verification date. Aggregates show dataset scope and compile date so a total is never read as global coverage.",
  },
  {
    title: "No valuations or revenue estimates",
    body: "Company and investor views show publicly documented facts and deals only — no valuations, revenue estimates or claims that a company is available for acquisition.",
  },
  {
    title: "Demo data is always labelled",
    body: "Illustrative content, such as the project workspace, carries a “Demo data” tag and is never mixed into sourced aggregates.",
  },
];

export function DataRules() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {RULES.map((r, i) => (
        <li key={r.title} className="rounded-card border border-line-2 bg-paper p-5 shadow-card">
          <div className="num text-xs font-semibold text-violet">{String(i + 1).padStart(2, "0")}</div>
          <h3 className="mt-1.5 text-[15px] font-semibold text-ink">{r.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{r.body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* LCOH methodology                                                    */
/* ------------------------------------------------------------------ */

function Fraction({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle">
      <span className="px-2 pb-1.5">{num}</span>
      <span className="w-full border-t border-ink/70 px-2 pt-1.5">{den}</span>
    </span>
  );
}

const Sum = () => (
  <span className="mx-0.5 inline-flex flex-col items-center align-middle leading-none">
    <span className="text-[9px] text-muted">N</span>
    <span className="text-[1.35em]">Σ</span>
    <span className="text-[9px] text-muted">t=1</span>
  </span>
);

const Disc = () => (
  <>
    (1 + r)<sup>t</sup>
  </>
);

export function LcohFormula() {
  return (
    <figure className="rounded-card border border-line-2 bg-paper-2 px-4 py-6 sm:px-8">
      <div className="scrollbar-thin overflow-x-auto">
        <div className="mx-auto flex w-max items-center gap-3 font-light text-ink" style={{ fontSize: "clamp(15px, 2.6vw, 21px)" }}>
          <span className="font-normal">LCOH</span>
          <span>=</span>
          <Fraction
            num={
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                CAPEX<sub>0</sub> + <Sum />
                <Fraction
                  num={
                    <>
                      OPEX<sub>t</sub> + REPL<sub>t</sub>
                    </>
                  }
                  den={<Disc />}
                />
              </span>
            }
            den={
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Sum />
                <Fraction
                  num={
                    <>
                      H<sub>2,t</sub>
                    </>
                  }
                  den={<Disc />}
                />
              </span>
            }
          />
          <span className="text-sm text-muted">[€/kg H₂]</span>
        </div>
      </div>
      <figcaption className="mt-6 grid gap-x-8 gap-y-1.5 border-t border-line pt-4 text-xs text-ink-2 sm:grid-cols-2">
        <span>
          <b className="font-semibold text-ink">CAPEX₀</b> installed system cost at t = 0 (€/kW × MW × 1,000)
        </span>
        <span>
          <b className="font-semibold text-ink">OPEXₜ</b> electricity + fixed O&M + variable O&M + water in year t
        </span>
        <span>
          <b className="font-semibold text-ink">REPLₜ</b> stack replacement cost in year t (0 in most years)
        </span>
        <span>
          <b className="font-semibold text-ink">H₂,ₜ</b> hydrogen produced in year t, kg
        </span>
        <span>
          <b className="font-semibold text-ink">r</b> real discount rate (WACC); <b className="font-semibold text-ink">N</b> economic lifetime, years
        </span>
        <span>Real terms, constant prices; discounted levelised cost.</span>
      </figcaption>
    </figure>
  );
}

const COMPONENTS: { label: string; formula: ReactNode; note?: string }[] = [
  { label: "Electricity", formula: "P [MW] × hours × (energy price + grid fees)", note: "€/yr" },
  { label: "Production", formula: "P [MW] × hours × 1,000 ÷ SECₜ", note: "kg/yr" },
  { label: "Degradation", formula: "SECₜ = SEC₀ × (1 + d × hours since stack change ÷ 1,000 ÷ 100)", note: "Constant-power operation: degradation lowers output rather than raising electricity use." },
  { label: "Stack change", formula: "x % of CAPEX₀ each time cumulative hours cross a multiple of stack lifetime", note: "Not in the final year." },
  { label: "Fixed O&M", formula: "% of CAPEX₀ per year" },
  { label: "Variable O&M", formula: "€/MWh of electricity consumed", note: "Excludes energy and water." },
  { label: "Water", formula: "L/kg × kg ÷ 1,000 × €/m³" },
];

const INCLUDED = [
  "Installed electrolyser system CAPEX (stack, balance of plant, EPC) as €/kW",
  "Stack replacements over the economic lifetime",
  "Fixed O&M as % of initial CAPEX per year",
  "Electricity: energy price plus grid fees and levies",
  "Variable O&M per MWh consumed",
  "Water including treatment",
];

const EXCLUDED = [
  "Compression, storage and transport beyond the plant gate",
  "Land and site costs",
  "Grid-connection capex (unless already included in the €/kW figure)",
  "Taxes and subsidies",
  "By-product revenues (oxygen, waste heat)",
  "A separate interest or financing line — financing is the discount rate",
];

const UNITS: { field: keyof LcohInputs; label: string; unit: string; note?: string }[] = [
  { field: "electricityPriceEurMwh", label: "Electricity price", unit: "€/MWh", note: "Average energy price" },
  { field: "gridFeesEurMwh", label: "Grid fees & levies", unit: "€/MWh", note: "On top of the energy price" },
  { field: "capacityMw", label: "Electrolyser capacity", unit: "MW(e)", note: "Nameplate electrical input" },
  { field: "capexEurKw", label: "Installed CAPEX", unit: "€/kW(e)", note: "Stack + BoP + EPC" },
  { field: "efficiencyKwhKg", label: "Specific energy consumption (SEC)", unit: "kWh/kg H₂", note: `System level, beginning of life; floor = HHV ${H2_HHV_KWH_PER_KG} kWh/kg` },
  { field: "operatingHours", label: "Operating hours", unit: "h/yr", note: "Full-load equivalent, max 8,760" },
  { field: "fixedOmPct", label: "Fixed O&M", unit: "% of CAPEX / yr" },
  { field: "variableOmEurMwh", label: "Variable O&M", unit: "€/MWh(e)", note: "Excl. electricity & water" },
  { field: "waterLitresPerKg", label: "Water consumption", unit: "L/kg H₂" },
  { field: "waterCostEurM3", label: "Water cost", unit: "€/m³", note: "Incl. treatment" },
  { field: "lifetimeYears", label: "Economic lifetime", unit: "years" },
  { field: "discountRatePct", label: "Discount rate (WACC)", unit: "% / yr", note: "Real" },
  { field: "stackLifetimeHours", label: "Stack lifetime", unit: "operating hours" },
  { field: "stackReplacementPct", label: "Stack replacement cost", unit: "% of CAPEX₀" },
  { field: "degradationPctPer1000h", label: "Degradation", unit: "% per 1,000 h", note: "Reset on stack replacement" },
];

function ItemList({ items, kind }: { items: string[]; kind: "in" | "out" }) {
  const Icon = kind === "in" ? Check : Minus;
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 text-sm text-ink-2">
          <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", kind === "in" ? "bg-ok-soft text-ok" : "bg-stone text-muted")}>
            <Icon className="size-3" aria-hidden />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function LcohMethodology() {
  return (
    <div className="space-y-5">
      <LcohFormula />

      <div className="flex items-start gap-3 rounded-card border border-violet/25 bg-violet-soft/50 px-5 py-4">
        <Ban className="mt-0.5 size-5 shrink-0 text-violet" aria-hidden />
        <div className="text-sm leading-relaxed text-ink-2">
          <p className="font-semibold text-ink">No double counting of financing</p>
          <p className="mt-0.5">
            Capital recovery is captured once, by discounting the production denominator. The cost of finance is the discount rate (WACC) — it is not added again as an interest line. The
            capital recovery factor (CRF) is reported for reference as an equivalent annuity and is never added on top.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Cost components" subtitle="Computed year by year, t = 1 … N">
          <dl className="divide-y divide-line-2">
            {COMPONENTS.map((c) => (
              <div key={c.label} className="grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-4">
                <dt className="text-sm font-medium text-ink">{c.label}</dt>
                <dd className="text-sm text-ink-2">
                  <code className="font-mono text-[12.5px] text-ink">{c.formula}</code>
                  {c.note && <span className="mt-0.5 block text-xs text-muted">{c.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
        <div className="grid gap-5">
          <Panel title="Included" subtitle="Plant-gate production cost">
            <ItemList items={INCLUDED} kind="in" />
          </Panel>
          <Panel title="Excluded" subtitle="Add separately when comparing delivered cost">
            <ItemList items={EXCLUDED} kind="out" />
          </Panel>
        </div>
      </div>

      <Panel title="Inputs & units" subtitle="Units are fixed; the calculator validates each input against physical and plausible bounds" bodyClassName="p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-paper-2 text-xs text-muted">
              <tr className="border-y border-line-2">
                <th scope="col" className="px-5 py-2.5 font-medium">Input</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Unit</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Definition</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.field} className="border-b border-line-2 last:border-0 hover:bg-paper-2">
                  <td className="px-5 py-2.5 text-ink">{u.label}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <code className="font-mono text-[12.5px] text-ink">{u.unit}</code>
                  </td>
                  <td className="px-5 py-2.5 text-ink-2">{u.note ?? <span className="text-faint">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href="/app/calculator" size="lg">
          Open the LCOH calculator
        </ButtonLink>
        <Link href="#benchmarks" className="text-sm font-medium text-forest hover:underline">
          Compare inputs with published benchmarks
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Future integrations                                                 */
/* ------------------------------------------------------------------ */

const INTEGRATIONS = [
  { title: "Energy market APIs", body: "Scheduled day-ahead and intraday price feeds by bidding zone, replacing today’s compiled snapshots." },
  { title: "European Hydrogen Observatory (EHO)", body: "Synchronise project, cost and policy datasets with the Clean Hydrogen Partnership’s observatory." },
  { title: "Procurement portals", body: "Tender alerts from public procurement portals (e.g. TED) and national funding platforms." },
  { title: "Authentication & team workspaces", body: "Single sign-on, roles and shared workspaces, so notes, checklists and RFQs persist and can be shared." },
  { title: "Project management systems", body: "Two-way sync of tasks, documents and risks for the project workspace." },
];

export function FutureIntegrations() {
  return (
    <div>
      <p className="mb-4 flex items-start gap-2 text-sm text-ink-2">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
        None of these integrations is connected today. All data on the platform comes from the versioned datasets described above.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <li key={i.title} className="rounded-card border border-dashed border-line bg-paper-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
                <Plug className="size-4 text-muted" aria-hidden />
                {i.title}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{i.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
