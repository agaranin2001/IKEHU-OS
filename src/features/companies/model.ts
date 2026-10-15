/**
 * Pure helpers for the Investment & Company Intelligence module.
 * No React, no I/O — everything here derives from the public records.
 */
import type { Company, Investor, PublicDeal } from "@/domain/types";
import type { Tone } from "@/lib/labels";

export type DealKind = PublicDeal["kind"];

export const COMPANY_TABS = ["companies", "investors", "deals", "diligence"] as const;
export type CompaniesTab = (typeof COMPANY_TABS)[number];
export const isCompaniesTab = (v: unknown): v is CompaniesTab => typeof v === "string" && (COMPANY_TABS as readonly string[]).includes(v);

export const DEAL_KIND: Record<DealKind, { label: string; tone: Tone }> = {
  equity: { label: "Equity", tone: "violet" },
  debt: { label: "Debt", tone: "info" },
  grant: { label: "Grant", tone: "ok" },
  acquisition: { label: "Acquisition", tone: "warn" },
  "joint-venture": { label: "Joint venture", tone: "info" },
  partnership: { label: "Partnership", tone: "neutral" },
  offtake: { label: "Offtake", tone: "ok" },
  "supply-contract": { label: "Supply contract", tone: "neutral" },
};

export const DEAL_KINDS = Object.keys(DEAL_KIND) as DealKind[];

export type EntityKind = "company" | "investor";

export interface EntityRef {
  id: string;
  name: string;
  kind: EntityKind;
}

/** Profile URL for a company or investor id (ids are prefixed `co-` / `inv-`). */
export const profileHref = (id: string) => `/app/companies/${encodeURIComponent(id)}`;

export const entityKindOf = (id: string): EntityKind | null => (id.startsWith("inv-") ? "investor" : id.startsWith("co-") ? "company" : null);

const normName = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(gmbh|ag|asa|ab|sa|se|plc|inc|ltd|llc|bv|nv|spa|as|a\/s|co|corp|corporation|group|holding|holdings|kgaa)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Index of record names, used to link a free-text counterparty to its
 * profile when the counterparty is itself a record in the dataset. Only exact
 * (normalised) name matches are linked — no fuzzy guessing.
 */
export function buildNameIndex(companies: Company[], investors: Investor[]): Map<string, EntityRef> {
  const idx = new Map<string, EntityRef>();
  const add = (ref: EntityRef) => {
    // Full name, plus the name without a parenthetical ("European Investment Bank (EIB)").
    for (const alias of [ref.name, ref.name.replace(/\s*\([^)]*\)\s*/g, " ")]) {
      const k = normName(alias);
      if (k && !idx.has(k)) idx.set(k, ref);
    }
  };
  for (const c of companies) add({ id: c.id, name: c.name, kind: "company" });
  for (const i of investors) add({ id: i.id, name: i.name, kind: "investor" });
  return idx;
}

export const lookupName = (idx: Map<string, EntityRef>, name: string) => idx.get(normName(name)) ?? null;

export interface DealRow {
  /** Stable key for React lists. */
  key: string;
  year: number;
  kind: DealKind;
  description: string;
  counterparty: string;
  amount: PublicDeal["amount"];
  /** True when `amount` is an estimate (lib/estimates.ts). */
  amountEstimated?: boolean;
  source: PublicDeal["source"];
  /** Records under which this deal is documented (company and/or investor). */
  recordedUnder: EntityRef[];
}

/**
 * Flattens every publicly documented deal from companies and investors into
 * one list. A deal documented under both a company and an investor record
 * (same source document, year and kind) is merged into one row, so a single
 * transaction is not counted twice.
 */
export function flattenDeals(companies: Company[], investors: Investor[]): DealRow[] {
  const rows = new Map<string, DealRow>();
  const add = (deal: PublicDeal, owner: EntityRef) => {
    const base = `${deal.source.url}|${deal.year}|${deal.kind}`;
    let key = base;
    let n = 1;
    // Never merge two deals that belong to the same record.
    while (rows.has(key) && rows.get(key)!.recordedUnder.some((r) => r.id === owner.id)) key = `${base}#${n++}`;
    const existing = rows.get(key);
    if (existing) {
      existing.recordedUnder.push(owner);
      const sourced = !deal.estimated?.includes("amount");
      if (deal.amount && (!existing.amount || (existing.amountEstimated && sourced))) {
        existing.amount = deal.amount;
        existing.amountEstimated = !sourced;
      }
      return;
    }
    rows.set(key, {
      key: `${owner.id}:${deal.id}`,
      year: deal.year,
      kind: deal.kind,
      description: deal.description,
      counterparty: deal.counterparty,
      amount: deal.amount,
      amountEstimated: deal.estimated?.includes("amount"),
      source: deal.source,
      recordedUnder: [owner],
    });
  };
  for (const c of companies) for (const d of c.deals) add(d, { id: c.id, name: c.name, kind: "company" });
  for (const i of investors) for (const d of i.publicInvestments) add(d, { id: i.id, name: i.name, kind: "investor" });
  return [...rows.values()];
}

export const sortByYear = <T extends { year: number }>(items: T[], dir: "desc" | "asc" = "desc") =>
  [...items].sort((a, b) => (dir === "desc" ? b.year - a.year : a.year - b.year));

