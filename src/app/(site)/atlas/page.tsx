import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { EndUse } from "@/domain/types";
import { services } from "@/services";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectAtlas, StatusLegend } from "@/features/projects";

export const metadata: Metadata = {
  title: "Hydrogen Project Atlas",
  description: "Interactive map of publicly documented hydrogen production projects with status, capacity and sources.",
};

const END_USES: { key: EndUse[]; label: string; image: string; alt: string }[] = [
  { key: ["ammonia"], label: "Ammonia & fertiliser", image: "/images/rand/ammonia.jpg", alt: "Tractor spraying a crop field" },
  { key: ["steel"], label: "Iron & steel", image: "/images/rand/iron-steel.jpg", alt: "Molten steel being poured" },
  { key: ["methanol", "e-fuels"], label: "Methanol & e-fuels", image: "/images/rand/methanol.jpg", alt: "Vehicle refuelling" },
  { key: ["mobility"], label: "Mobility & transport", image: "/images/rand/transport.jpg", alt: "Hydrogen tube trailer truck" },
  { key: ["refining", "chemicals", "industrial-heat"], label: "Refining, chemicals & heat", image: "/images/rand/burning.jpg", alt: "Gas burner flame" },
];

export default async function AtlasPage() {
  const projects = await services.projects.list();
  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient rounded-panel px-6 pt-14 pb-8 md:px-12 md:pt-16">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="eyebrow">Hydrogen Project Atlas</div>
              <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">Where hydrogen is really being built.</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-2">
                Every marker is a sourced record. Hover for key facts, click for a preview and open the full project record in the platform. Summary metrics are calculated from the records shown — never typed in.
              </p>
            </div>
            <ButtonLink href="/app/projects" size="lg">
              Open project database
            </ButtonLink>
          </Reveal>
          <div className="mt-10">
            <ProjectAtlas />
          </div>
        </div>
      </section>
      <section className="container-site pt-16 md:pt-20">
        <h2 className="text-[28px] font-light text-ink md:text-h3">Projects by end use</h2>
        <p className="mt-3 max-w-2xl text-ink-2">Counts of tracked projects naming each intended use. A project can serve several uses.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {END_USES.map((u) => {
            const n = projects.filter((p) => p.endUses.some((e) => u.key.includes(e))).length;
            return (
              <Link key={u.label} href="/app/projects" className="group relative block aspect-[4/5] overflow-hidden rounded-card">
                <Image src={u.image} alt={u.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(11_44_36/0.9))]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="num text-[34px] leading-none font-light">{n}</div>
                  <div className="mt-1 text-sm text-cream/85">{u.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="container-site py-16 md:py-20">
        <h2 className="text-[28px] font-light text-ink md:text-h3">How project status is defined</h2>
        <p className="mt-3 max-w-2xl text-ink-2">An announcement is not an investment. Each record is classified by the furthest stage confirmed in its sources.</p>
        <StatusLegend variant="definitions" showFid className="mt-8" />
      </section>
      <CtaBand />
      <div className="h-10" />
    </>
  );
}
