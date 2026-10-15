"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

const control =
  "w-full rounded-btn border border-line bg-paper px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-sage focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 aria-[invalid=true]:border-bad";

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium text-ink-2">
      <span>{children}</span>
      {hint && <span className="font-normal text-faint">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; error?: string; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(control, "h-[42px]")} {...props} />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({ label, error, className, ...props }: ComponentProps<"textarea"> & { label: string; error?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <textarea id={id} aria-invalid={!!error} className={cn(control, "min-h-24 py-2.5")} {...props} />
      {error && <p className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  );
}

const POPUP_MAX_W = 420;

/** Position of a popup anchored to its trigger (fixed, viewport coordinates). */
export interface PopupPosition {
  /** Set when the popup opens rightward from the trigger's left edge. */
  left?: number;
  /** Set when the trigger sits near the right edge: the popup aligns to the trigger's right edge instead. */
  right?: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

/**
 * Popup anchored to a trigger: opens below (or above when there is no room),
 * follows scroll/resize, and closes on outside click. Render the popup with
 * `createPortal` and `popupStyle(pos)` so overflow containers never clip it.
 */
export function useAnchoredPopup<T extends HTMLElement = HTMLButtonElement, P extends HTMLElement = HTMLElement>(maxHeight = 320) {
  const triggerRef = useRef<T>(null);
  const popupRef = useRef<P>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPosition | null>(null);

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const gap = 6;
    const below = window.innerHeight - r.bottom - gap - 8;
    const above = r.top - gap - 8;
    const up = below < 200 && above > below;
    // Popups can grow to POPUP_MAX_W; flip to right-alignment if that would overflow the viewport.
    const flip = r.left + Math.max(r.width, POPUP_MAX_W) > window.innerWidth - 8;
    setPos({
      ...(flip ? { right: window.innerWidth - r.right } : { left: r.left }),
      width: r.width,
      ...(up ? { bottom: window.innerHeight - r.top + gap } : { top: r.bottom + gap }),
      maxHeight: Math.min(maxHeight, up ? above : below),
    });
  }, [maxHeight]);

  const show = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popupRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return { triggerRef, popupRef, open, setOpen, show, pos };
}

export function popupStyle(pos: PopupPosition) {
  return { left: pos.left, right: pos.right, minWidth: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight };
}

/** Shared look for dropdown triggers and popups. */
export const triggerClass = cn(control, "flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50");
export const popupClass =
  "scrollbar-thin fixed z-[100] max-w-[min(420px,calc(100vw-16px))] overflow-y-auto rounded-xl border border-line bg-paper p-1 shadow-float animate-[pop_.12s_ease-out]";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Custom dropdown (button + listbox) with the same props as a native select:
 * `onChange` receives `{ target: { value } }`, and `name` posts via a hidden input.
 * The list renders in a portal so scrolling panels and drawers never clip it.
 */
