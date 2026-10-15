"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ModuleScene } from "@/components/three/ModuleScene";
import { cn } from "@/components/ui/cn";
import { MODULES } from "@/config/navigation";

const AUTOPLAY_MS = 6000;
const GAP = 24;

/** Signed distance of card `i` from the active card, wrapped into [-half, n-half). */
function offsetOf(i: number, index: number, n: number) {
  const half = Math.floor(n / 2);
  return ((((i - index + half) % n) + n) % n) - half;
}

/**
 * Infinite, centre-focused carousel of the six platform modules. Each card is
 * a single stable element positioned by its wrapped offset from the active
 * card, so the 3D scenes inside are created once and never remount. Cards
 * that wrap around the far side move without a transition (they are off
 * screen at that point). Arrows, dots, keyboard, swipe, click-to-focus;
 * autoplay pauses on hover/focus and is off for reduced motion.
 */
export function ModuleCarousel() {
  const n = MODULES.length;
  const [{ index, prev }, setState] = useState({ index: 0, prev: 0 });
  const [paused, setPaused] = useState(false);
  const [near, setNear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const active = ((index % n) + n) % n;

  const move = useCallback((delta: number) => setState((s) => ({ index: s.index + delta, prev: s.index })), []);
  const goTo = useCallback((i: number) => setState((s) => ({ index: s.index + offsetOf(i, s.index, n), prev: s.index })), [n]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => move(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, move]);

  // Load the 3D scenes only when the carousel approaches the viewport.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Platform modules"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") move(1);
        if (e.key === "ArrowLeft") move(-1);
      }}
    >
      <div
        className="overflow-hidden"
        onPointerDown={(e) => (drag.current = e.clientX)}
        onPointerUp={(e) => {
          const x0 = drag.current;
          drag.current = null;
          if (x0 == null) return;
          const dx = e.clientX - x0;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
        }}
      >
        <ul className="relative h-[460px] [--w:84%] md:h-[480px] md:[--w:48%] lg:[--w:34%]">
          {MODULES.map((m, i) => {
            const off = offsetOf(i, index, n);
            const wrapped = Math.abs(off - offsetOf(i, prev, n)) > n / 2;
            const isActive = off === 0;
            return (
              <li
                key={m.slug}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${m.title}`}
                aria-current={isActive}
                aria-hidden={Math.abs(off) > 1 || undefined}
                onClick={() => !isActive && move(off)}
                style={{ transform: `translateX(calc(-50% + ${off} * (100% + ${GAP}px))) scale(${isActive ? 1 : 0.94})` } as CSSProperties}
                className={cn(
                  "absolute top-1/2 left-1/2 -mt-[200px] flex h-[400px] w-[var(--w)] flex-col overflow-hidden rounded-card p-8 md:-mt-[210px] md:h-[420px] md:p-10",
                  wrapped
                    ? "transition-none"
                    : "transition-[transform,background-color,box-shadow,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isActive ? "bg-cream text-ink shadow-float" : "cursor-pointer bg-deep-2 text-cream hover:bg-[#164336]",
                )}
              >
                <h3 className="relative z-10 text-[26px] leading-tight font-normal md:text-[30px]">{m.title}</h3>
                {m.status !== "Available" && (
                  <span
                    className={cn(
                      "relative z-10 mt-3 w-fit rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      isActive ? "bg-violet-soft text-violet" : "bg-cream/10 text-cream/70",
                    )}
                  >
                    {m.status}
                  </span>
                )}
                <p className={cn("relative z-10 mt-5 max-w-[34ch] text-[17px] leading-relaxed md:text-lg", isActive ? "text-ink-2" : "text-cream/70")}>{m.summary}</p>
                <Link
                  href={`/solutions/${m.slug}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    if (!isActive) {
                      e.preventDefault();
                      move(off);
                    }
                  }}
                  className={cn(
                    "group relative z-10 mt-auto inline-flex w-fit items-center gap-3 border-b-2 pb-1.5 text-[17px] font-medium transition-colors",
                    isActive ? "border-forest text-forest" : "border-transparent text-cream/85",
                  )}
                >
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                  Read more
                </Link>
                <div className="pointer-events-none absolute right-0 bottom-0 h-[48%] w-[58%]">{near && <ModuleScene slug={m.slug} />}</div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous module"
          className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream transition-colors hover:border-mint hover:bg-mint hover:text-deep"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose module">
          {MODULES.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={m.title}
              onClick={() => goTo(i)}
              className={cn("h-2 rounded-full transition-all duration-500", i === active ? "w-8 bg-mint" : "w-2 bg-cream/30 hover:bg-cream/60")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next module"
          className="grid size-11 place-items-center rounded-full border border-cream/25 text-cream transition-colors hover:border-mint hover:bg-mint hover:text-deep"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
