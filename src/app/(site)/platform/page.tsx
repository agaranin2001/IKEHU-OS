import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand, SectionHeading } from "@/components/marketing/Sections";
import { OriginTag } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { MODULES } from "@/config/navigation";
import { fmtDate } from "@/lib/format";
import { services } from "@/services";

export const metadata: Metadata = {
  title: "Platform",
  description: "One connected platform for hydrogen market intelligence, production economics, procurement, investment screening and project delivery.",
};

const LAYER = [
  {
    title: "Sources",
    items: ["Developer & regulator announcements", "Day-ahead power prices", "Manufacturer datasheets", "Funding portals & TED notices", "Agency reports (IEA, EHO, IRENA)"],
  },
  {
    title: "Normalise & validate",
    items: ["One unit system (MW(e), t/yr, €/MWh, kWh/kg)", "Status taxonomy & FID flag", "Electrolyser vs generation capacity", "Verification status & confidence", "Last-verified dates"],
  },
  {
    title: "Linked entities",
    items: ["Projects", "Technologies & products", "Companies & investors", "Opportunities", "Energy prices & benchmarks"],
  },
  {
    title: "Applications",
    items: ["Project intelligence & atlas", "LCOH calculator & scenarios", "Supplier explorer & RFQ", "Opportunity radar", "Delivery workspace"],
  },
];

const ROADMAP = [
  { t: "Real-time & historical market integrations", b: "Automated day-ahead, intraday and PPA price feeds by bidding zone." },
  { t: "Expanded global project database", b: "Continuous monitoring of announcements with change history per record." },
  { t: "Tender monitoring & application assistance", b: "Alerts on new calls and AI-assisted drafting from official documents." },
  { t: "Supplier quotations & procurement workflows", b: "Routed RFQs, bid comparison and total cost of ownership." },
  { t: "EPC/EPCM project management", b: "Connected schedules, budgets, documents and risk registers." },
  { t: "AI-assisted technical & financial due diligence", b: "Data-room review against a structured checklist." },
  { t: "Investor matching & funding applications", b: "Matching projects to funder mandates and programmes." },
  { t: "Energy Project Bank", b: "Drawings, equipment, patents, licences and project rights in one register." },
  { t: "Portfolio analytics", b: "Cost, risk and schedule across multiple projects." },
];

