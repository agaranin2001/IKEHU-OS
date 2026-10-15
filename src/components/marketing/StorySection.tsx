"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

// Desktop illustration: 3D module stack (browser-only, loaded on demand).
const PlatformStackScene = dynamic(() => import("@/components/three/scenes/PlatformStackScene").then((m) => m.PlatformStackScene), { ssr: false });

export interface StoryStep {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  href: string;
  cta: string;
  visual: ReactNode;
}

/**
 * Scroll-driven list: the step nearest the viewport centre becomes active,
 * inactive steps fade back, and the sticky visual on the right swaps.
 * On mobile each step renders its own visual inline.
 */
export function StorySection({ steps }: { steps: StoryStep[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
      <ol className="relative min-w-0">
        <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line" />
        {steps.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className={cn("relative pb-20 pl-10 transition-opacity duration-500 last:pb-0 lg:min-h-[62vh] lg:pb-0", active === i ? "opacity-100" : "lg:opacity-35")}
          >
            <span aria-hidden className={cn("absolute top-0 left-0 grid h-4 w-[15px] place-items-center transition-transform duration-500", active === i && "scale-125")}>
              <svg viewBox="0 0 16 16" className="size-[15px] text-violet">
                <path d="M8 0 9.6 6.4 16 8 9.6 9.6 8 16 6.4 9.6 0 8 6.4 6.4Z" fill="currentColor" />
              </svg>
            </span>
            <div className="eyebrow">{s.eyebrow}</div>
            <h3 className="mt-3 text-[30px] leading-[1.15] font-light text-ink md:text-h3">{s.title}</h3>
            <p className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-ink-2">{s.body}</p>
            <ul className="mt-5 space-y-2 text-[15px] text-ink-2">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href={s.href} className="mt-6 inline-flex h-[42px] items-center rounded-btn border border-forest px-6 text-[15px] font-bold text-forest transition-colors hover:bg-forest hover:text-white">
              {s.cta}
            </Link>
            <div className="mt-8 lg:hidden">{s.visual}</div>
          </li>
        ))}
      </ol>
      {/* Full-height 3D stack: one layer beside each step, all visible at once. */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0">
          <PlatformStackScene active={active} />
        </div>
      </div>
    </div>
  );
}
