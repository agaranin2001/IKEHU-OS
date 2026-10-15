import { MODULES } from "@/config/navigation";

export interface MenuLink {
  href: string;
  label: string;
  description?: string;
}

export const SITE_MENUS: { label: string; links: MenuLink[]; aside?: { title: string; body: string; href: string; cta: string } }[] = [
  {
    label: "Platform",
    links: [
      { href: "/platform", label: "Platform overview", description: "One connected system from intelligence to execution" },
      ...MODULES.map((m) => ({ href: `/solutions/${m.slug}`, label: m.title, description: m.summary })),
    ],
    aside: { title: "Hydrogen Intelligence Data Layer", body: "How projects, prices, suppliers and funding are normalised, validated and linked.", href: "/platform#data-layer", cta: "See the data layer" },
  },
  {
    label: "Tools",
    links: [
      { href: "/calculator", label: "LCOH Calculator", description: "Levelised cost of hydrogen with scenarios" },
      { href: "/atlas", label: "Hydrogen Project Atlas", description: "Interactive map of tracked projects" },
      { href: "/app/markets", label: "European Power Prices", description: "Day-ahead prices by bidding zone" },
      { href: "/app/opportunities", label: "Opportunity Radar", description: "Funding calls, auctions and tenders" },
    ],
  },
  {
    label: "Solutions",
    links: [
      { href: "/#audiences", label: "Project developers", description: "Screen sites, technologies and economics" },
      { href: "/#audiences", label: "Investors & funds", description: "Benchmark projects and counterparties" },
      { href: "/#audiences", label: "EPC & engineering", description: "Carry feasibility into delivery" },
      { href: "/#audiences", label: "Equipment manufacturers", description: "Understand demand and tenders" },
      { href: "/#audiences", label: "Public sector & funds", description: "Track programmes and pipelines" },
    ],
  },
  {
    label: "Resources",
    links: [
      { href: "/data", label: "Data & methodology", description: "Sources, verification and calculation methods" },
      { href: "/library", label: "R&D Library", description: "Sourced findings from public reports" },
      { href: "/app/sources", label: "Dataset inventory", description: "Versions, scope and record counts" },
    ],
  },
];
