"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

/** Platform screens the hero plays through, in order. */
const SCREENS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/projects", label: "Project Intelligence" },
  { href: "/app/calculator", label: "LCOH Calculator" },
  { href: "/app/markets", label: "Energy Markets" },
];

/** Virtual desktop the app is rendered at before scaling down. */
const VW = 1440;
const VH = 900;
const SCREEN_MS = 7000;
/** How far down each page auto-scrolls, as a share of its scrollable height. */
const SCROLL_SHARE = 0.45;

/**
 * Live product preview: the real platform pages in scaled-down iframes. It
 * cross-fades through the main screens and gently scrolls each one. The
 * preview is not interactive (so it never captures page scrolling); clicking
 * opens the platform. Under reduced motion it shows the dashboard, still.
 */
export function HeroLivePreview() {
  const boxRef = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLIFrameElement | null)[]>([]);
  const [scale, setScale] = useState(0);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  // Fit the 1440-wide virtual screen to the box width.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / VW));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Advance through the screens.
  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % SCREENS.length), SCREEN_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  // Auto-scroll the active page once it has loaded (same-origin iframe). The
  // platform scrolls inside its content panel (#app-content) on desktop, so
  // scroll that when it overflows, otherwise the document.
  useEffect(() => {
    if (reduce || !loaded[active]) return;
    const win = frames.current[active]?.contentWindow;
    if (!win) return;
    const doc = win.document;
    const scroller = (): HTMLElement => {
      const panel = doc.getElementById("app-content");
      return panel && panel.scrollHeight > panel.clientHeight + 4 ? panel : doc.documentElement;
    };
    scroller().scrollTop = 0;
    let raf = 0;
    const start = performance.now() + 900;
    const duration = SCREEN_MS - 1800;
    const step = (now: number) => {
      // Re-resolve each frame: client data may still be loading and growing the page.
      const el = scroller();
      const max = Math.max(0, el.scrollHeight - el.clientHeight) * SCROLL_SHARE;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      el.scrollTop = max * eased;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, loaded, reduce]);

  const onLoad = useCallback((i: number) => {
    const win = frames.current[i]?.contentWindow;
    // Hide scrollbars inside the preview.
    if (win) {
      const style = win.document.createElement("style");
      style.textContent = "html,#app-content{scrollbar-width:none;scroll-behavior:auto!important}html::-webkit-scrollbar,#app-content::-webkit-scrollbar{display:none}nextjs-portal{display:none!important}";
      win.document.head.appendChild(style);
    }
    setLoaded((l) => ({ ...l, [i]: true }));
  }, []);

  // Mount the active screen and the next one (preloading), plus any already loaded.
  const next = (active + 1) % SCREENS.length;

  return (
    <div
      className="overflow-hidden rounded-t-[16px] border border-b-0 border-white/70 bg-paper shadow-float"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Browser-style tab bar */}
      <div className="flex items-center gap-3 border-b border-line-2 bg-paper-2/80 px-3 py-2 md:px-4">
        <span className="hidden gap-1.5 sm:flex" aria-hidden>
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </span>
        <div role="tablist" aria-label="Platform screens" className="scrollbar-thin flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {SCREENS.map((s, i) => (
            <button
              key={s.href}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-8 shrink-0 overflow-hidden rounded-[7px] px-3 text-[12px] font-medium transition-colors md:text-[13px]",
                i === active ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {s.label}
              {i === active && !reduce && !paused && (
                <span key={active} aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-forest" style={{ animation: `preview-progress ${SCREEN_MS}ms linear forwards` }} />
              )}
            </button>
          ))}
        </div>
        <Link href={SCREENS[active].href} className="hidden shrink-0 items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[12px] font-bold text-forest hover:bg-paper md:inline-flex">
          Open <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Scaled live screens */}
      <Link href={SCREENS[active].href} aria-label={`Open ${SCREENS[active].label}`} className="block">
        <div ref={boxRef} className="relative max-h-[60dvh] w-full overflow-hidden bg-page" style={{ aspectRatio: `${VW} / ${VH}` }}>
          {scale > 0 &&
            SCREENS.map((s, i) => {
              const mounted = i === active || i === next || loaded[i];
              if (!mounted) return null;
              return (
                <iframe
                  key={s.href}
                  ref={(el) => {
                    frames.current[i] = el;
                  }}
                  src={s.href}
                  title={`${s.label} — live preview`}
                  tabIndex={-1}
                  aria-hidden={i !== active}
                  onLoad={() => onLoad(i)}
                  className={cn(
                    "pointer-events-none absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-700",
                    i === active && loaded[i] ? "opacity-100" : "opacity-0",
                  )}
                  style={{ width: VW, height: VH, transform: `scale(${scale})` }}
                />
              );
            })}
          {!loaded[active] && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-sm text-muted">Loading the live platform…</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
