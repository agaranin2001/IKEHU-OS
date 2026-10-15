/**
 * Supplier explorer — view-model helpers (pure, server-safe).
 * Formatting rules: unknown values read "Not published", never 0; every
 * product figure is a manufacturer claim unless its basis says otherwise.
 */
import type { EquipmentCategory, EquipmentProduct, SpecValue, TechnologySupplier } from "@/domain/types";
import type { SupplierQuery } from "@/services/contracts";
import { fmtMoney, fmtNum } from "@/lib/format";

export type CatalogueProduct = EquipmentProduct & { supplierName: string; supplierCountry: string };

export const MAX_COMPARE = 4;
export const NOT_PUBLISHED = "Not published";

export type PriceFilter = "" | "public" | "quotation";

export interface CatalogueFilters {
  search: string;
  categories: EquipmentCategory[];
  country: string;
  price: PriceFilter;
}

export const EMPTY_FILTERS: CatalogueFilters = { search: "", categories: [], country: "", price: "" };

export const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "", label: "Any price availability" },
  { value: "public", label: "Public price" },
  { value: "quotation", label: "Quotation required" },
];

export function toQuery(f: CatalogueFilters, search = f.search): SupplierQuery {
  return {
    search: search.trim() || undefined,
    categories: f.categories.length ? f.categories : undefined,
    countries: f.country ? [f.country] : undefined,
    priceAvailability: f.price || undefined,
  };
}

export const activeFilterCount = (f: CatalogueFilters) => f.categories.length + (f.country ? 1 : 0) + (f.price ? 1 : 0);

export const SPEC_BASIS: Record<SpecValue["basis"], string> = {
  "vendor-claim": "Vendor claim",
  "independently-tested": "Independently tested",
  derived: "Derived",
};

export function fmtCapacity(p: Pick<EquipmentProduct, "capacity">): string {
  if (!p.capacity) return NOT_PUBLISHED;
  const v = p.capacity.value;
  return `${fmtNum(v, v < 10 && !Number.isInteger(v) ? 1 : 0)} ${p.capacity.unit}`;
}

export const fmtEfficiency = (v: number | null) => (v == null ? NOT_PUBLISHED : `${fmtNum(v, 1)} kWh/kg`);
export const fmtPressure = (v: number | null) => (v == null ? NOT_PUBLISHED : `${fmtNum(v)} bar(g)`);
export const fmtSpec = (s: SpecValue) => `${s.value}${s.unit ? ` ${s.unit}` : ""}`;

export function fmtPublicPrice(p: EquipmentProduct): string | null {
  if (!p.publicPrice) return null;
  return fmtMoney({ amount: p.publicPrice.amount, currency: p.publicPrice.currency });
}

export const withSupplier = (s: TechnologySupplier, p: EquipmentProduct): CatalogueProduct => ({
  ...p,
  supplierName: s.companyName,
  supplierCountry: s.country,
});

/** Lowest published kWh/kg among the given products; null when fewer than two publish it. */
export function bestEfficiencyId(products: EquipmentProduct[]): string | null {
  // Estimated values (lib/estimates.ts) are not published figures.
  const published = products.filter((p) => p.efficiencyKwhPerKg != null && !p.estimated?.includes("efficiencyKwhPerKg"));
  if (published.length < 2) return null;
  return published.reduce((best, p) => (p.efficiencyKwhPerKg! < best.efficiencyKwhPerKg! ? p : best)).id;
}

/** Union of spec labels in first-seen order. */
export function specLabelUnion(products: EquipmentProduct[]): string[] {
  const seen = new Set<string>();
  for (const p of products) for (const s of p.specs) seen.add(s.label);
  return [...seen];
}

export function countBy<T, K extends string>(items: T[], key: (t: T) => K | K[]): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  for (const it of items) {
    const k = key(it);
    for (const one of Array.isArray(k) ? k : [k]) out[one] = (out[one] ?? 0) + 1;
  }
  return out;
}

export const uniqueSupplierNames = (products: CatalogueProduct[]) => [...new Set(products.map((p) => p.supplierName))];

export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
