/**
 * Tender review assistant — deterministic, rule-based analyser.
 *
 * Everything here is derived from the structured Opportunity record with
 * keyword rules and per-type templates. No AI model is involved, nothing is
 * inferred beyond the record, and the output is a reading aid only: the
 * official call documents always prevail.
 */
import type { Opportunity, OpportunityType } from "@/domain/types";
import { SNAPSHOT_DATE, fmtDate, fmtMoney } from "@/lib/format";
import { OPPORTUNITY_TYPE } from "@/lib/labels";
import { deadlineInfo, effectiveStatus, isInactive } from "./model";

export type Theme =
  | "evaluation"
  | "eligibility"
  | "financial"
  | "technical"
  | "environmental"
  | "schedule"
  | "legal"
  | "reporting"
  | "procedure"
  | "general";

export const THEME_LABEL: Record<Theme, string> = {
  evaluation: "Evaluation & award",
  eligibility: "Applicant & consortium",
  financial: "Financial & co-funding",
  technical: "Technical scope",
  environmental: "Climate & sustainability",
  schedule: "Timeline & delivery",
  legal: "Legal & compliance",
  reporting: "Reporting & monitoring",
  procedure: "Procedure & submission",
  general: "Other requirements",
};

/** Ordered keyword rules — the first match decides a line's theme. */
const THEME_RULES: { theme: Theme; pattern: RegExp }[] = [
  { theme: "evaluation", pattern: /evaluat|\baward|ranked|ranking|selection criteri|value for money|scor(ed|ing)|best bidder/i },
  { theme: "environmental", pattern: /emission|ghg|co2|co₂|carbon|climate|sustainab|dnsh|do no significant harm|environment|life[- ]?cycle|rfnbo|additionality|renewable origin/i },
  { theme: "financial", pattern: /co-?financ|co-?fund|budget|cost|capex|opex|financ|funding gap|guarantee|bond|price|state aid|cumulat|invest|eur\b|€|subsid|premium|tariff|revenue|bankab|equity|grant/i },
  { theme: "procedure", pattern: /submit|submission|portal|procedure|call documents|consultation documents|precedence|before applying|contact .+ before/i },
  { theme: "reporting", pattern: /\breport(s|ing)?\b|monitoring (plan|report)|dissemin|knowledge[- ]shar|audit|data shar/i },
  { theme: "legal", pattern: /complian|regulat|permit|declaration|legal|ethic|exclusion|licen[cs]e|certif|standard/i },
  { theme: "schedule", pattern: /month|year|deadline|commission|start of operation|operation by|milestone|schedule|timeline|within \d|by 20\d\d|duration/i },
  { theme: "eligibility", pattern: /consorti|partner|\bsmes?\b|legal entit|establish|member state|applicant|eligible countr|organisation|organization|company|companies|undertaking|registered/i },
  { theme: "technical", pattern: /\bmw\b|\bgw\b|capacity|electroly|technolog|trl|technical|performance|efficien|kwh|production|plant|stack|hydrogen|ammonia|methanol|pipeline|storage|refuell|innovation/i },
];

export function themeOf(text: string): Theme {
  return THEME_RULES.find((r) => r.pattern.test(text))?.theme ?? "general";
}

export interface RequirementGroup {
  theme: Theme;
  label: string;
  items: string[];
}

export interface ComplianceItem {
  id: string;
  text: string;
  group: string;
  /** "record" = stated in the structured record; "rule" = standard check added by the rules. */
  origin: "record" | "rule";
}

export interface OutlineSection {
  title: string;
  guidance: string;
  points: string[];
}

export interface TenderReview {
  headline: string[];
  requirementGroups: RequirementGroup[];
  eligibility: { id: string; text: string; theme: Theme }[];
  compliance: ComplianceItem[];
  documents: string[];
  outline: OutlineSection[];
  caveats: string[];
}

interface SectionTemplate {
  title: string;
  guidance: string;
  themes: Theme[];
  /** Section that receives eligibility conditions as "Demonstrate" points. */
  eligibility?: boolean;
}

