"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppTopBar } from "@/components/app/AppTopBar";
import { Drawer } from "@/components/ui/Drawer";
import { MarqueeTitle } from "@/components/ui/MarqueeTitle";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { APP_NAV, type AppNavItem } from "@/config/navigation";

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Platform" className="space-y-5">
      {APP_NAV.map((g) => (
        <div key={g.group}>
          {!collapsed && <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-cream/40 uppercase">{g.group}</div>}
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavLink({ item, active, collapsed, onNavigate }: { item: AppNavItem; active: boolean; collapsed?: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-btn text-sm transition-colors",
          collapsed ? "size-10 justify-center" : "h-9 px-3",
          active ? "bg-cream/12 text-white" : "text-cream/70 hover:bg-cream/8 hover:text-white",
        )}
      >
        <Icon className={cn("size-[18px] shrink-0", active ? "text-mint" : "")} aria-hidden />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.availability === "preview" && <span className="rounded bg-cream/10 px-1.5 text-[10px] text-cream/70">Preview</span>}
          </>
        )}
      </Link>
    </li>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // From md up only the content panel scrolls. CSS locks the document, but focus/scrollIntoView
  // can still scroll it programmatically — snap it back so the shell never shifts.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const pin = () => {
      if (desktop.matches && (window.scrollY || window.scrollX)) window.scrollTo(0, 0);
    };
    pin();
    window.addEventListener("scroll", pin, { passive: true });
    return () => window.removeEventListener("scroll", pin);
  }, []);

  return (
    <div className="app-shell app-flat min-h-dvh bg-page md:h-dvh md:overflow-clip print:h-auto print:overflow-visible">
      <AppTopBar />
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="no-print sticky top-[60px] hidden h-[calc(100dvh-60px)] shrink-0 pb-3 pl-3 md:block">
          <aside className={cn("flex h-full flex-col overflow-hidden rounded-2xl bg-deep text-cream transition-[width] duration-300", collapsed ? "w-[68px]" : "w-[248px]")}>
            <div className={cn("scrollbar-thin flex-1 overflow-y-auto py-4", collapsed ? "px-[14px]" : "px-3")}>
              <NavList collapsed={collapsed} />
            </div>
            <div className={cn("border-t border-cream/10 p-3", collapsed && "flex justify-center")}>
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="flex items-center gap-2 rounded-btn p-2 text-xs text-cream/60 hover:bg-cream/8 hover:text-white"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                {!collapsed && "Collapse"}
              </button>
            </div>
          </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between bg-deep px-4 text-cream md:hidden">
            <Link href="/" aria-label="Back to website">
              <Logo tone="light" />
            </Link>
            <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-btn p-2 hover:bg-cream/10">
              <Menu className="size-5" />
            </button>
          </header>
          <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title={<span className="font-semibold">Platform</span>} width="max-w-xs">
            <div className="-mx-6 -my-5 min-h-full bg-deep px-4 py-5">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </div>
          </Drawer>
          <main className="min-w-0 flex-1 md:px-3 md:pb-3">
            <div id="app-content" className="scrollbar-thin md:h-[calc(100dvh-72px)] md:overflow-y-auto md:overscroll-contain md:rounded-2xl md:border md:border-line print:h-auto print:overflow-visible">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Standard page header used by every platform screen: a bar with the title and
 * actions, then (optionally) a context row under the divider for back links,
 * description and dataset badges.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  /** Back link or breadcrumb, shown in the context row under the header. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  const context = eyebrow || description || meta;
  return (
    <>
      <div className="border-b border-line bg-page">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap md:px-8 md:py-5">
          <h1 className="flex min-h-12 min-w-0 flex-[1_1_16rem] items-center text-[28px] leading-tight font-light tracking-[-0.01em] text-ink md:text-[34px]">
            <MarqueeTitle>{title}</MarqueeTitle>
          </h1>
          {actions && <div className="no-print flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      {context && (
        <div className="mx-auto -mb-2 max-w-[1480px] px-4 pt-6 md:px-8">
          {eyebrow && <div className="mb-2 text-xs font-medium text-muted">{eyebrow}</div>}
          {description && <p className="max-w-3xl text-[15px] leading-relaxed text-ink-2">{description}</p>}
          {meta && <div className={cn("flex flex-wrap items-center gap-2", description && "mt-3")}>{meta}</div>}
        </div>
      )}
    </>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1480px] px-4 py-6 md:px-8", className)}>{children}</div>;
}
