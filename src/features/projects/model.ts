/**
 * Pure helpers for the Project Intelligence feature: ordering, labels,
 * map-point mapping, sorting and links. No React, no I/O.
 */
import type { MapPoint, MapView } from "@/components/map/WorldMap";
import type {
  DatasetInfo,
  ElectrolyserTech,
  EndUse,
  HydrogenProject,
  ProductionPathway,
  ProductionTechnology,
  ProjectStatus,
  RegionCode,
} from "@/domain/types";
import { fmtDate, fmtMw, fmtNum } from "@/lib/format";
import { END_USE, PROJECT_STATUS } from "@/lib/labels";

export const STATUS_ORDER: ProjectStatus[] = (Object.keys(PROJECT_STATUS) as ProjectStatus[]).sort(
  (a, b) => PROJECT_STATUS[a].order - PROJECT_STATUS[b].order,
);

export const TECHNOLOGIES: ProductionTechnology[] = ["PEM", "Alkaline", "SOEC", "AEM", "SMR+CCS", "ATR+CCS", "Mixed", "Undisclosed"];
export const PATHWAYS: ProductionPathway[] = ["green", "blue", "low-carbon-grid", "other"];
export const REGIONS: RegionCode[] = ["Europe", "Middle East", "Africa", "Asia-Pacific", "North America", "Latin America"];
export const END_USES = Object.keys(END_USE) as EndUse[];

const ELECTROLYTIC: ElectrolyserTech[] = ["PEM", "Alkaline", "SOEC", "AEM"];
export const isElectrolyserTech = (t: ProductionTechnology): t is ElectrolyserTech => (ELECTROLYTIC as string[]).includes(t);

export const projectHref = (id: string) => `/app/projects/${encodeURIComponent(id)}`;
export const projectDeepLink = (id: string) => `/app/projects?project=${encodeURIComponent(id)}`;

/** LCOH calculator link — only when capacity is disclosed and the technology is electrolytic. */
export function calculatorHref(p: HydrogenProject): string | null {
  if (p.capacityMw == null || p.capacityMw <= 0 || !isElectrolyserTech(p.technology)) return null;
  const q = new URLSearchParams({ capacity: String(p.capacityMw), technology: p.technology });
  return `/app/calculator?${q.toString()}`;
}

export function regionToView(region: RegionCode): MapView {
  switch (region) {
    case "Europe":
      return "europe";
    case "Middle East":
    case "Africa":
      return "mena";
    case "Asia-Pacific":
      return "asia";
    default:
      return "americas";
  }
}

export function toMapPoints(projects: HydrogenProject[]): MapPoint[] {
  return projects.map((p) => ({
    id: p.id,
    lat: p.location.lat,
    lon: p.location.lon,
    value: p.capacityMw,
    color: PROJECT_STATUS[p.status].color,
    label: p.name,
    sub: `${p.countryName} · ${fmtMw(p.capacityMw)}`,
  }));
}

/** Largest disclosed capacity — used to keep marker sizes stable across filters. */
export const maxCapacity = (projects: HydrogenProject[]) => Math.max(1, ...projects.map((p) => p.capacityMw ?? 0));

/** "1,250" + "MW" or "1.25" + "GW" for KPI tiles. */
export function splitMw(mw: number): { value: string; unit: string } {
  if (mw >= 1000) return { value: fmtNum(mw / 1000, mw >= 10000 ? 1 : 2), unit: "GW" };
  return { value: fmtNum(mw, mw > 0 && mw < 10 ? 1 : 0), unit: "MW" };
}

export const fidLabel = (v: boolean | null) => (v === true ? "Taken" : v === false ? "Not taken" : "Undisclosed");
export const commissioningLabel = (v: string | null) => v ?? "Not confirmed";
export const outputLabel = (t: number | null) => (t == null ? "Undisclosed" : `${fmtNum(t)} t/yr`);

