"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const AUDIENCES = [
  {
    id: "developers",
    image: "/images/rand/hydrogen-plant.jpg",
    imageAlt: "Containerised electrolysis plant with wind turbines",
    label: "Project developers",
    title: "Screen sites, technologies and economics before spending on FEED.",
    points: ["Compare electricity cost across bidding zones", "Test PEM, alkaline and SOEC assumptions", "Benchmark against comparable projects and funding rounds"],
    href: "/app/calculator",
    cta: "Model a project",
  },
  {
    id: "investors",
    image: "/images/rand/how-it-works-hero.jpg",
    imageAlt: "Aerial forest with the H2 symbol",
    label: "Investors & funds",
    title: "Separate committed capacity from announcements.",
    points: ["Status-aware project pipeline with FID flags", "Documented deals and counterparties", "Preliminary due-diligence checklists"],
    href: "/app/companies",
    cta: "Screen companies",
  },
  {
    id: "epc",
    image: "/images/rand/storage.jpg",
    imageAlt: "Hydrogen storage tanks at a plant site",
    label: "EPC & engineering",
    title: "Carry feasibility assumptions into delivery without re-keying.",
    points: ["Equipment specifications side by side", "Tender pre-qualification notices", "Workspace for tasks, risks and milestones (preview)"],
    href: "/app/workspace",
    cta: "See the workspace",
  },
  {
    id: "oem",
    image: "/images/rand/fuel.jpg",
    imageAlt: "PEM fuel cell demonstration unit",
    label: "Equipment manufacturers",
    title: "See where demand is forming and who is buying.",
    points: ["Projects by technology and electrolyser supplier", "Public procurement for electrolysers and infrastructure", "Competitive product landscape"],
    href: "/app/suppliers",
    cta: "Explore the catalogue",
  },
  {
    id: "public",
    image: "/images/rand/transport.jpg",
    imageAlt: "Hydrogen tube trailer truck",
    label: "Public sector & funds",
    title: "Track programmes, auctions and the pipeline they support.",
    points: ["Hydrogen Bank auction results and clearing prices", "National schemes and call status", "Cost benchmarks with sources"],
    href: "/app/opportunities",
    cta: "Open the radar",
  },
];

/** Audience carousel: one column card per audience, three per view on desktop, scroll-snapped. */
export function AudienceCarousel() {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Audiences">
      <ul
        ref={track}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {AUDIENCES.map((a, i) => (
          <li
            key={a.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${AUDIENCES.length}: ${a.label}`}
            className="w-[85%] shrink-0 snap-start md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)]"
          >
            <Link href={a.href} className="group relative block h-full">
              <div className="notched flex h-full flex-col rounded-panel bg-paper p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[22px]">
                  <Image
                    src={a.image}
                    alt={a.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 pt-7 pb-5">
                  <div className="eyebrow">{a.label}</div>
                  <h3 className="mt-3 text-[24px] leading-[1.2] font-light text-ink md:text-[26px]">{a.title}</h3>
                  <ul className="mt-6 space-y-3">
                    {a.points.map((p, k) => (
                      <li key={p} className="flex items-start gap-3">
                        <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-mint-soft text-[11px] font-semibold text-forest">{k + 1}</span>
                        <span className="text-[15px] leading-snug text-ink-2">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-10 text-[15px] font-bold text-forest">{a.cta}</div>
                </div>
              </div>
              <span className="notch-btn" aria-hidden>
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center gap-3">
        {([-1, 1] as const).map((dir) => {
          const Icon = dir === -1 ? ArrowLeft : ArrowRight;
          const disabled = dir === -1 ? edge.start : edge.end;
          return (
            <button
              key={dir}
              type="button"
              onClick={() => step(dir)}
              disabled={disabled}
              aria-label={dir === -1 ? "Previous audiences" : "Next audiences"}
              className="grid size-11 place-items-center rounded-full border border-line text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