const GRANT: SectionTemplate[] = [
  { title: "Executive summary", guidance: "Objective, hydrogen use case, requested funding and project duration.", themes: [] },
  { title: "Excellence & innovation", guidance: "State of the art, degree of innovation and technical approach.", themes: ["technical"] },
  { title: "Impact", guidance: "Emission reductions, market uptake, scalability and replication.", themes: ["environmental"] },
  { title: "Implementation & work plan", guidance: "Work packages, milestones, deliverables and risks.", themes: ["schedule"] },
  { title: "Consortium & capacity", guidance: "Partner roles, track record and eligibility of each applicant.", themes: ["eligibility"], eligibility: true },
  { title: "Budget & co-financing", guidance: "Cost breakdown, requested contribution and own funding.", themes: ["financial"] },
  { title: "Compliance & reporting", guidance: "Declarations, ethics, monitoring and reporting commitments.", themes: ["legal", "reporting"] },
];

const FUND: SectionTemplate[] = [
  { title: "Executive summary", guidance: "Project, applicant, requested support and timing in one page.", themes: [] },
  { title: "Applicant & partners", guidance: "Legal entity, ownership, financial standing and partners.", themes: ["eligibility"], eligibility: true },
  { title: "Project description & technical scope", guidance: "Site, capacity, technology choice and offtake.", themes: ["technical"] },
  { title: "Financing plan & funding gap", guidance: "CAPEX/OPEX, revenues, other public support and the gap the support closes.", themes: ["financial"] },
  { title: "Climate & environmental benefit", guidance: "Emission reductions and methodology.", themes: ["environmental"] },
  { title: "Delivery schedule", guidance: "Permitting, FID, construction and start of operation.", themes: ["schedule"] },
  { title: "Legal, permits & reporting", guidance: "Permits, state-aid declarations and reporting obligations.", themes: ["legal", "reporting"] },
];

const AUCTION: SectionTemplate[] = [
  { title: "Bid summary", guidance: "Bidder, project, volume offered and bid price reference.", themes: [] },
  { title: "Bidder qualification", guidance: "Legal entity, eligibility and experience.", themes: ["eligibility"], eligibility: true },
  { title: "Project & production capacity", guidance: "Capacity, production profile and technology.", themes: ["technical"] },
  { title: "Price bid & financial guarantees", guidance: "Bid price, guarantees and financing evidence as the auction terms require.", themes: ["financial"] },
  { title: "Delivery & commissioning schedule", guidance: "Milestones to start of production and delivery period.", themes: ["schedule"] },
  { title: "Sustainability & certification", guidance: "Renewable origin, emissions and certification approach.", themes: ["environmental"] },
  { title: "Declarations & reporting", guidance: "Compliance declarations and reporting during the support period.", themes: ["legal", "reporting"] },
];

const TENDER: SectionTemplate[] = [
  { title: "Cover letter", guidance: "Bidder identity, lots bid for and contact point.", themes: [] },
  { title: "Qualification & references", guidance: "Selection criteria, references and eligibility evidence.", themes: ["eligibility"], eligibility: true },
  { title: "Technical proposal", guidance: "Solution, methodology and performance against the specification.", themes: ["technical", "environmental"] },
  { title: "Delivery plan", guidance: "Schedule, resources and key milestones.", themes: ["schedule"] },
  { title: "Commercial proposal", guidance: "Price schedule and commercial terms as requested.", themes: ["financial"] },
  { title: "Compliance matrix", guidance: "Point-by-point response to mandatory requirements.", themes: ["legal", "reporting"] },
];

const PARTNERSHIP: SectionTemplate[] = [
  { title: "Organisation profile", guidance: "Who you are, capabilities and relevant references.", themes: ["eligibility"], eligibility: true },
  { title: "Proposed contribution", guidance: "Technology, assets or services you bring.", themes: ["technical"] },
  { title: "Commercial model", guidance: "Investment, cost sharing and revenue model.", themes: ["financial"] },
  { title: "Timeline", guidance: "Key steps and decision points.", themes: ["schedule"] },
  { title: "Sustainability", guidance: "Climate and environmental contribution.", themes: ["environmental"] },
  { title: "Governance & compliance", guidance: "Decision-making, compliance and reporting.", themes: ["legal", "reporting"] },
];

