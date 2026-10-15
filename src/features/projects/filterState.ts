/**
 * UI filter state for Project Intelligence and its mapping to the
 * repository `ProjectQuery`. Text inputs are kept as strings so partially
 * typed values ("1.") don't fight the user.
 */
import type { EndUse, ProductionPathway, ProductionTechnology, ProjectStatus, RegionCode } from "@/domain/types";
import type { ProjectQuery } from "@/services/contracts";
import { fmtNum } from "@/lib/format";
import { END_USE, PATHWAY, PROJECT_STATUS } from "@/lib/labels";

export interface ProjectFilterState {
  search: string;
  regions: RegionCode[];
  countries: string[];
  statuses: ProjectStatus[];
  technologies: ProductionTechnology[];
  pathways: ProductionPathway[];
  endUses: EndUse[];
  developer: string;
  minMw: string;
  maxMw: string;
  announcedFrom: string;
  announcedTo: string;
  fidOnly: boolean;
}

export const EMPTY_FILTERS: ProjectFilterState = {
  search: "",
  regions: [],
  countries: [],
  statuses: [],
  technologies: [],
  pathways: [],
  endUses: [],
  developer: "",
  minMw: "",
  maxMw: "",
  announcedFrom: "",
  announcedTo: "",
  fidOnly: false,
};

/** Capacity presets. Upper bounds sit just below the next bucket so a 100 MW project appears in one bucket only. */
export const CAPACITY_BUCKETS: { value: string; label: string; min: string; max: string }[] = [
  { value: "lt10", label: "< 10 MW", min: "", max: "9.999" },
  { value: "10-100", label: "10–99 MW", min: "10", max: "99.999" },
  { value: "100-500", label: "100–499 MW", min: "100", max: "499.999" },
  { value: "500-1000", label: "500–999 MW", min: "500", max: "999.999" },
  { value: "gte1000", label: "≥ 1 GW", min: "1000", max: "" },
];

export const activeBucket = (f: Pick<ProjectFilterState, "minMw" | "maxMw">) =>
  CAPACITY_BUCKETS.find((b) => b.min === f.minMw && b.max === f.maxMw)?.value ?? null;

const num = (s: string): number | undefined => {
  if (!s.trim()) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function capacityError(f: Pick<ProjectFilterState, "minMw" | "maxMw">): string | undefined {
  if (f.minMw.trim() && num(f.minMw) == null) return "Enter a positive number";
  if (f.maxMw.trim() && num(f.maxMw) == null) return "Enter a positive number";
  const a = num(f.minMw);
  const b = num(f.maxMw);
  if (a != null && b != null && a > b) return "Minimum is above maximum";
  return undefined;
}

export function toQuery(f: ProjectFilterState): ProjectQuery {
  const capacityValid = !capacityError(f);
  const from = num(f.announcedFrom);
  const to = num(f.announcedTo);
  const q: ProjectQuery = {
    search: f.search.trim() || undefined,
    regions: f.regions.length ? f.regions : undefined,
    countries: f.countries.length ? f.countries : undefined,
    statuses: f.statuses.length ? f.statuses : undefined,
    technologies: f.technologies.length ? f.technologies : undefined,
    pathways: f.pathways.length ? f.pathways : undefined,
    endUses: f.endUses.length ? f.endUses : undefined,
    developer: f.developer || undefined,
    minMw: capacityValid ? num(f.minMw) : undefined,
    maxMw: capacityValid ? num(f.maxMw) : undefined,
    announcedFrom: from,
    announcedTo: to,
    fidOnly: f.fidOnly || undefined,
  };
  // Drop undefined keys so the cache key stays stable.
  return Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined)) as ProjectQuery;
}

export interface FilterTag {
  key: string;
  label: string;
  remove: (f: ProjectFilterState) => ProjectFilterState;
}

const mwText = (s: string) => {
  const n = Number(s);
  return Number.isInteger(n) ? fmtNum(n) : fmtNum(n, 1);
};

const without = <T,>(arr: T[], v: T) => arr.filter((x) => x !== v);

/** One removable tag per active filter value. Its length is the active-filter count. */
export function filterTags(f: ProjectFilterState, countryName: (code: string) => string): FilterTag[] {
  const tags: FilterTag[] = [];
  if (f.search.trim()) tags.push({ key: "search", label: `“${f.search.trim()}”`, remove: (s) => ({ ...s, search: "" }) });
  f.statuses.forEach((v) => tags.push({ key: `st-${v}`, label: PROJECT_STATUS[v].label, remove: (s) => ({ ...s, statuses: without(s.statuses, v) }) }));
  f.regions.forEach((v) => tags.push({ key: `rg-${v}`, label: v, remove: (s) => ({ ...s, regions: without(s.regions, v) }) }));
  f.countries.forEach((v) => tags.push({ key: `ct-${v}`, label: countryName(v), remove: (s) => ({ ...s, countries: without(s.countries, v) }) }));
  f.technologies.forEach((v) => tags.push({ key: `tc-${v}`, label: v, remove: (s) => ({ ...s, technologies: without(s.technologies, v) }) }));
  f.pathways.forEach((v) => tags.push({ key: `pw-${v}`, label: PATHWAY[v], remove: (s) => ({ ...s, pathways: without(s.pathways, v) }) }));
  f.endUses.forEach((v) => tags.push({ key: `eu-${v}`, label: END_USE[v], remove: (s) => ({ ...s, endUses: without(s.endUses, v) }) }));
  if (f.developer) tags.push({ key: "dev", label: f.developer, remove: (s) => ({ ...s, developer: "" }) });
  if ((f.minMw.trim() || f.maxMw.trim()) && !capacityError(f)) {
    const bucket = CAPACITY_BUCKETS.find((b) => b.value === activeBucket(f));
    const label = bucket
      ? bucket.label
      : f.minMw.trim() && f.maxMw.trim()
        ? `${mwText(f.minMw)}–${mwText(f.maxMw)} MW`
        : f.minMw.trim()
          ? `≥ ${mwText(f.minMw)} MW`
          : `≤ ${mwText(f.maxMw)} MW`;
    tags.push({ key: "mw", label, remove: (s) => ({ ...s, minMw: "", maxMw: "" }) });
  }
  if (f.announcedFrom || f.announcedTo) {
    const label = f.announcedFrom && f.announcedTo ? `Announced ${f.announcedFrom}–${f.announcedTo}` : f.announcedFrom ? `Announced ${f.announcedFrom} or later` : `Announced ${f.announcedTo} or earlier`;
    tags.push({ key: "yr", label, remove: (s) => ({ ...s, announcedFrom: "", announcedTo: "" }) });
  }
  if (f.fidOnly) tags.push({ key: "fid", label: "FID taken", remove: (s) => ({ ...s, fidOnly: false }) });
  return tags;
}
