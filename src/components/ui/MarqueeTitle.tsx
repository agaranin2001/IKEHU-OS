"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "./cn";

/**
 * Single-line text that scrolls (marquee) only when it doesn't fit its
 * container; it slides to the end and back with pauses, and pauses on hover.
 * Reduced motion: falls back to an ellipsis. The full text stays accessible.
 */
export function MarqueeTitle({ children, className }: { children: ReactNode; className?: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const measure = () => setShift(Math.max(0, Math.ceil(text.scrollWidth - box.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(text);
    return () => ro.disconnect();
  }, [children]);

  const overflowing = shift > 0;
  // ~40 px/s plus the pauses built into the keyframes.
  const style = overflowing ? ({ "--marquee-shift": `-${shift + 24}px`, "--marquee-duration": `${Math.max(4, (shift + 24) / 40 / 0.76)}s` } as CSSProperties) : undefined;

  return (
    <span ref={boxRef} className={cn("block min-w-0 overflow-hidden whitespace-nowrap", overflowing && "title-marquee", className)} style={style} title={overflowing && typeof children === "string" ? children : undefined}>
      <span ref={textRef} className="inline-block">
        {children}
      </span>
    </span>
  );
}
