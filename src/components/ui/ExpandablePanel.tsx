"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Panel } from "./Panel";
import { cn } from "./cn";

/**
 * Panel with an expand button in its header: fills the window and puts the
 * browser in full screen (the whole document, so drawers and dropdowns still
 * layer on top). Escape, leaving full screen or the button collapses it.
 * `children` receives the expanded state; in it the body is a full-height flex column.
 */
export function ExpandablePanel({
  title,
  subtitle,
  actions,
  footer,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: (expanded: boolean) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      // Leave Escape to an open drawer/dialog first.
      if (e.key === "Escape" && !document.querySelector('[aria-modal="true"]')) setExpanded(false);
    };
    // Leaving browser full screen (Esc, F11, browser UI) also collapses the panel.
    const onFullscreen = () => {
      if (!document.fullscreenElement) setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [expanded]);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    // Whole document goes full screen so drawers and dropdowns still layer on top. Needs the click gesture.
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      footer={footer}
      className={cn(className, expanded && "fixed inset-0 z-50 flex flex-col overflow-hidden rounded-none border-0")}
      bodyClassName={cn(bodyClassName ?? "p-5", expanded && "flex min-h-0 flex-1 flex-col")}
      actions={
        <>
          {actions}
          <button
            type="button"
            onClick={toggle}
            aria-label={expanded ? "Exit full screen" : "Full screen"}
            title={expanded ? "Exit full screen (Esc)" : "Full screen"}
            className="grid size-8 place-items-center rounded-btn border border-line text-ink-2 transition-colors hover:border-forest hover:text-forest"
          >
            {expanded ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
          </button>
        </>
      }
    >
      {children(expanded)}
    </Panel>
  );
}
