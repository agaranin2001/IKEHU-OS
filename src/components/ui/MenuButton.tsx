"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { buttonClass, type ButtonStyleProps } from "./Button";
import { popupClass, popupStyle, useAnchoredPopup } from "./Fields";
import { cn } from "./cn";

export interface MenuItem {
  key: string;
  label: ReactNode;
  /** Secondary text under the label, e.g. a file format note. */
  hint?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

/** Button that opens a menu of actions (e.g. "Download ▾" → CSV / JSON / PDF). */
export function MenuButton({ label, items, variant, size, className }: { label: ReactNode; items: MenuItem[] } & ButtonStyleProps) {
  const { triggerRef, popupRef, open, setOpen, show, pos } = useAnchoredPopup<HTMLButtonElement, HTMLDivElement>();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus the first enabled item when the menu opens.
  useEffect(() => {
    if (open) itemRefs.current.find((b) => b && !b.disabled)?.focus({ preventScroll: true });
  }, [open]);

  const move = (dir: 1 | -1) => {
    const enabled = itemRefs.current.filter((b): b is HTMLButtonElement => !!b && !b.disabled);
    const i = enabled.indexOf(document.activeElement as HTMLButtonElement);
    enabled[(i + dir + enabled.length) % enabled.length]?.focus({ preventScroll: true });
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
        className={buttonClass({ variant, size, className })}
      >
        {label}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={popupRef}
            role="menu"
            style={{ ...popupStyle(pos), minWidth: Math.max(pos.width, 200) }}
            className={popupClass}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                move(e.key === "ArrowDown" ? 1 : -1);
              } else if (e.key === "Escape") {
                e.stopPropagation();
                close();
              } else if (e.key === "Tab") setOpen(false);
            }}
          >
            {items.map((it, i) => (
              <button
                key={it.key}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  close();
                  it.onSelect();
                }}
                className="flex w-full items-center gap-3 rounded-btn px-2.5 py-2 text-left text-sm text-ink outline-none hover:bg-paper-2 focus-visible:bg-paper-2 disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
              >
                {it.icon && <span className="shrink-0 text-muted">{it.icon}</span>}
                <span className="min-w-0">
                  <span className="block">{it.label}</span>
                  {it.hint && <span className="block text-xs text-muted">{it.hint}</span>}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
