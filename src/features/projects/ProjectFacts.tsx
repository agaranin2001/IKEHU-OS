import type { ReactNode } from "react";
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { cn } from "@/components/ui/cn";
import { ProjectStatusPill } from "@/components/ui/StatusPill";
import type { HydrogenProject } from "@/domain/types";
import { fmtDate, fmtMoney, fmtNum } from "@/lib/format";
import { END_USE, PATHWAY } from "@/lib/labels";
import { commissioningLabel, fidLabel, isElectrolyserTech, outputLabel } from "./model";

export interface Fact {
  label: string;
  value: ReactNode;
  /** Renders the value in a muted tone (unknown / not disclosed). */
  unknown?: boolean;
  hint?: ReactNode;
}

export function FactList({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line-2", className)}>
      {facts.map((f) => (
        <div key={f.label} className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(140px,38%)_1fr]">
          <dt className="text-xs font-medium text-muted sm:pt-px">{f.label}</dt>
          <dd className={cn("min-w-0 text-[14px] leading-relaxed", f.unknown ? "text-faint" : "text-ink")}>
            {f.value}
            {f.hint && <span className="mt-0.5 block text-xs text-muted">{f.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Wraps a value in the estimate marker when that field of the record is estimated. */
const est = (p: HydrogenProject, field: string, value: ReactNode) => <Estimate on={isEstimated(p, field)}>{value}</Estimate>;

const capacityFact = (p: HydrogenProject): Fact => ({
  label: "Electrolyser input capacity",
  value: p.capacityMw == null ? "Undisclosed" : est(p, "capacityMw", <span className="num">{fmtNum(p.capacityMw, p.capacityMw < 10 ? 1 : 0)} MW</span>),
  unknown: p.capacityMw == null,
  hint:
    p.capacityMw != null
      ? "Electrical input (MWe), not power-generation capacity"
      : !isElectrolyserTech(p.technology) && p.technology !== "Mixed" && p.technology !== "Undisclosed"
        ? "Not applicable to this production route"
        : undefined,
});

const outputFact = (p: HydrogenProject): Fact => ({
  label: "Hydrogen output",
  value: p.hydrogenOutputTpa == null ? "Undisclosed" : est(p, "hydrogenOutputTpa", <span className="num">{outputLabel(p.hydrogenOutputTpa)}</span>),
  unknown: p.hydrogenOutputTpa == null,
});

const investmentFact = (p: HydrogenProject): Fact => ({
  label: "Investment",
  value: p.investment ? est(p, "investment", <span className="num">{fmtMoney(p.investment)}</span>) : "Undisclosed",
  unknown: !p.investment,
  hint: p.investment?.scope,
});

/** Grouped fact sheet for the full record page. */
export function projectFactGroups(p: HydrogenProject): { id: string; title: string; facts: Fact[] }[] {
  return [
    {
      id: "overview",
      title: "Overview",
      facts: [
        { label: "Status", value: <ProjectStatusPill status={p.status} />, hint: p.statusNote },
        { label: "Country", value: `${p.countryName} (${p.country})`, hint: p.region },
        {
          label: "Location",
          value: p.location.label,
          hint: p.location.precision === "exact" ? "Site coordinates" : "Approximate — town or region centroid",
        },
        { label: "Developer", value: p.developer },
        { label: "Partners", value: p.partners.length ? p.partners.join(", ") : "None disclosed", unknown: !p.partners.length },
        { label: "Pathway", value: PATHWAY[p.pathway] },
        { label: "Intended end uses", value: p.endUses.length ? p.endUses.map((u) => END_USE[u]).join(", ") : "Undisclosed", unknown: !p.endUses.length },
      ],
    },
    {
      id: "technical",
      title: "Technical",
      facts: [
        { label: "Technology", value: est(p, "technology", p.technology), unknown: p.technology === "Undisclosed" },
        capacityFact(p),
        outputFact(p),
        { label: "Feedstock / power supply", value: p.feedstock || "Undisclosed", unknown: !p.feedstock },
        { label: "Electrolyser supplier", value: p.electrolyserSupplier ?? "Undisclosed", unknown: !p.electrolyserSupplier },
      ],
    },
    {
      id: "commercial",
      title: "Commercial",
      facts: [
        investmentFact(p),
        { label: "Final investment decision", value: est(p, "finalInvestmentDecision", fidLabel(p.finalInvestmentDecision)), unknown: p.finalInvestmentDecision == null },
        { label: "Public support", value: p.publicSupport ?? "None disclosed", unknown: !p.publicSupport },
      ],
    },
    {
      id: "timeline",
      title: "Timeline",
      facts: [
        { label: "First announced", value: <span className="num">{p.announcedYear}</span> },
        {
          label: "Expected commissioning",
          value: est(p, "expectedCommissioning", commissioningLabel(p.expectedCommissioning)),
          unknown: p.expectedCommissioning == null,
          hint: p.expectedCommissioning && !isEstimated(p, "expectedCommissioning") ? "Developer's stated target" : undefined,
        },
        { label: "Record last verified", value: fmtDate(p.verifiedAt) },
      ],
    },
  ];
}

/** Flat fact list used in the detail drawer. */
export function projectDrawerFacts(p: HydrogenProject): Fact[] {
  return [
    { label: "Country / location", value: `${p.countryName} · ${p.location.label}`, hint: p.location.precision === "approximate" ? "Approximate location" : undefined },
    { label: "Developer", value: p.developer },
    { label: "Partners", value: p.partners.length ? p.partners.join(", ") : "None disclosed", unknown: !p.partners.length },
    { label: "Technology", value: est(p, "technology", p.technology), unknown: p.technology === "Undisclosed" },
    { label: "Pathway", value: PATHWAY[p.pathway] },
    { label: "Feedstock / power supply", value: p.feedstock || "Undisclosed", unknown: !p.feedstock },
    { label: "Electrolyser supplier", value: p.electrolyserSupplier ?? "Undisclosed", unknown: !p.electrolyserSupplier },
    capacityFact(p),
    outputFact(p),
    { label: "Intended end uses", value: p.endUses.length ? p.endUses.map((u) => END_USE[u]).join(", ") : "Undisclosed", unknown: !p.endUses.length },
    { label: "Final investment decision", value: est(p, "finalInvestmentDecision", fidLabel(p.finalInvestmentDecision)), unknown: p.finalInvestmentDecision == null },
    { label: "First announced", value: <span className="num">{p.announcedYear}</span> },
    { label: "Expected commissioning", value: est(p, "expectedCommissioning", commissioningLabel(p.expectedCommissioning)), unknown: p.expectedCommissioning == null },
    investmentFact(p),
    { label: "Public support", value: p.publicSupport ?? "None disclosed", unknown: !p.publicSupport },
  ];
}
