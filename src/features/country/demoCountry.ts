/**
 * Deterministic demo content for the country sidebar. It only fills sections
 * the sourced datasets leave empty, is seeded by country name (stable across
 * renders) and uses generic names — no real companies, laws or projects.
 * Kept separate from the datasets so it can be switched off in one place.
 */
import type { CompanyCategory, OpportunityStatus, OpportunityType, ProjectStatus } from "@/domain/types";
import { SNAPSHOT_DATE } from "@/lib/format";

export interface DemoProject {
  id: string;
  name: string;
  developer: string;
  status: ProjectStatus;
  capacityMw: number;
  year: number;
}
export interface DemoCompany {
  id: string;
  name: string;
  categories: CompanyCategory[];
}
export interface DemoTender {
  id: string;
  title: string;
  type: OpportunityType;
  status: OpportunityStatus;
  deadline: string;
}
export interface DemoPolicy {
  id: string;
  title: string;
  kind: string;
  year: number;
}
export interface DemoCountry {
  projects: DemoProject[];
  /** 24 monthly day-ahead averages, €/MWh, ending at the snapshot month. */
  prices: { t: string; v: number }[];
  companies: DemoCompany[];
  tenders: DemoTender[];
  policies: DemoPolicy[];
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** mulberry32 PRNG. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROJECT_SITES = ["Port", "Coastal", "Northern", "Southern", "Valley", "Industrial Park", "Gulf", "Highlands", "Delta", "Inland"];
const PROJECT_KINDS = ["Green Hydrogen Hub", "Electrolysis Plant", "Green Ammonia Project", "Hydrogen Valley", "Power-to-X Facility", "e-Methanol Plant"];
const DEVELOPERS = ["Meridian H2", "Atlas Renewables", "Bluecrest Energy", "Solvane Power", "Northgate Hydrogen", "Terravolt", "Corvex Energy", "Halden Green Gas"];
const COMPANY_PREFIX = ["Nova", "Helio", "Aero", "Hydra", "Volt", "Gridline", "Polar", "Zenith", "Cobalt", "Verdant"];
const COMPANY_SUFFIX: { suffix: string; category: CompanyCategory }[] = [
  { suffix: "Electrolysers", category: "electrolyser-manufacturer" },
  { suffix: "Fuel Cells", category: "fuel-cell-manufacturer" },
  { suffix: "Gas Logistics", category: "storage-transport" },
  { suffix: "Engineering", category: "epc-contractor" },
  { suffix: "Hydrogen Developments", category: "project-developer" },
  { suffix: "H2 Labs", category: "technology-startup" },
  { suffix: "Chemicals", category: "industrial-offtaker" },
];
const TENDERS: { title: string; type: OpportunityType }[] = [
  { title: "EPC services for a 100 MW electrolysis plant", type: "public-tender" },
  { title: "Renewable hydrogen production support scheme", type: "national-fund" },
  { title: "Hydrogen refuelling network pilot", type: "public-tender" },
  { title: "Green hydrogen offtake auction", type: "auction" },
  { title: "Electrolyser innovation grant call", type: "innovation-grant" },
  { title: "Hydrogen pipeline feasibility study", type: "public-tender" },
  { title: "Concessional financing for clean hydrogen projects", type: "public-financing" },
];
const POLICIES: { title: string; kind: string }[] = [
  { title: "National hydrogen strategy", kind: "Strategy" },
  { title: "Renewable hydrogen certification scheme", kind: "Regulation" },
  { title: "Grid-fee exemption for electrolysers", kind: "Act" },
  { title: "Hydrogen infrastructure planning framework", kind: "Act" },
  { title: "Clean fuels mandate for industry and transport", kind: "Regulation" },
  { title: "Carbon contracts for difference programme", kind: "Programme" },
];
const STATUSES: ProjectStatus[] = ["operational", "under-construction", "planned", "planned", "announced", "announced", "delayed"];

const pick = <T>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
function pickN<T>(r: () => number, arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Demo content for one country (stable for a given name). */
export function demoCountry(name: string): DemoCountry {
  const r = rng(hash(name));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const projects = pickN(r, PROJECT_SITES, 2 + Math.floor(r() * 4)).map((site, i) => ({
    id: `${slug}-p${i}`,
    name: `${name} ${site} ${pick(r, PROJECT_KINDS)}`,
    developer: pick(r, DEVELOPERS),
    status: pick(r, STATUSES),
    capacityMw: Math.round((10 + r() ** 2 * 790) / 5) * 5,
    year: 2025 + Math.floor(r() * 6),
  }));

  // Seasonal day-ahead profile: winter peaks, noise, a level set per country.
  const base = 35 + r() * 70;
  const end = new Date(`${SNAPSHOT_DATE.slice(0, 7)}-01T00:00:00Z`);
  const prices = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(end);
    d.setUTCMonth(end.getUTCMonth() - (24 - i));
    const season = Math.cos(((d.getUTCMonth() + 0.5) / 12) * 2 * Math.PI);
    return { t: d.toISOString().slice(0, 10), v: Math.max(5, Math.round((base * (1 + 0.22 * season) + (r() - 0.5) * base * 0.25) * 100) / 100) };
  });

  const companies = pickN(r, COMPANY_SUFFIX, 2 + Math.floor(r() * 3)).map((c, i) => ({
    id: `${slug}-c${i}`,
    name: `${pick(r, COMPANY_PREFIX)} ${c.suffix}`,
    categories: [c.category],
  }));

  const tenders = pickN(r, TENDERS, 1 + Math.floor(r() * 3))
    .map((t, i) => {
      const days = 8 + Math.floor(r() * 150);
      return { id: `${slug}-t${i}`, title: t.title, type: t.type, status: (days > 60 ? "upcoming" : "open") as OpportunityStatus, deadline: addDays(SNAPSHOT_DATE, days) };
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const policies = pickN(r, POLICIES, 2 + Math.floor(r() * 2))
    .map((p, i) => ({ id: `${slug}-pol${i}`, title: p.title, kind: p.kind, year: 2019 + Math.floor(r() * 8) }))
    .sort((a, b) => b.year - a.year);

  return { projects, prices, companies, tenders, policies };
}
