"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { SITE_MENUS } from "./site-nav";

/**
 * Sticky header. Turns dark while it overlaps any element marked
 * `data-header="dark"`, mirroring the reference site's behaviour.
 */
export function SiteHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close menus when the route changes (adjust state during render, no effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setMobile(false);
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const probe = 36;
      const darkEls = document.querySelectorAll<HTMLElement>('[data-header="dark"]');
      let isDark = false;
      darkEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) isDark = true;
      });
      setDark(isDark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setMobile(false));
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const enter = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const onDark = dark && !open;

  return (
    <header
      className={cn(
        "no-print sticky top-0 z-50 transition-colors duration-300",
        onDark ? "bg-deep text-cream" : "bg-page text-ink",
        scrolled && !onDark && "shadow-[0_1px_0_rgb(16_31_30/0.06)]",
      )}
    >
      <div className="container-site flex h-[68px] items-center gap-8">
        <Link href="/" aria-label="Home" className="shrink-0">
          <Logo tone={onDark ? "light" : "dark"} />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
          {SITE_MENUS.map((m) => (
            <div key={m.label} className="relative" onMouseEnter={() => enter(m.label)} onMouseLeave={leave}>
              <button
                aria-expanded={open === m.label}
                onClick={() => setOpen((o) => (o === m.label ? null : m.label))}
                className={cn("flex h-10 items-center gap-1 rounded-btn px-3 text-base transition-colors", onDark ? "hover:text-white" : "hover:text-forest")}
              >
                {m.label}
                <ChevronDown className={cn("size-4 transition-transform duration-200", open === m.label && "rotate-180")} />
              </button>
            </div>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <ButtonLink href="/app" variant={onDark ? "outline-light" : "secondary"}>
            Open platform
          </ButtonLink>
          <ButtonLink href="/demo" variant={onDark ? "mint" : "primary"}>
            Request demo
          </ButtonLink>
        </div>
        <button className="ml-auto rounded-btn p-2 lg:hidden" aria-label="Open menu" aria-expanded={mobile} onClick={() => setMobile(true)}>
          <Menu className="size-6" />
        </button>
      </div>

      {/* Mega menu */}
      {SITE_MENUS.map((m) =>
        open === m.label ? (
          <div key={m.label} className="absolute inset-x-0 top-full hidden border-t border-line-2 bg-page shadow-float lg:block" onMouseEnter={() => enter(m.label)} onMouseLeave={leave}>
            <div className="container-site grid grid-cols-[1fr_320px] gap-10 py-8 animate-[fade_.2s_ease-out]">
              <ul className="grid grid-cols-2 content-start gap-x-8 gap-y-1">
                {m.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group block rounded-card p-3 transition-colors hover:bg-paper">
                      <span className="flex items-center gap-2 font-medium text-ink group-hover:text-forest">
                        {l.label}
                        <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      {l.description && <span className="mt-0.5 block text-sm text-muted">{l.description}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              {m.aside ? (
                <Link href={m.aside.href} className="group flex flex-col justify-between rounded-card bg-deep p-6 text-cream">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.08em] text-mint uppercase">Featured</div>
                    <div className="mt-3 text-xl font-light">{m.aside.title}</div>
                    <p className="mt-2 text-sm text-cream/70">{m.aside.body}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-mint">
                    {m.aside.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ) : (
                <Link href="/calculator" className="group flex flex-col justify-between rounded-card hero-gradient p-6">
                  <div>
                    <div className="eyebrow">Free tool</div>
                    <div className="mt-3 text-xl font-light text-ink">What does your hydrogen cost?</div>
                    <p className="mt-2 text-sm text-ink-2">Run a levelised cost estimate with transparent assumptions.</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest">
                    Open calculator <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        ) : null,
      )}

      {/* Mobile menu */}
      {mobile && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-page text-ink lg:hidden">
          <div className="flex h-[68px] items-center justify-between px-4">
            <Logo />
            <button aria-label="Close menu" className="rounded-btn p-2" onClick={() => setMobile(false)}>
              <X className="size-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {SITE_MENUS.map((m) => (
              <details key={m.label} className="group border-b border-line">
                <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-lg">
                  {m.label}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="pb-3">
                  {m.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} onClick={() => setMobile(false)} className="block rounded-btn px-2 py-2.5 text-ink-2 hover:bg-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <div className="mt-6 grid gap-3">
              <ButtonLink href="/app" variant="secondary" size="lg">
                Open platform
              </ButtonLink>
              <ButtonLink href="/demo" size="lg">
                Request demo
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
