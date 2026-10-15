"use client";

import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

const noopSubscribe = () => () => {};

/**
 * Accessible side panel / modal. Closes on Escape and backdrop click.
 * Portalled to <body> so the overlay and panel always span the full viewport height.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = "max-w-xl",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  side?: "right" | "center";
  width?: string;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, so the portal only targets a real document.body.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // Keep the latest onClose without re-running the open effect (which moves focus).
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex h-dvh">
      <button aria-label="Close" className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[fade_.2s_ease-out]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex w-full flex-col bg-paper shadow-float outline-none",
          side === "right" ? cn("ml-auto h-full", width, "animate-[slidein_.28s_cubic-bezier(.22,1,.36,1)]") : cn("m-auto max-h-[90dvh] rounded-panel", width, "animate-[pop_.22s_ease-out]"),
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-2 px-6 py-4">
          <div className="min-w-0 flex-1">{title}</div>
          <button onClick={onClose} aria-label="Close panel" className="rounded-btn p-1.5 text-muted hover:bg-stone hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line-2 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
