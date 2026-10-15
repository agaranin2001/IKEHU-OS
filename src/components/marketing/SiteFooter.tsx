import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BRAND } from "@/config/brand";
import { MODULES } from "@/config/navigation";
import { SNAPSHOT_DATE } from "@/lib/format";

const COLUMNS = [
  { title: "Platform", links: [{ href: "/platform", label: "Overview" }, { href: "/platform#data-layer", label: "Data layer" }, { href: "/app", label: "Open platform" }, { href: "/platform#roadmap", label: "Roadmap" }] },
  { title: "Modules", links: MODULES.map((m) => ({ href: `/solutions/${m.slug}`, label: m.title })) },
  { title: "Tools", links: [{ href: "/calculator", label: "LCOH Calculator" }, { href: "/atlas", label: "Project Atlas" }, { href: "/app/markets", label: "Power prices" }, { href: "/app/opportunities", label: "Opportunity Radar" }] },
  { title: "Resources", links: [{ href: "/data", label: "Data & methodology" }, { href: "/app/sources", label: "Dataset inventory" }, { href: "/library", label: "R&D Library" }, { href: "/demo", label: "Request a demo" }] },
];

export function SiteFooter() {
  return (
    <footer className="no-print bg-night text-cream" data-header="dark">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-cream/70">{BRAND.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h2 className="text-base font-medium text-mint">{c.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[15px] text-cream/75 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/45 md:flex-row md:justify-between">
          <span>© {new Date(SNAPSHOT_DATE).getFullYear()} {BRAND.name}. Prototype — figures are indicative and sourced as shown.</span>
          <span>Electricity prices: Nord Pool via Elering, Fraunhofer ISE Energy-Charts. Project and market data: cited per record.</span>
        </div>
      </div>
    </footer>
  );
}
