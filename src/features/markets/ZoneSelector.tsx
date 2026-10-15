"use client";

import { Check, ChevronDown } from "lucide-react";
import { useId } from "react";
import { createPortal } from "react-dom";
import type { BiddingZone } from "@/domain/types";
import { Label, popupClass, popupStyle, triggerClass, useAnchoredPopup } from "@/components/ui/Fields";
import { cn } from "@/components/ui/cn";
import { MAX_ZONES, groupZones, slotColor, type ZoneSlot } from "./marketMath";

/**
 * Multi-select dropdown for bidding zones, grouped by region. The trigger lists
 * the chosen zones in their chart colours; each zone keeps its stable slot colour.
 */
export function ZoneSelector({
  zones,
  selection,
  onToggle,
  onReset,
  onClear,
  isDefault,
  className,
}: {
  zones: BiddingZone[];
  selection: ZoneSlot[];
  onToggle: (code: string) => void;
  onReset: () => void;
  onClear: () => void;
  isDefault: boolean;
  className?: string;
}) {
  const id = useId();
  const { triggerRef, popupRef, open, setOpen, show, pos } = useAnchoredPopup<HTMLButtonElement, HTMLDivElement>(420);
  const slotOf = new Map(selection.map((s) => [s.code, s.slot]));
  const full = selection.length >= MAX_ZONES;
  const groups = groupZones(zones);

  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={id} hint={selection.length ? `${selection.length} of ${MAX_ZONES}` : "All zones"}>
        Bidding zones
      </Label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className={cn(triggerClass, "h-[42px]", open && "border-forest ring-2 ring-forest/15")}
      >
        <span className="flex min-w-0 items-center gap-3 overflow-hidden">
          {selection.length === 0 ? (
            <span className="text-ink-2">All zones</span>
          ) : (
            selection.map((s) => (
              <span key={s.code} className="num inline-flex shrink-0 items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full" style={{ background: slotColor(s.slot) }} />
                {s.code}
              </span>
            ))
          )}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label="Choose bidding zones"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
                triggerRef.current?.focus({ preventScroll: true });
              }
            }}
            style={{ ...popupStyle(pos), minWidth: Math.max(pos.width, 280) }}
            className={cn(popupClass, "p-0")}
          >
            <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b border-line-2 bg-paper px-3 py-2">
              <span className={cn("num text-xs", full ? "text-warn" : "text-muted")} aria-live="polite">
                {selection.length ? `${selection.length} of ${MAX_ZONES} selected` : `None selected — showing all ${zones.length}`}{full ? " — deselect one to add another" : ""}
              </span>
              <span className="flex items-center gap-1">
                <button type="button" onClick={onReset} disabled={isDefault} className="rounded-btn px-2 py-1 text-xs font-medium text-forest hover:bg-stone disabled:text-faint disabled:hover:bg-transparent">
                  Reset
                </button>
                <button type="button" onClick={onClear} disabled={selection.length === 0} className="rounded-btn px-2 py-1 text-xs font-medium text-forest hover:bg-stone disabled:text-faint disabled:hover:bg-transparent">
                  Clear
                </button>
              </span>
            </div>
            <div className="p-1">
              {groups.map((g) => (
                <div key={g.group} role="group" aria-label={g.group}>
                  <div className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium tracking-wide text-faint uppercase">{g.group}</div>
                  {g.zones.map((z) => {
                    const slot = slotOf.get(z.code);
                    const active = slot != null;
                    const disabled = !active && full;
                    return (
                      <button
                        key={z.code}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => onToggle(z.code)}
                        title={disabled ? `Maximum of ${MAX_ZONES} zones selected` : undefined}
                        className="flex w-full items-center gap-3 rounded-btn px-2.5 py-2 text-left text-sm hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                      >
                        <span
                          aria-hidden
                          className={cn("grid size-4 shrink-0 place-items-center rounded border", active ? "border-transparent" : "border-line")}
                          style={active ? { background: slotColor(slot) } : undefined}
                        >
                          {active && <Check className="size-3 text-white" strokeWidth={3} />}
                        </span>
                        <span className={cn("num w-12 shrink-0", active ? "font-medium text-ink" : "text-ink-2")}>{z.code}</span>
                        <span className="truncate text-xs text-muted">{z.name}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
