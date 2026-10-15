"use client";

import { SlidersHorizontal } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "./cn";
import { Drawer } from "./Drawer";
import { SearchInput } from "./Fields";

/**
 * Page-level search field + "Filters" button. The filter controls live in a right-hand drawer,
 * so every list screen shares one toolbar style.
 */
export function FilterBar({
  search,
  onSearch,
  placeholder,
  searchLabel,
  activeCount,
  onClear,
  clearDisabled = activeCount === 0,
  showLabel = "Show results",
  drawerWidth = "max-w-md",
  className,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  searchLabel: string;
  /** Number of active filters (search excluded); shown as a badge on the button. */
  activeCount: number;
  onClear: () => void;
  clearDisabled?: boolean;
  /** Label of the drawer's primary button, e.g. "Show 12 projects". */
  showLabel?: string;
  drawerWidth?: string;
  className?: string;
  /** Filter controls rendered inside the drawer. */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Stable: Drawer re-runs its focus effect when onClose changes identity.
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className={cn("flex items-center gap-3", className)}>
        <SearchInput size="lg" className="min-w-0 flex-1" value={search} onChange={onSearch} placeholder={placeholder} label={searchLabel} />
        <Button variant="secondary" className="group h-12! shrink-0 px-5!" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="num rounded-full bg-forest px-1.5 text-[11px] text-white group-hover:bg-white group-hover:text-forest">{activeCount}</span>
          )}
        </Button>
      </div>

      <Drawer
        open={open}
        onClose={close}
        width={drawerWidth}
        title={
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-ink">Filters</span>
            {activeCount > 0 && <span className="num text-xs text-muted">{activeCount} active</span>}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClear} disabled={clearDisabled}>
              Clear all{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <Button size="sm" onClick={close}>
              {showLabel}
            </Button>
          </div>
        }
      >
        {children}
      </Drawer>
    </>
  );
}

/** Labelled group of controls inside the filter drawer. */
export function FilterSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-ink-2">{label}</legend>
      {children}
    </fieldset>
  );
}
