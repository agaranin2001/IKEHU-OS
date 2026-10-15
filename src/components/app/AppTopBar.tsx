"use client";

import { Calculator, CalendarClock, Check, ChevronDown, FileText, Globe, HardHat, ListChecks, Plus, Search, Settings, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { APP_NAV_FLAT } from "@/config/navigation";
import { NotificationsMenu } from "./NotificationsMenu";

const SHORTCUTS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app/opportunities", label: "Upcoming deadlines", icon: CalendarClock },
  { href: "/app/workspace", label: "Workspace tasks", icon: ListChecks },
  { href: "/app/sources", label: "Sources & methodology", icon: FileText },
];

const iconBtn = "grid size-9 place-items-center rounded-btn text-ink-2 transition-colors hover:bg-stone hover:text-ink";

const WORKSPACE_ACTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Settings", icon: Settings },
  { label: "People", icon: Users },
];

const MANAGE_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app/workspace", label: "Project workspace", icon: HardHat },
  { href: "/app/calculator", label: "LCOH scenarios", icon: Calculator },
  { href: "/app/sources", label: "Sources & methodology", icon: FileText },
  { href: "/", label: "Back to website", icon: Globe },
];

/** Rand Hydrogen mark (from randhydrogen.com) on a dark tile. */
function WorkspaceMark({ className, iconSize }: { className?: string; iconSize: number }) {
  return (
    <span className={cn("grid shrink-0 place-items-center bg-deep", className)}>
      <Image src="/brand/rand-hydrogen-mark.svg" alt="" width={iconSize} height={iconSize} aria-hidden />
    </span>
  );
}

/** Workspace switcher pill with a menu: workspace card, manage links and workspace list. */
function WorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 items-center gap-2 rounded-btn bg-stone/70 pr-2 pl-1.5 text-[15px] font-semibold text-ink transition-colors hover:bg-stone"
      >
        <WorkspaceMark className="size-7 rounded-md" iconSize={18} />
        Rand Hydrogen
        <ChevronDown className={cn("size-4 text-ink-2 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label="Workspace" className="absolute top-full left-0 z-50 mt-1.5 w-[300px] overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <WorkspaceMark className="size-11 rounded-xl" iconSize={26} />
              <div className="min-w-0 truncate text-[15px] font-semibold text-ink">Rand Hydrogen</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {WORKSPACE_ACTIONS.map(({ label, icon: Icon }) => (
                <button key={label} type="button" disabled title={`${label} — planned`} className="flex h-9 items-center justify-center gap-2 rounded-btn border border-line text-sm text-ink-2 disabled:cursor-not-allowed disabled:opacity-60">
                  <Icon className="size-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-line-2 p-2">
            <div className="px-2.5 pt-1 pb-1.5 text-xs text-muted">Manage</div>
            {MANAGE_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} role="menuitem" href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-btn px-2.5 py-2 text-sm text-ink hover:bg-paper-2">
                <Icon className="size-4 text-ink-2" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-line-2 p-2">
            <div className="px-2.5 pt-1 pb-1.5 text-xs text-muted">Switch workspaces</div>
            <button type="button" role="menuitemradio" aria-checked onClick={() => setOpen(false)} className="flex w-full items-center gap-3 rounded-btn px-2.5 py-2 text-sm text-ink hover:bg-paper-2">
              <WorkspaceMark className="size-7 rounded-md" iconSize={16} />
              <span className="flex-1 text-left">Rand Hydrogen</span>
              <Check className="size-4 text-forest" aria-hidden />
            </button>
            <button type="button" disabled title="Create workspace — planned" className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-btn border border-line text-sm text-ink-2 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus className="size-4" aria-hidden />
              Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Quick-jump search across platform modules; ⌘K / Ctrl+K focuses it. */
function ModuleSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return APP_NAV_FLAT;
    return APP_NAV_FLAT.filter((i) => `${i.label} ${i.short} ${i.description}`.toLowerCase().includes(t));
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    router.push(href);
    setQ("");
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-[420px]">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={q}
        placeholder="Search"
        aria-label="Search platform modules"
        role="combobox"
        aria-expanded={focused && results.length > 0}
        aria-controls="module-search-results"
        onChange={(e) => (setQ(e.target.value), setActive(0))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((a) => Math.min(Math.max(a + step, 0), results.length - 1));
          } else if (e.key === "Enter" && results[active]) go(results[active].href);
          else if (e.key === "Escape") inputRef.current?.blur();
        }}
        className="h-9 w-full rounded-full border border-line bg-paper pr-14 pl-9 text-sm text-ink placeholder:text-faint focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-sans text-xs text-faint">⌘K</kbd>
      {focused && results.length > 0 && (
        <ul id="module-search-results" role="listbox" className="absolute top-full right-0 left-0 z-50 mt-1.5 rounded-xl border border-line bg-paper p-1.5 shadow-lg">
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <li key={item.href} role="option" aria-selected={i === active}>
                <button
                  onMouseDown={(e) => (e.preventDefault(), go(item.href))}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex w-full items-center gap-3 rounded-btn px-2.5 py-2 text-left", i === active && "bg-paper-2")}
                >
                  <Icon className="size-4 shrink-0 text-forest" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm text-ink">{item.label}</span>
                    <span className="block truncate text-xs text-muted">{item.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Desktop top bar for the platform: workspace, module search, shortcuts and account. */
export function AppTopBar() {
  return (
    <header className="no-print sticky top-0 z-30 hidden h-[60px] grid-cols-[1fr_minmax(0,420px)_1fr] items-center gap-4 bg-page px-3 md:grid">
      <div className="flex items-center gap-1.5">
        <WorkspaceMenu />
      </div>
      <ModuleSearch />
      <div className="flex items-center justify-end gap-0.5">
        {SHORTCUTS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} title={label} aria-label={label} className={iconBtn}>
            <Icon className="size-[18px]" aria-hidden />
          </Link>
        ))}
        <NotificationsMenu />
        <Image src="/images/founders/hando-rand.jpg" alt="Hando Rand" title="Hando Rand" width={64} height={64} className="ml-2 size-8 rounded-full object-cover" />
      </div>
    </header>
  );
}
