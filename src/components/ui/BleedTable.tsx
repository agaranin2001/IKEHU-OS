"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "./cn";

export interface BleedColumn {
  key: string;
  /** Visible header content (may be interactive, e.g. a sort button). */
  label: ReactNode;
  /** Plain-text header for assistive tech. */
  srLabel: string;
  /** Column width, e.g. "12%". Header and body share it via <colgroup>. */
  width: string;
  headClassName?: string;
  ariaSort?: "ascending" | "descending";
}

/** Nearest scrolling ancestor; null means the window scrolls. */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === "auto" || overflowY === "scroll") return p;
  }
  return null;
}

/**
 * Data table card that, once scrolled to the top of the viewport, smoothly widens to the
 * full width of the scroll area and pins its header. The header lives in its own table
 * (synced horizontally with the body) so it can stay sticky while the body scrolls sideways.
 */
export function BleedTable({
  columns,
  minWidth,
  children,
  footer,
  label,
}: {
  columns: BleedColumn[];
  /** Below this width the body scrolls horizontally. */
  minWidth: number;
  /** <tr> rows. */
  children: ReactNode;
  footer?: ReactNode;
  /** Accessible table name. */
  label: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [inset, setInset] = useState({ left: 0, right: 0 });

  // Distance from the card's resting edges to the scroll area's inner edges.
  const measure = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const root = scrollParent(frame);
    const f = frame.getBoundingClientRect();
    const left = root ? root.getBoundingClientRect().left + root.clientLeft : 0;
    const right = root ? left + root.clientWidth : document.documentElement.clientWidth;
    setInset({ left: Math.max(0, f.left - left), right: Math.max(0, right - f.right) });
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const sentinel = sentinelRef.current;
    const head = headRef.current;
    if (!frame || !sentinel || !head) return;
    const root = scrollParent(frame);
    const stickyTop = parseFloat(getComputedStyle(head).top) || 0;

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root ?? document.documentElement);
    ro.observe(frame);

    // Expanded while the sentinel (just above the card) sits above the sticky line.
    const io = new IntersectionObserver(
      ([e]) => {
        const rootTop = e.rootBounds?.top ?? 0;
        setExpanded(!e.isIntersecting && e.boundingClientRect.top < rootTop + 1);
      },
      { root, rootMargin: `-${stickyTop}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(sentinel);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [measure]);

  const syncHead = () => {
    if (headRef.current && bodyRef.current) headRef.current.scrollLeft = bodyRef.current.scrollLeft;
  };

  const colgroup = (
    <colgroup>
      {columns.map((c) => (
        <col key={c.key} style={{ width: c.width }} />
      ))}
    </colgroup>
  );
  const tableStyle: CSSProperties = { minWidth };
  const cardStyle: CSSProperties = expanded ? { marginLeft: -inset.left, marginRight: -inset.right } : {};

  return (
    <div ref={frameRef}>
      <div ref={sentinelRef} aria-hidden />
      <div
        style={cardStyle}
        className={cn(
          "overflow-clip border-line-2 bg-paper shadow-card transition-[margin,border-radius,border-color] duration-300 ease-out motion-reduce:transition-none",
          expanded ? "rounded-none border-y" : "rounded-card border",
        )}
      >
        <div ref={headRef} className="sticky top-14 z-10 overflow-hidden border-b border-line-2 bg-paper-2 md:top-0">
          {/* Visual header only; the body table carries an sr-only header for assistive tech. */}
          <table role="presentation" className="w-full table-fixed text-left text-xs text-muted" style={tableStyle}>
            {colgroup}
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn("px-4 py-2.5 font-medium", c.headClassName)}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div ref={bodyRef} onScroll={syncHead} className="scrollbar-thin overflow-x-auto">
          <table aria-label={label} className="w-full table-fixed text-left text-[13px]" style={tableStyle}>
            {colgroup}
            <thead className="sr-only">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" aria-sort={c.ariaSort}>
                    {c.srLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
        {footer}
      </div>
    </div>
  );
}
