import type { ReactNode } from "react";
import { cn } from "./cn";

/** Uppercase topic chip with a square dot, as on the R&D Library cards. */
export function TopicTag({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 self-start rounded-btn bg-paper-2 px-3 py-1.5 text-[13px] font-medium tracking-[0.08em] text-ink uppercase", className)}>
      <span aria-hidden className={cn("size-2.5 shrink-0", !color && "bg-forest")} style={color ? { background: color } : undefined} />
      {children}
    </span>
  );
}
