import {
  Building2,
  Calculator,
  Factory,
  Gauge,
  Globe2,
  HardHat,
  LibraryBig,
  Radar,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
  /** "live" = working with sourced data; "preview" = UI preview with demo data. */
  availability: "live" | "preview";
}

export const APP_NAV: { group: string; items: AppNavItem[] }[] = [
  {
    group: "Overview",
    items: [{ href: "/app", label: "Dashboard", short: "Home", icon: Gauge, description: "Market overview, alerts and quick access", availability: "live" }],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/app/projects", label: "Project Intelligence", short: "Projects", icon: Globe2, description: "Global hydrogen project database with map and table views", availability: "live" },
      { href: "/app/markets", label: "Energy Markets", short: "Markets", icon: Zap, description: "Day-ahead electricity prices by bidding zone", availability: "live" },
      { href: "/app/companies", label: "Companies & Investors", short: "Investors", icon: Building2, description: "Company profiles, investors and documented deals", availability: "live" },
    ],
  },
  {
    group: "Economics",
    items: [{ href: "/app/calculator", label: "LCOH Calculator", short: "LCOH", icon: Calculator, description: "Levelised cost of hydrogen with scenarios and sensitivities", availability: "live" }],
  },
  {
    group: "Procurement",
    items: [
      { href: "/app/suppliers", label: "Technology & Suppliers", short: "Suppliers", icon: Factory, description: "Equipment catalogue, comparisons and RFQs", availability: "live" },
      { href: "/app/opportunities", label: "Opportunity Radar", short: "Radar", icon: Radar, description: "Tenders, funding calls and auctions", availability: "live" },
    ],
  },
  {
    group: "Delivery",
    items: [{ href: "/app/workspace", label: "Project Workspace", short: "Workspace", icon: HardHat, description: "EPC/EPCM delivery preview with demo data", availability: "preview" }],
  },
  {
    group: "Reference",
    items: [{ href: "/app/sources", label: "Sources & Methodology", short: "Sources", icon: LibraryBig, description: "Datasets, verification and calculation methods", availability: "live" }],
  },
];

export const APP_NAV_FLAT = APP_NAV.flatMap((g) => g.items);

/** Six platform modules presented on the marketing site. */
export const MODULES = [
  {
    slug: "market-intelligence",
    title: "Market Intelligence",
    summary: "Track hydrogen projects, policy and electricity markets with every record tied to its source.",
    appHref: "/app/projects",
    status: "Available",
  },
  {
    slug: "hydrogen-economics",
    title: "Hydrogen Economics",
    summary: "Model levelised cost of hydrogen, compare scenarios and see which assumptions move the number.",
    appHref: "/app/calculator",
    status: "Available",
  },
  {
    slug: "project-intelligence",
    title: "Project & Technology Intelligence",
    summary: "Compare electrolyser technologies, configurations and the projects that use them.",
    appHref: "/app/suppliers",
    status: "Available",
  },
  {
    slug: "procurement",
    title: "Procurement & Tenders",
    summary: "Find funding calls, auctions and tenders, and turn requirements into an application checklist.",
    appHref: "/app/opportunities",
    status: "Available",
  },
  {
    slug: "investment",
    title: "Investment & M&A",
    summary: "Screen companies, investors and documented deals before committing to due diligence.",
    appHref: "/app/companies",
    status: "Early access",
  },
  {
    slug: "project-delivery",
    title: "Engineering & Project Delivery",
    summary: "Carry feasibility work into FEED, procurement, construction and handover in one workspace.",
    appHref: "/app/workspace",
    status: "Preview",
  },
] as const;

export type ModuleSlug = (typeof MODULES)[number]["slug"];
