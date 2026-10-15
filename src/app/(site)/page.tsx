import { Factory, Globe2, Radar, Zap } from "lucide-react";
import type { Metadata } from "next";
import { AudienceCarousel } from "@/components/marketing/AudienceCarousel";
import { CalculatorTeaser } from "@/components/marketing/CalculatorTeaser";
import { FoundersSection } from "@/components/marketing/FoundersSection";
import { HeroLivePreview } from "@/components/marketing/HeroLivePreview";
import { LogoMarquee } from "@/components/marketing/LogoMarquee";
import { MapDissolve } from "@/components/marketing/MapDissolve";
import { ModuleCarousel } from "@/components/marketing/ModuleCarousel";
import { ProblemVisual } from "@/components/marketing/ProblemVisual";
import { DeliveryPreview, EconomicsPreview, InvestmentPreview, ProjectsPreview, RadarPreview, SuppliersPreview } from "@/components/marketing/Previews";
import { Reveal } from "@/components/marketing/Reveal";
import { LibraryCard } from "@/components/marketing/LibraryCard";
import { CtaBand, SectionHeading, TextLink } from "@/components/marketing/Sections";
import { StorySection } from "@/components/marketing/StorySection";
import { ButtonLink } from "@/components/ui/Button";
import { BRAND } from "@/config/brand";
import { toArticle } from "@/features/library/library";
import { calculateLcoh } from "@/lib/economics/lcoh";
import { tornado } from "@/lib/economics/sensitivity";
import { projectStats } from "@/lib/aggregate";
import { fmtDate, fmtMw } from "@/lib/format";
import { services } from "@/services";

export const metadata: Metadata = {
  title: `${BRAND.name} — The intelligence layer for hydrogen energy projects`,
};