/** First 4-digit year in a free-text commissioning target ("H2 2026" → 2026). */
export function commissioningYear(v: string | null): number | null {
  const m = v?.match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

export function datasetNote(info: DatasetInfo | undefined, what: string) {
  if (!info) return what;
  return `${what} · dataset v${info.version} compiled ${fmtDate(info.compiledAt)}`;
}

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

export type SortKey = "name" | "country" | "developer" | "technology" | "pathway" | "capacity" | "status" | "commissioning" | "announced";
export interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

export const DEFAULT_SORT: SortState = { key: "capacity", dir: "desc" };

export const SORT_PRESETS: { value: string; label: string; sort: SortState }[] = [
  { value: "capacity-desc", label: "Capacity: largest first", sort: { key: "capacity", dir: "desc" } },
  { value: "capacity-asc", label: "Capacity: smallest first", sort: { key: "capacity", dir: "asc" } },
  { value: "name", label: "Name A–Z", sort: { key: "name", dir: "asc" } },
  { value: "announced-desc", label: "Most recently announced", sort: { key: "announced", dir: "desc" } },
  { value: "commissioning-asc", label: "Commissioning: earliest first", sort: { key: "commissioning", dir: "asc" } },
  { value: "status", label: "Status (operational first)", sort: { key: "status", dir: "asc" } },
];

export const sortPresetValue = (s: SortState) => SORT_PRESETS.find((p) => p.sort.key === s.key && p.sort.dir === s.dir)?.value ?? "custom";

/** Matching service-side sort, when one exists. */
export function serviceSort(s: SortState): "capacity-desc" | "capacity-asc" | "name" | "announced-desc" | undefined {
  if (s.key === "capacity") return s.dir === "desc" ? "capacity-desc" : "capacity-asc";
  if (s.key === "name" && s.dir === "asc") return "name";
  if (s.key === "announced" && s.dir === "desc") return "announced-desc";
  return undefined;
}

/** Presentation-level sort. Unknown values (null capacity, unconfirmed dates) always sort last. */
export function sortProjects(list: HydrogenProject[], s: SortState): HydrogenProject[] {
  const sign = s.dir === "asc" ? 1 : -1;
  const val = (p: HydrogenProject): string | number | null => {
    switch (s.key) {
      case "name":
        return p.name;
      case "country":
        return p.countryName;
      case "developer":
        return p.developer;
      case "technology":
        return p.technology;
      case "pathway":
        return p.pathway;
      case "capacity":
        return p.capacityMw;
      case "status":
        return PROJECT_STATUS[p.status].order;
      case "commissioning":
        return commissioningYear(p.expectedCommissioning);
      case "announced":
        return p.announcedYear;
    }
  };
  return [...list].sort((a, b) => {
    const av = val(a);
    const bv = val(b);
    if (av == null && bv == null) return a.name.localeCompare(b.name);
    if (av == null) return 1;
    if (bv == null) return -1;
    const c = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return c === 0 ? a.name.localeCompare(b.name) : c * sign;
  });
}

/* ------------------------------------------------------------------ */
/* Related records                                                      */
/* ------------------------------------------------------------------ */

export function relatedProjects(p: HydrogenProject, all: HydrogenProject[], limit = 6): { project: HydrogenProject; reason: string }[] {
  const out: { project: HydrogenProject; reason: string; score: number }[] = [];
  for (const o of all) {
    if (o.id === p.id) continue;
    const sameDev = o.developer.toLowerCase() === p.developer.toLowerCase();
    const sameCountry = o.country === p.country;
    if (!sameDev && !sameCountry) continue;
    out.push({
      project: o,
      reason: sameDev && sameCountry ? `Same developer · ${o.countryName}` : sameDev ? "Same developer" : `Also in ${o.countryName}`,
      score: (sameDev ? 2 : 0) + (sameCountry ? 1 : 0),
    });
  }
  return out
    .sort((a, b) => b.score - a.score || (b.project.capacityMw ?? -1) - (a.project.capacityMw ?? -1))
    .slice(0, limit)
    .map(({ project, reason }) => ({ project, reason }));
}