export default async function PlatformPage() {
  const [projects, products, opportunities, companies, investors, info] = await Promise.all([
    services.projects.list(),
    services.suppliers.products(),
    services.opportunities.list(),
    services.companies.list(),
    services.investors.list(),
    services.projects.info(),
  ]);
  const counts: Record<string, string> = {
    Projects: `${projects.length} records`,
    "Technologies & products": `${products.length} products`,
    "Companies & investors": `${companies.length + investors.length} profiles`,
    Opportunities: `${opportunities.length} calls & tenders`,
    "Energy prices & benchmarks": "18 bidding zones",
  };

  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient grid items-center gap-10 overflow-hidden rounded-panel px-6 py-16 md:px-16 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="max-w-[820px]">
            <div className="eyebrow">Platform</div>
            <h1 className="mt-4 text-[40px] leading-[1.08] font-light text-ink md:text-display">One connected system from hydrogen market intelligence to execution.</h1>
            <p className="mt-6 max-w-[640px] text-lg leading-relaxed text-ink-2">
              A shared data layer links projects, electricity prices, equipment, companies and funding — so screening, cost modelling, procurement and delivery all work from the same verified records.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/app" size="lg">
                Open the platform
              </ButtonLink>
              <ButtonLink href="/demo" variant="secondary" size="lg">
                Request a demo
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative aspect-[4/5] w-full overflow-hidden rounded-card shadow-float lg:max-h-[560px]">
            <Image src="/images/rand/hydrogen-plant.jpg" alt="Containerised hydrogen electrolysis plant with wind turbines" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" priority />
          </Reveal>
        </div>
      </section>

      <section id="data-layer" className="scroll-mt-24 py-24 md:py-32">
        <div className="container-site">
          <SectionHeading eyebrow="Hydrogen Intelligence Data Layer" title="Normalised once. Used everywhere." body="Records enter from public primary sources, are normalised to one unit system and taxonomy, validated, and linked — then every module reads the same entities." />
          <div className="relative mt-16 grid gap-4 lg:grid-cols-4">
            {LAYER.map((col, i) => (
              <Reveal key={col.title} delay={i * 90} className="relative">
                <div className={`h-full rounded-card border p-6 ${i === 2 ? "border-forest bg-deep text-cream" : "border-line-2 bg-paper"}`}>
                  <div className={`num text-xs font-semibold ${i === 2 ? "text-mint" : "text-violet"}`}>0{i + 1}</div>
                  <h3 className={`mt-3 text-xl font-medium ${i === 2 ? "text-white" : "text-ink"}`}>{col.title}</h3>
                  <ul className="mt-5 space-y-2.5">
                    {col.items.map((it) => (
                      <li key={it} className={`flex items-start justify-between gap-3 text-[14px] ${i === 2 ? "text-cream/80" : "text-ink-2"}`}>
                        <span>{it}</span>
                        {i === 2 && counts[it] && <span className="num shrink-0 text-[11px] text-mint">{counts[it]}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < 3 && (
                  <span aria-hidden className="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-page text-forest lg:grid">
                    <ArrowRight className="size-3.5" />
                  </span>
                )}
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-faint">
            Entity counts from dataset v{info.version}, compiled {fmtDate(info.compiledAt)}. Repository interfaces let each source be replaced by a live API without changing the applications.
          </p>
        </div>
      </section>

      <section className="bg-paper py-24 md:py-32">
        <div className="container-site grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading align="left" title="Six modules, one workflow" body="Each module stands alone and hands its results to the next — from the first market scan to commissioning." />
          </div>
          <ol className="relative">
            <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line" />
            {MODULES.map((m, i) => (
              <Reveal as="li" key={m.slug} className="relative pb-14 pl-10 last:pb-0" delay={i * 40}>
                <svg viewBox="0 0 16 16" className="absolute top-2 left-0 size-[15px] text-violet" aria-hidden>
                  <path d="M8 0 9.6 6.4 16 8 9.6 9.6 8 16 6.4 9.6 0 8 6.4 6.4Z" fill="currentColor" />
                </svg>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[28px] leading-tight font-light text-ink md:text-[34px]">{m.title}</h3>
                  {m.status === "Available" ? <OriginTag origin="sourced" /> : <OriginTag origin="preview" />}
                </div>
                <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">{m.summary}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href={`/solutions/${m.slug}`} variant="secondary">
                    Learn more
                  </ButtonLink>
                  <ButtonLink href={m.appHref} variant="ghost">
                    Open in platform <ArrowRight className="size-4" />
                  </ButtonLink>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="roadmap" className="scroll-mt-24 py-24 md:py-32">
        <div className="container-site">
          <SectionHeading eyebrow="Roadmap" title="Where the platform is going" body="These capabilities are planned. They are not available in the current version, and nothing on this site implies otherwise." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.t} delay={(i % 3) * 70}>
                <div className="h-full rounded-card border border-dashed border-line bg-page p-6">
                  <OriginTag origin="planned" />
                  <h3 className="mt-4 text-lg font-medium text-ink">{r.t}</h3>
                  <p className="mt-2 text-[15px] text-ink-2">{r.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-2xl rounded-card bg-paper p-6 text-sm text-ink-2">
            <div className="mb-3 font-medium text-ink">Available in this version</div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {["Project database, map & detail records", "LCOH calculator with scenarios & export", "Historical electricity price analysis", "Supplier catalogue & comparison", "Opportunity radar & checklists", "Company & investor profiles"].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-ok" /> {x}
                </li>
              ))}
            </ul>
            <Link href="/app" className="mt-4 inline-block font-bold text-forest">
              Open the platform →
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
      <div className="h-10" />
    </>
  );
}