const TEMPLATES: Record<OpportunityType, SectionTemplate[]> = {
  "eu-funding": GRANT,
  "innovation-grant": GRANT,
  "national-fund": FUND,
  "public-financing": FUND,
  auction: AUCTION,
  "public-tender": TENDER,
  partnership: PARTNERSHIP,
};

/** Standard checks added by rule, phrased as checks — never as facts about the call. */
function ruleChecks(o: Opportunity): ComplianceItem[] {
  const out: ComplianceItem[] = [
    { id: "rule:docs", text: "Download and read the official call text, annexes and application template.", group: "Standard checks", origin: "rule" },
  ];
  if (o.deadline) out.push({ id: "rule:deadline", text: `Confirm the submission deadline (recorded as ${fmtDate(o.deadline)}) and its time zone on the official page.`, group: "Standard checks", origin: "rule" });
  else out.push({ id: "rule:deadline", text: "No deadline is recorded — confirm submission windows or cut-off dates on the official page.", group: "Standard checks", origin: "rule" });
  if (["eu-funding", "national-fund", "innovation-grant", "public-financing", "auction"].includes(o.type))
    out.push({ id: "rule:cumulation", text: "Check rules on combining this support with other public funding (cumulation / state aid).", group: "Standard checks", origin: "rule" });
  if (o.type === "auction") out.push({ id: "rule:guarantee", text: "Check whether the auction terms require a bid bond or other financial guarantee.", group: "Standard checks", origin: "rule" });
  if (o.type === "public-tender") out.push({ id: "rule:exclusion", text: "Check exclusion grounds, selection criteria and award criteria in the tender documents.", group: "Standard checks", origin: "rule" });
  if (o.type === "partnership") out.push({ id: "rule:contact", text: "Identify the partner-selection process and the official contact point.", group: "Standard checks", origin: "rule" });
  out.push({ id: "rule:portal", text: "Check how and where the application must be submitted (portal registration can take time).", group: "Standard checks", origin: "rule" });
  return out;
}

const uniq = (a: string[]) => [...new Set(a)];