export function countBy<T, K extends string>(items: T[], key: (t: T) => K | K[]): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  for (const it of items) {
    const k = key(it);
    for (const v of Array.isArray(k) ? k : [k]) out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Preliminary due diligence                                           */
/* ------------------------------------------------------------------ */

export type DdItemState =
  /** Answered from the public record (with the value shown). */
  | "public"
  /** The record carries the field but it is not disclosed publicly. */
  | "missing"
  /** Cannot be answered from public information. */
  | "data-room";

export interface DdItem {
  id: string;
  label: string;
  state: DdItemState;
  /** Value taken verbatim from the record, when state is "public". */
  value?: string;
  /** Optional list of supporting values (e.g. documented partnerships). */
  list?: string[];
  note?: string;
}

export interface DdWorkstream {
  id: string;
  title: string;
  items: DdItem[];
}

const pub = (id: string, label: string, value: string | null | undefined, extra?: Partial<DdItem>): DdItem =>
  value && value.trim()
    ? { id, label, state: "public", value, ...extra }
    : { id, label, state: "missing", note: "Field exists in the record but is not publicly disclosed.", ...extra };

const room = (id: string, label: string, note?: string): DdItem => ({ id, label, state: "data-room", note });

const dealLine = (d: PublicDeal) => `${d.year} · ${DEAL_KIND[d.kind].label} · ${d.counterparty}`;

/**
 * Builds the preliminary DD checklist for a company. Items the dataset can
 * answer are filled from the record; everything else is explicitly marked as
 * requiring a data room. Nothing is estimated or inferred.
 */
export function buildDdChecklist(c: Company, supplier?: { manufacturingCapacity?: string; companyName: string } | null): DdWorkstream[] {
  const deals = sortByYear(c.deals);
  const of = (...kinds: DealKind[]) => deals.filter((d) => kinds.includes(d.kind));
  const partnerships = of("partnership", "joint-venture");
  const commercial = of("offtake", "supply-contract");
  const financing = of("equity", "debt", "grant");
  const acquisitions = of("acquisition");

  const countItem = (id: string, label: string, ds: PublicDeal[], none: string): DdItem =>
    ds.length
      ? { id, label, state: "public", value: `${ds.length} documented`, list: ds.map(dealLine) }
      : { id, label, state: "missing", note: none };

  return [
    {
      id: "corporate",
      title: "Corporate & ownership",
      items: [
        pub("name", "Company name", c.name),
        pub("hq", "Headquarters", c.headquarters ? `${c.headquarters}${c.countryName ? `, ${c.countryName}` : ""}` : null),
        pub("ownership", "Ownership structure (public statement)", c.ownership),
        pub("founded", "Year founded", c.founded != null && !c.estimated?.includes("founded") ? String(c.founded) : null),
        countItem("acq", "Documented acquisitions", acquisitions, "No acquisitions documented in public sources."),
        room("captable", "Shareholder register & cap table"),
        room("group", "Group structure, subsidiaries & UBOs"),
      ],
    },
    {
      id: "technology",
      title: "Technology & IP",
      items: [
        pub("focus", "Technology focus", c.technologyFocus.join(", ")),
        pub("catalogue", "Equipment listed in supplier catalogue", c.supplierId ? `Yes — ${supplier?.companyName ?? "catalogue entry"}` : null, {
          note: c.supplierId ? undefined : "Not listed in the platform's supplier catalogue.",
        }),
        room("patents", "Patent portfolio & freedom to operate", "Patent search is a planned feature."),
        room("validation", "Independent performance / durability test data"),
        room("roadmap", "Technology roadmap & R&D pipeline"),
      ],
    },
    {
      id: "commercial",
      title: "Commercial traction",
      items: [
        countItem("partnerships", "Documented partnerships & JVs", partnerships, "No partnerships documented in public sources."),
        countItem("contracts", "Documented offtake & supply contracts", commercial, "No offtake or supply contracts documented in public sources."),
        room("backlog", "Order backlog & pipeline"),
        room("customers", "Customer references & concentration"),
      ],
    },
    {
      id: "manufacturing",
      title: "Manufacturing & supply chain",
      items: [
        pub("capacity", "Stated manufacturing capacity", supplier?.manufacturingCapacity, {
          note: supplier?.manufacturingCapacity ? "Company statement — vendor claim, not independently verified." : "Not stated in public sources.",
        }),
        room("suppliers", "Critical component suppliers & single-source exposure"),
        room("quality", "Quality certifications & factory acceptance records"),
        room("utilisation", "Factory utilisation & ramp-up plan"),
      ],
    },
    {
      id: "financial",
      title: "Financial",
      items: [
        countItem("funding", "Documented equity, debt & grants", financing, "No financing rounds documented in public sources."),
        room("accounts", "Audited financial statements"),
        room("revenue", "Revenue, margins & cash runway", "The platform does not estimate revenue or valuation."),
        room("liabilities", "Debt, guarantees & contingent liabilities"),
      ],
    },
    {
      id: "esg",
      title: "ESG & permits",
      items: [
        room("permits", "Site permits & environmental conditions"),
        room("esg", "ESG policies, emissions reporting & certifications"),
        room("hse", "HSE record & incident history"),
      ],
    },
    {
      id: "legal",
      title: "Legal",
      items: [
        pub("website", "Official website", c.website),
        room("litigation", "Litigation & disputes"),
        room("contracts", "Material contracts & change-of-control clauses"),
        room("screening", "Sanctions & adverse-media screening"),
      ],
    },
  ];
}