export default async function HomePage() {
  const [projects, info, scenarios, , insights, products, opportunities, companies, workspace] = await Promise.all([
    services.projects.list(),
    services.projects.info(),
    services.scenarios.presets(),
    services.energy.monthly(["SE3", "DE-LU"]),
    services.insights.list(),
    services.suppliers.products(),
    services.opportunities.list(),
    services.companies.list(),
    services.workspace.snapshot(),
  ]);
  const base = scenarios.find((s) => s.id === "base")!;
  const lcoh = calculateLcoh(base.inputs);
  const bars = tornado(base.inputs);
  const stats = projectStats(projects);
  const pick = (id: string) => insights.find((i) => i.id === id);
  const problem = [pick("ins-iea-pipeline-2030"), pick("ins-eho-lcoh-2024"), pick("ins-eca-sr-2024-11")].filter(Boolean) as typeof insights;
  const featured = ["ins-iea-electrolysis-capacity-2025", "ins-ehb-third-auction-2026", "ins-eho-electrolyser-capex-2024", "ins-iea-investment-2025", "ins-acer-monitoring-2025", "ins-eho-manufacturing-2025"]
    .map(pick)
    .filter((i): i is (typeof insights)[number] => Boolean(i))
    .map(toArticle);

  return (
    <>
      {/* 1 · HERO */}
      <section className="container-site pt-2">
        <div className="hero-gradient relative overflow-hidden rounded-panel px-5 pt-16 pb-0 md:px-12 md:pt-[110px]">
          <Reveal className="mx-auto max-w-[920px] text-center">
            <h1 className="text-[36px] leading-[1.1] font-light tracking-[-0.015em] text-ink sm:text-[40px] md:text-[42px] xl:text-display">The intelligence layer for hydrogen energy projects.</h1>
            <p className="mx-auto mt-6 max-w-[720px] text-[17px] leading-[1.6] text-ink-2 md:text-lg">
              Research the global hydrogen market, evaluate production technologies, calculate project economics and identify investment opportunities — in one connected workspace.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/app" size="lg">
                Explore the platform
              </ButtonLink>
              <ButtonLink href="/calculator" variant="secondary" size="lg">
                Calculate hydrogen cost
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={150} className="mx-auto mt-14 max-w-[1280px] md:mt-16">
            <div className="translate-y-px">
              <HeroLivePreview />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 · SOURCES STRIP */}
      <section className="container-site py-14 md:py-16">
        <p className="text-center text-[15px] text-ink-2">Built on public, primary sources — every record links back to where it came from</p>
        <div className="mt-10">
          <LogoMarquee />
        </div>
      </section>

      {/* 2b · WORLD MAP — scroll-driven statement */}
      <MapDissolve points={projects.map((p) => ({ lat: p.location.lat, lon: p.location.lon }))}>
        <h2 className="mx-auto max-w-[1100px] text-[44px] leading-[1.02] font-light tracking-[-0.03em] text-ink sm:text-[64px] lg:text-[96px]">
          Every hydrogen project.
          <br />
          One place to evaluate it.
        </h2>
        <p className="mx-auto mt-8 max-w-[640px] text-lg leading-relaxed text-ink-2 md:text-xl">
          {stats.count} sourced projects across {stats.countries} countries — screened, costed and tracked from the same records.
        </p>
      </MapDissolve>

      {/* 3 · PROBLEM — platform statement, dataset stats, then the problem */}
      <section className="bg-deep text-cream" data-header="dark">
        <div className="container-site pt-20 pb-24 md:pt-24 md:pb-32">
          <Reveal>
            <h2 className="max-w-[900px] text-[30px] leading-[1.15] font-light text-white md:text-[42px]">
              The data, intelligence and tools behind better hydrogen investment decisions.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {[
              { v: String(stats.count), l: `sourced hydrogen projects across ${stats.countries} countries`, I: Globe2 },
              { v: fmtMw(stats.totalMw), l: "disclosed electrolyser pipeline, excluding cancelled", I: Factory },
              { v: "18", l: "European bidding zones of day-ahead price history", I: Zap },
              { v: String(products.length + opportunities.length), l: "equipment products, funding calls and tenders", I: Radar },
            ].map((k, i) => (
              <Reveal key={k.l} delay={i * 80} className="border-l-2 border-mint pl-6 lg:pr-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-btn bg-mint/10 text-mint md:size-12">
                    <k.I className="size-5 md:size-6" strokeWidth={1.75} />
                  </span>
                  <span className="num text-[40px] leading-none font-light text-white md:text-[48px]">{k.v}</span>
                </div>
                <div className="mt-3 max-w-[260px] text-[17px] leading-snug text-cream/85">{k.l}</div>
              </Reveal>
            ))}
          </div>

          <div className="mt-24 grid items-stretch gap-12 md:mt-36 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal>
              <h2 className="text-[38px] leading-[1.08] font-light text-white md:text-[56px]">Hydrogen decisions are made on fragmented data.</h2>
              <p className="mt-6 max-w-[600px] text-[17px] leading-relaxed text-cream/70 md:text-lg">
                Project announcements, electricity prices, equipment specifications, funding rules and cost assumptions sit in different places, use different units and age at different speeds. Teams spend weeks assembling a view that is out of date the day it is finished.
              </p>
              <ul className="mt-8 space-y-3">
                {problem.map((p) => (
                  <li key={p.id}>
                    <a href={p.sources[0]?.url} target="_blank" rel="noopener noreferrer" className="group flex flex-wrap items-baseline gap-x-3 text-[15px]">
                      <span className="num font-medium text-white">{p.metric?.value}</span>
                      <span className="text-cream/65">{p.metric?.label}</span>
                      <span className="text-xs text-cream/40 group-hover:text-mint">
                        {p.publisher}, {fmtDate(p.publishedAt)} ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <TextLink href="/platform" tone="dark">
                  How the platform connects it
                </TextLink>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:h-full">
              <ProblemVisual />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4 · SOLUTION — six modules carousel */}
      <section className="overflow-hidden bg-deep text-cream" data-header="dark">
        <div className="container-site border-t border-cream/10 pt-20 pb-24 md:pt-24 md:pb-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-[34px] leading-[1.1] font-light text-white md:text-h2">One platform. Every hydrogen decision.</h2>
            <p className="mt-5 text-lg leading-relaxed text-cream/75">
              Six connected modules share one data layer — the same project, price and supplier records flow from first screening to procurement and delivery.
            </p>
          </Reveal>
          <div className="mt-10">
            <ModuleCarousel />
          </div>
        </div>
      </section>

      {/* 5 · STORY — the workflow */}
      <section className="py-24 md:py-32" style={{ background: "linear-gradient(180deg,#e4e8e5 0%,#f3f1ec 22%)" }}>
        <div className="container-site">
          <SectionHeading
            title={
              <>
                From market signal
                <br className="hidden md:block" /> to project execution
              </>
            }
            body="Start with electricity and the projects already in the market, model production economics, choose technology and suppliers, find funding — and carry the result into delivery."
          />
          <div className="mt-20 md:mt-28">
            <StorySection
              steps={[
                {
                  id: "intel",
                  eyebrow: "Market intelligence",
                  title: "Discover projects, technologies and suppliers worldwide.",
                  body: "A status-aware database distinguishes announced, planned, under-construction, operational, delayed and cancelled projects — so an announcement is never mistaken for committed capacity.",
                  points: [`${stats.count} sourced projects across ${stats.countries} countries`, "Map and table views with country, technology, capacity and developer filters", "Source link and last-verified date on every record"],
                  href: "/app/projects",
                  cta: "Explore projects",
                  visual: <ProjectsPreview projects={projects} compiledAt={info.compiledAt} />,
                },
                {
                  id: "econ",
                  eyebrow: "Hydrogen economics",
                  title: "Calculate production cost and compare scenarios.",
                  body: "A transparent levelised-cost model with explicit assumptions, sourced benchmarks beside every input and sensitivities that show which variable really moves the number.",
                  points: ["Conservative, base and optimistic scenarios with visible assumptions", "Electricity prices from historical day-ahead data by bidding zone", "Exportable preliminary report"],
                  href: "/calculator",
                  cta: "Run a calculation",
                  visual: <EconomicsPreview result={lcoh} bars={bars} />,
                },
                {
                  id: "tech",
                  eyebrow: "Project & technology intelligence",
                  title: "Compare electrolysers on the specs that matter.",
                  body: "Manufacturer datasheets side by side — capacity, specific energy consumption, output pressure and standards — with vendor claims labelled as such.",
                  points: ["PEM, alkaline, SOEC and AEM systems plus balance-of-plant equipment", "Prices only where publicly disclosed", "Request-for-quotation workflow"],
                  href: "/app/suppliers",
                  cta: "Compare equipment",
                  visual: <SuppliersPreview products={products} />,
                },
                {
                  id: "proc",
                  eyebrow: "Procurement & tenders",
                  title: "Find funding calls, auctions and tenders in time.",
                  body: "EU and national programmes alongside public procurement notices, each with its deadline, eligibility and official link — plus an application checklist you can work through.",
                  points: ["Filters for country, deadline, technology and budget", "Requirements summary and missing-document tracking", "Rule-based review assistant (preview)"],
                  href: "/app/opportunities",
                  cta: "Open the radar",
                  visual: <RadarPreview opportunities={opportunities} />,
                },
                {
                  id: "inv",
                  eyebrow: "Investment intelligence",
                  title: "Screen companies, funders and strategic partners.",
                  body: "Company and investor profiles built only from publicly documented information: funding rounds, joint ventures, supply contracts and grants, each with its source.",
                  points: ["Electrolyser makers, developers, EPCs and start-ups", "Infrastructure funds, venture investors and public funders", "Preliminary due-diligence workspace"],
                  href: "/app/companies",
                  cta: "Screen companies",
                  visual: <InvestmentPreview companies={companies} />,
                },
                {
                  id: "deliv",
                  eyebrow: "Engineering & project delivery",
                  title: "Move from feasibility into engineering and construction.",
                  body: "A delivery workspace for tasks, budgets, milestones, risks, documents and supplier packages — shown today as a preview with demo data.",
                  points: ["Phase-gated plan from feasibility to handover", "Risk register with likelihood × impact matrix", "Budget versus commitments"],
                  href: "/app/workspace",
                  cta: "Preview the workspace",
                  visual: <DeliveryPreview milestones={workspace.milestones} />,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 6 · CALCULATOR TEASER */}
      <section className="container-site pb-24 md:pb-32">
        <Reveal>
          <CalculatorTeaser base={base.inputs} />
        </Reveal>
      </section>

      {/* 7 · AUDIENCES */}
      <section id="audiences" className="scroll-mt-24 pb-24 md:pb-32">
        <div className="container-site">
          <SectionHeading title="Built for every team on a hydrogen project" body="Developers, investors, engineers, manufacturers and public funders look at the same project through different questions. The platform answers each from the same records." />
          <div className="mt-12">
            <AudienceCarousel />
          </div>
        </div>
      </section>

      {/* 8 · R&D LIBRARY */}
      <section id="library" className="scroll-mt-24 pb-24 md:pb-32">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <h2 className="text-[34px] leading-[1.1] font-light tracking-[-0.015em] text-ink md:text-h2">IKEHU R&amp;D Library</h2>
            </Reveal>
            <ButtonLink href="/library" variant="secondary" size="lg">
              View all
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((a, k) => (
              <Reveal key={a.id} delay={k * 60} className="h-full">
                <LibraryCard article={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9 · FOUNDERS */}
      <FoundersSection />

      {/* 10 · CTA */}
      <CtaBand />
      <div className="h-10" />
    </>
  );
}
