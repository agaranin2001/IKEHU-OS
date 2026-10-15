"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface SourcesPanel {
  id: string;
  label: string;
  content: ReactNode;
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * Chip tabs for Sources & Methodology: one section at a time. The active tab lives in the URL
 * hash, so links such as `/app/sources#lcoh-methodology` open that tab.
 */
export function SourcesTabs({ panels }: { panels: SourcesPanel[] }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const active = panels.find((p) => p.id === hash) ?? panels[0];

  const select = (id: string) => {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Sources & methodology sections" className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {panels.map((p) => {
          const selected = p.id === active.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`panel-${p.id}`}
              onClick={() => select(p.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[13px] whitespace-nowrap transition-colors",
                selected ? "border-forest bg-forest text-white" : "border-line bg-paper text-ink-2 hover:border-forest hover:text-forest",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`}>
        {active.content}
      </div>
    </div>
  );
}