export function SelectField({
  label,
  options,
  className,
  triggerClassName,
  value,
  onChange,
  name,
  disabled,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: {
  label?: string;
  options: SelectOption[];
  className?: string;
  /** Extra classes for the trigger, e.g. a taller height to match text inputs. */
  triggerClassName?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  name?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-list`;
  const { triggerRef, popupRef: listRef, open, setOpen, show, pos } = useAnchoredPopup<HTMLButtonElement, HTMLUListElement>();
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  const openList = () => {
    if (disabled) return;
    setActive(selectedIndex);
    show();
  };

  const commit = (i: number) => {
    const o = options[i];
    if (o && o.value !== value) onChange?.({ target: { value: o.value } });
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listRef]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    const moves: Record<string, (a: number) => number> = {
      ArrowDown: (a) => Math.min(a + 1, options.length - 1),
      ArrowUp: (a) => Math.max(a - 1, 0),
      Home: () => 0,
      End: () => options.length - 1,
    };
    if (moves[e.key]) {
      e.preventDefault();
      setActive(moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(active);
    } else if (e.key === "Escape") {
      // Close only the dropdown, not an enclosing drawer/dialog.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      // Type-ahead: jump to the next option starting with the typed character.
      const k = e.key.toLowerCase();
      const n = options.length;
      for (let step = 1; step <= n; step++) {
        const i = (active + step) % n;
        if (options[i].label.toLowerCase().startsWith(k)) {
          setActive(i);
          break;
        }
      }
    }
  };

  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(triggerClass, "h-[38px]", triggerClassName, open && "border-forest ring-2 ring-forest/15")}
      >
        <span className={cn("truncate", !selected?.value && "text-ink-2")}>{selected?.label ?? ""}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            style={popupStyle(pos)}
            className={popupClass}
          >
            {options.map((o, i) => {
              const isSelected = i === selectedIndex && o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(i)}
                  className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-btn px-2.5 py-2 text-sm", i === active ? "bg-paper-2 text-ink" : "text-ink-2", isSelected && "font-medium text-ink")}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-forest" aria-hidden />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}

export interface MultiOption {
  value: string;
  label: string;
  /** Optional count shown on the right (e.g. matching records). */
  count?: number;
  /** Optional colour dot (e.g. project status). */
  color?: string;
  /** Optional tooltip. */
  title?: string;
}

/**
 * Multi-select dropdown: trigger summarises the selection ("All …" when empty,
 * otherwise the first label plus "+N"); the popup lists checkable options.
 */
export function MultiSelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  className,
  triggerClassName,
  emptyText = "No options",
}: {
  label?: string;
  options: MultiOption[];
  value: string[];
  onChange: (next: string[]) => void;
  /** Trigger text when nothing is selected, e.g. "All statuses". */
  placeholder: string;
  className?: string;
  triggerClassName?: string;
  emptyText?: string;
}) {
  const id = useId();
  const { triggerRef, popupRef, open, setOpen, show, pos } = useAnchoredPopup<HTMLButtonElement, HTMLDivElement>();
  const chosen = options.filter((o) => value.includes(o.value));
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const summary = chosen.length === 0 ? placeholder : chosen.length === 1 ? chosen[0].label : `${chosen[0].label} +${chosen.length - 1}`;

  return (
    <div className={cn("min-w-0", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ? undefined : placeholder}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          } else if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
        className={cn(triggerClass, "h-[38px]", triggerClassName, open && "border-forest ring-2 ring-forest/15")}
      >
        <span className="flex min-w-0 items-center gap-2">
          {chosen.length === 1 && chosen[0].color && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: chosen[0].color }} />}
          <span className={cn("truncate", chosen.length === 0 ? "text-ink-2" : "text-ink")}>{summary}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={popupRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
                triggerRef.current?.focus({ preventScroll: true });
              }
            }}
            style={{ ...popupStyle(pos), minWidth: Math.max(pos.width, 220) }}
            className={cn(popupClass, "p-0")}
          >
            <div role="listbox" aria-multiselectable aria-labelledby={id} className="p-1">
              {options.length === 0 && <p className="px-2.5 py-2 text-sm text-faint">{emptyText}</p>}
              {options.map((o) => {
                const on = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={on}
                    title={o.title}
                    onClick={() => toggle(o.value)}
                    className="flex w-full items-center gap-2.5 rounded-btn px-2.5 py-2 text-left text-sm hover:bg-paper-2"
                  >
                    <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded border", on ? "border-forest bg-forest" : "border-line")}>
                      {on && <Check className="size-3 text-white" strokeWidth={3} />}
                    </span>
                    {o.color && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />}
                    <span className={cn("flex-1 truncate", on ? "text-ink" : "text-ink-2")}>{o.label}</span>
                    {o.count != null && <span className="num text-xs text-faint">{o.count}</span>}
                  </button>
                );
              })}
            </div>
            {value.length > 0 && (
              <div className="sticky bottom-0 border-t border-line-2 bg-paper px-3 py-2">
                <button type="button" onClick={() => onChange([])} className="text-xs font-medium text-forest hover:underline">
                  Clear ({value.length})
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  label = "Search",
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  /** "lg": taller field used by the page-level FilterBar. */
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className={cn("pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-faint", size === "lg" ? "left-3.5" : "left-3")} />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(control, size === "lg" ? "h-12 pl-10 text-[15px]" : "h-[38px] pl-9", "pr-8 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-faint hover:text-ink">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Toggleable filter chip. */
export function Chip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
        active ? "border-forest bg-forest text-white" : "border-line bg-paper text-ink-2 hover:border-sage",
      )}
    >
      {children}
      {count != null && <span className={cn("num text-[11px]", active ? "text-white/70" : "text-faint")}>{count}</span>}
    </button>
  );
}

export function Checkbox({ checked, onChange, label, count }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm text-ink-2 hover:bg-paper-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-line accent-forest" />
      <span className="flex-1">{label}</span>
      {count != null && <span className="num text-xs text-faint">{count}</span>}
    </label>
  );
}

/** Segmented control used for tabs and view toggles (Arcadia-style pill group). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
  label,
  fill = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  size?: "sm" | "md";
  label?: string;
  /** Stretch to the container width with equal-width options. */
  fill?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn(fill ? "flex w-full" : "inline-flex", "rounded-btn border border-line bg-paper-2 p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[6px] font-medium transition-colors",
            fill && "flex-1 justify-center",
            size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3.5 text-[13px]",
            o.value === value ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
