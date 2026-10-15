import { ArrowRight, Check, CircleDashed, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryPreview, EconomicsPreview, InvestmentPreview, ProjectsPreview, RadarPreview, SuppliersPreview } from "@/components/marketing/Previews";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand, SectionHeading } from "@/components/marketing/Sections";
import { OriginTag } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { MODULES, type ModuleSlug } from "@/config/navigation";
import { SOLUTIONS } from "@/config/solutions";
import { calculateLcoh } from "@/lib/economics/lcoh";
import { tornado } from "@/lib/economics/sensitivity";
import { services } from "@/services";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SOLUTIONS[slug as ModuleSlug];
  return s ? { title: s.eyebrow, description: s.intro } : {};
}

async function PreviewFor({ kind }: { kind: (typeof SOLUTIONS)[ModuleSlug]["preview"] }) {
  switch (kind) {
    case "projects": {
      const [projects, info] = await Promise.all([services.projects.list(), services.projects.info()]);
      return <ProjectsPreview projects={projects} compiledAt={info.compiledAt} />;
    }
    case "economics": {
      const sc = (await services.scenarios.presets()).find((s) => s.id === "base")!;
      return <EconomicsPreview result={calculateLcoh(sc.inputs)} bars={tornado(sc.inputs)} />;
    }
    case "suppliers":
      return <SuppliersPreview products={await services.suppliers.products()} />;
    case "radar":
      return <RadarPreview opportunities={await services.opportunities.list()} />;
    case "investment":
      return <InvestmentPreview companies={await services.companies.list()} />;
    case "delivery":
      return <DeliveryPreview milestones={(await services.workspace.snapshot()).milestones} />;
  }
}

const AVAIL = {
  available: { I: Check, label: "Available", c: "text-ok bg-ok-soft" },
  preview: { I: Eye, label: "Preview", c: "text-violet bg-violet-soft" },
  planned: { I: CircleDashed, label: "Planned", c: "text-muted bg-stone" },
};

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SOLUTIONS[slug as ModuleSlug];
  if (!s) notFound();
  const idx = MODULES.findIndex((m) => m.slug === s.slug);
  const next = MODULES[(idx + 1) % MODULES.length];

  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient grid items-center gap-12 overflow-hidden rounded-panel px-6 py-16 md:px-14 md:py-20 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <div className="eyebrow">{s.eyebrow}</div>
            <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">{s.headline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{s.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={s.primary.href} size="lg">
                {s.primary.label}
              </ButtonLink>
              <ButtonLink href={s.secondary.href} variant="secondary" size="lg">
                {s.secondary.label}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <PreviewFor kind={s.preview} />
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-site">
          <SectionHeading title="Questions it answers" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {s.questions.map((q, i) => (
              <Reveal key={q} delay={i * 80}>
                <div className="h-full rounded-card border border-line-2 bg-paper p-7">
                  <span className="num text-xs font-semibold text-violet">0{i + 1}</span>
                  <p className="mt-4 text-[22px] leading-snug font-light text-ink">{q}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-deep py-20 text-cream md:py-28" data-header="dark">
        <div className="container-site">
          <SectionHeading tone="dark" align="left" title="Capabilities" body="What works today, what you can preview, and what is on the roadmap — labelled honestly." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {s.capabilities.map((c, i) => {
              const a = AVAIL[c.availability];
              return (
                <Reveal key={c.title} delay={(i % 3) * 70}>
                  <div className={cn("h-full rounded-card border p-6", c.availability === "planned" ? "border-dashed border-cream/20" : "border-cream/10 bg-deep-2")}>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", a.c)}>
                      <a.I className="size-3" /> {a.label}
                    </span>
                    <h3 className="mt-5 text-xl font-medium text-white">{c.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{c.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[30px] leading-tight font-light text-ink md:text-h3">The data behind it</h2>
            <ul className="mt-6 space-y-3">
              {s.dataBehind.map((d) => (
                <li key={d} className="flex gap-3 border-b border-line-2 pb-3 text-[16px] text-ink-2">
                  <Check className="mt-1 size-4 shrink-0 text-forest" /> {d}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <OriginTag origin={s.preview === "delivery" ? "demo" : "sourced"} />
              <Link href="/data" className="text-sm font-bold text-forest">
                How we source and verify →
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Link href={`/solutions/${next.slug}`} className="group flex h-full flex-col justify-between rounded-panel bg-paper p-8 shadow-card transition-shadow hover:shadow-float">
              <div>
                <div className="eyebrow">Next module</div>
                <div className="mt-4 text-[30px] leading-tight font-light text-ink">{next.title}</div>
                <p className="mt-3 text-[16px] text-ink-2">{next.summary}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-bold text-forest">
                Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand />
      <div className="h-10" />
    </>
  );
}