export function analyseOpportunity(input: Opportunity): TenderReview {
  // The review restates the record as fact, so estimated values (lib/estimates.ts) are treated as not stated.
  const est = input.estimated ?? [];
  const o: Opportunity = {
    ...input,
    budget: est.includes("budget") ? null : input.budget,
    deadline: est.includes("deadline") ? null : input.deadline,
    requirements: uniq(input.requirements),
    eligibility: uniq(input.eligibility),
    requiredDocuments: uniq(input.requiredDocuments),
  };
  const status = effectiveStatus(o);
  const dl = deadlineInfo(o);
  const caveats: string[] = [];

  // (1) Requirements summary
  const headline: string[] = [`${OPPORTUNITY_TYPE[o.type]} run by ${o.organization}${o.programme ? ` under ${o.programme}` : ""}.`];
  if (isInactive(status)) headline.push(`${dl.label}. This call is not open for applications; use it as a reference for future rounds.`);
  else if (dl.date) headline.push(`Submission deadline ${dl.date} — ${dl.label.toLowerCase()} as of the ${fmtDate(SNAPSHOT_DATE)} snapshot.`);
  else headline.push(`${dl.label}.`);
  headline.push(o.budget ? `Total budget ${fmtMoney(o.budget)}${o.budget.scope ? ` (${o.budget.scope})` : ""}.` : "Total budget is not stated in the record.");
  if (o.maxPerProject) headline.push(`Indicative maximum per project ${fmtMoney(o.maxPerProject)}.`);
  if (o.technologies.length) headline.push(`Technology scope: ${o.technologies.join(", ")}.`);

  const groups = new Map<Theme, string[]>();
  for (const r of o.requirements) {
    const t = themeOf(r);
    groups.set(t, [...(groups.get(t) ?? []), r]);
  }
  const order = Object.keys(THEME_LABEL) as Theme[];
  const requirementGroups = order.filter((t) => groups.has(t)).map((t) => ({ theme: t, label: THEME_LABEL[t], items: groups.get(t)! }));
  headline.push(
    `${o.requirements.length} requirement${o.requirements.length === 1 ? "" : "s"} across ${requirementGroups.length} theme${requirementGroups.length === 1 ? "" : "s"}, ` +
      `${o.eligibility.length} eligibility condition${o.eligibility.length === 1 ? "" : "s"} and ${o.requiredDocuments.length} listed document${o.requiredDocuments.length === 1 ? "" : "s"}.`,
  );
  if (!o.requirements.length) caveats.push("The record lists no requirements — the official call documents are the only reference.");
  if (!o.eligibility.length) caveats.push("The record lists no eligibility conditions.");
  if (!o.requiredDocuments.length) caveats.push("The record lists no required documents.");

  // (2) Eligibility
  const eligibility = o.eligibility.map((text) => ({ id: `elig:${text}`, text, theme: themeOf(text) }));

  // (3) Compliance checklist
  const compliance: ComplianceItem[] = [
    ...eligibility.map((e) => ({ id: e.id, text: `Confirm: ${e.text}`, group: "Eligibility", origin: "record" as const })),
    ...requirementGroups.flatMap((g) => g.items.map((text) => ({ id: `req:${text}`, text, group: g.label, origin: "record" as const }))),
    ...o.requiredDocuments.map((d) => ({ id: `doc:${d}`, text: `Prepare: ${d}`, group: "Documents", origin: "record" as const })),
    ...ruleChecks(o),
  ];

  // (5) Draft outline
  const template = TEMPLATES[o.type];
  const covered = new Set(template.flatMap((s) => s.themes));
  const outline: OutlineSection[] = template.map((s) => ({
    title: s.title,
    guidance: s.guidance,
    points: [
      ...(s.eligibility ? o.eligibility.map((e) => `Demonstrate: ${e}`) : []),
      ...requirementGroups.filter((g) => s.themes.includes(g.theme)).flatMap((g) => g.items.map((i) => `Address: ${i}`)),
    ],
  }));
  // Themes without a template section get their own section, so nothing is dropped.
  for (const g of requirementGroups.filter((x) => !covered.has(x.theme)))
    outline.push({
      title: g.label,
      guidance:
        g.theme === "general"
          ? "Requirements the rules could not place in a section — decide where each belongs."
          : `Requirements grouped under ${g.label.toLowerCase()} — place them where the official form asks for them.`,
      points: g.items.map((i) => `Address: ${i}`),
    });
  outline.push({
    title: "Annexes",
    guidance: o.requiredDocuments.length ? "Documents listed in the record." : "No documents are listed in the record — check the official template.",
    points: o.requiredDocuments,
  });

  return { headline, requirementGroups, eligibility, compliance, documents: o.requiredDocuments, outline, caveats };
}

export function outlineToMarkdown(o: Opportunity, review: TenderReview): string {
  const lines = [
    `# Draft application outline — ${o.title}`,
    "",
    `${o.organization}${o.programme ? ` · ${o.programme}` : ""}`,
    `Official call page: ${o.officialUrl}`,
    "",
    "> Preview generated from the structured record by rules, not by an AI model. It is not an official template — follow the call's own application form and read the official call documents.",
    "",
  ];
  review.outline.forEach((s, i) => {
    lines.push(`## ${i + 1}. ${s.title}`, "", `_${s.guidance}_`, "");
    if (s.points.length) s.points.forEach((p) => lines.push(`- ${p}`));
    else lines.push("- (No record items mapped to this section.)");
    lines.push("");
  });
  return lines.join("\n").trimEnd() + "\n";
}
