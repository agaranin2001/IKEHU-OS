/**
 * Pure filtering & sorting used by the mock providers (and reusable for
 * client-side refinement of API results). No React, no I/O.
 */
import type { Company, EquipmentProduct, HydrogenProject, Investor, Opportunity, TechnologySupplier } from "@/domain/types";
import type { OpportunityQuery, ProjectQuery, SupplierQuery } from "@/services/contracts";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const matches = (needle: string | undefined, ...hay: (string | undefined | null)[]) => {
  if (!needle?.trim()) return true;
  const n = norm(needle.trim());
  return hay.some((h) => h && norm(h).includes(n));
};
const inSet = <T,>(set: T[] | undefined, v: T) => !set || set.length === 0 || set.includes(v);

export function filterProjects(items: HydrogenProject[], q: ProjectQuery = {}): HydrogenProject[] {
  const out = items.filter(
    (p) =>
      matches(q.search, p.name, p.developer, p.countryName, p.location.label, p.partners.join(" "), p.electrolyserSupplier) &&
      inSet(q.regions, p.region) &&
      inSet(q.countries, p.country) &&
      inSet(q.statuses, p.status) &&
      inSet(q.technologies, p.technology) &&
      inSet(q.pathways, p.pathway) &&
      (!q.endUses?.length || q.endUses.some((u) => p.endUses.includes(u))) &&
      matches(q.developer, p.developer) &&
      (q.minMw == null || (p.capacityMw ?? -1) >= q.minMw) &&
      (q.maxMw == null || (p.capacityMw ?? Infinity) <= q.maxMw) &&
      (q.announcedFrom == null || p.announcedYear >= q.announcedFrom) &&
      (q.announcedTo == null || p.announcedYear <= q.announcedTo) &&
      (!q.fidOnly || p.finalInvestmentDecision === true),
  );
  const sort = q.sort ?? "capacity-desc";
  return out.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "announced-desc") return b.announcedYear - a.announcedYear;
    const av = a.capacityMw ?? -1;
    const bv = b.capacityMw ?? -1;
    return sort === "capacity-asc" ? av - bv : bv - av;
  });
}

export function filterSuppliers(items: TechnologySupplier[], q: SupplierQuery = {}): TechnologySupplier[] {
  return items.filter(
    (s) =>
      matches(q.search, s.companyName, s.countryName, s.description, s.products.map((p) => p.model).join(" ")) &&
      (!q.categories?.length || q.categories.some((c) => s.categories.includes(c))) &&
      inSet(q.countries, s.country) &&
      (!q.priceAvailability ||
        (q.priceAvailability === "public" ? s.products.some((p) => p.publicPrice) : s.products.some((p) => p.quotationRequired))),
  );
}

export function filterProducts<T extends EquipmentProduct & { supplierName: string; supplierCountry: string }>(items: T[], q: SupplierQuery = {}): T[] {
  return items.filter(
    (p) =>
      matches(q.search, p.model, p.supplierName, p.description) &&
      inSet(q.categories, p.category) &&
      inSet(q.countries, p.supplierCountry) &&
      (!q.priceAvailability || (q.priceAvailability === "public" ? !!p.publicPrice : p.quotationRequired)),
  );
}

export function filterOpportunities(items: Opportunity[], q: OpportunityQuery = {}): Opportunity[] {
  const statusOrder: Record<Opportunity["status"], number> = { open: 0, upcoming: 1, closed: 2, historical: 3 };
  return items
    .filter(
      (o) =>
        matches(q.search, o.title, o.organization, o.programme, o.summary, o.countryName) &&
        inSet(q.types, o.type) &&
        inSet(q.statuses, o.status) &&
        inSet(q.countries, o.country) &&
        (!q.technology || o.technologies.some((t) => matches(q.technology, t))) &&
        (!q.deadlineBefore || (o.deadline != null && o.deadline <= q.deadlineBefore)),
    )
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
}

export function filterCompanies(items: Company[], q: { search?: string; categories?: Company["categories"] } = {}): Company[] {
  return items.filter(
    (c) =>
      matches(q.search, c.name, c.countryName, c.description, c.technologyFocus.join(" ")) &&
      (!q.categories?.length || q.categories.some((k) => c.categories.includes(k))),
  );
}

export function filterInvestors(items: Investor[], q: { search?: string; types?: Investor["type"][] } = {}): Investor[] {
  return items.filter((i) => matches(q.search, i.name, i.description, i.investmentFocus.join(" "), i.geography.join(" ")) && inSet(q.types, i.type));
}
