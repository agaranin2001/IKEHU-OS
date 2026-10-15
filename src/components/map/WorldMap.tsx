"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { cn } from "@/components/ui/cn";

export interface MapPoint {
  id: string;
  lat: number;
  lon: number;
  /** Value used for marker size (e.g. MW). Null renders a hollow marker. */
  value: number | null;
  color: string;
  label: string;
  sub?: string;
}

export type MapView = "world" | "europe" | "mena" | "asia" | "americas";

export const MAP_VIEWS: { value: MapView; label: string; bbox: [number, number, number, number] }[] = [
  { value: "world", label: "World", bbox: [-170, -56, 180, 75] },
  { value: "europe", label: "Europe", bbox: [-12, 35, 34, 70] },
  { value: "mena", label: "Middle East & Africa", bbox: [-20, -36, 62, 38] },
  { value: "asia", label: "Asia-Pacific", bbox: [65, -45, 155, 50] },
  { value: "americas", label: "Americas", bbox: [-130, -56, -30, 60] },
];

const W = 960;
const BASE_H = 520;
const MIN_K = 1;
const MAX_K = 8;

/** Pan/zoom state: screen = k · map + (x, y), in viewBox units. */
interface Zoom {
  k: number;
  x: number;
  y: number;
}
const IDENTITY: Zoom = { k: 1, x: 0, y: 0 };

/** Keeps the map covering the viewport so it can't be dragged off-screen. `h` is the viewBox height. */
function clampZoom(z: Zoom, h: number): Zoom {
  const k = Math.min(MAX_K, Math.max(MIN_K, z.k));
  return { k, x: Math.min(0, Math.max(W - W * k, z.x)), y: Math.min(0, Math.max(h - h * k, z.y)) };
}

/** Zoom by `factor` keeping viewBox point (px, py) fixed under the cursor. */
function zoomAt(z: Zoom, factor: number, px: number, py: number, h: number): Zoom {
  const k = Math.min(MAX_K, Math.max(MIN_K, z.k * factor));
  const r = k / z.k;
  return clampZoom({ k, x: px - (px - z.x) * r, y: py - (py - z.y) * r }, h);
}

const COUNTRIES = feature(
  world as unknown as Topology,
  (world as unknown as Topology).objects.countries as GeometryCollection,
) as unknown as FeatureCollection<Geometry, { name: string }>;

export function WorldMap({
  points,
  selectedId,
  onSelect,
  view = "world",
  className,
  renderTooltip,
  maxValue,
  onCountrySelect,
  selectedCountry,
  fill = false,
}: {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  view?: MapView;
  className?: string;
  renderTooltip?: (p: MapPoint) => ReactNode;
  maxValue?: number;
  /** Called with the world-atlas country name when a country shape is clicked. */
  onCountrySelect?: (name: string) => void;
  /** World-atlas name of the highlighted country. */
  selectedCountry?: string | null;
  /** Fill the parent's full height (any aspect ratio) instead of the fixed 960×520 frame. */
  fill?: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Zoom>(IDENTITY);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // In `fill` mode the viewBox height follows the container's aspect ratio (width stays W).
  const [fillH, setFillH] = useState<number | null>(null);
  useEffect(() => {
    if (!fill) return;
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setFillH(Math.round((W * r.height) / r.width));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill]);
  const H = fill && fillH ? fillH : BASE_H;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; last?: { x: number; y: number }; dist?: number }>({ moved: false });

  // Each region view starts un-zoomed (reset during render when the view changes).
  const [zoomView, setZoomView] = useState(view);
  if (zoomView !== view) {
    setZoomView(view);
    setZoom(IDENTITY);
  }

  /** Client (CSS px) → viewBox coordinates. */
  const toView = useCallback((clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) * W) / r.width, y: ((clientY - r.top) * H) / r.height };
  }, [H]);

  // Wheel / trackpad zoom around the cursor (non-passive so the page doesn't scroll instead).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toView(e.clientX, e.clientY);
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
      setZoom((z) => zoomAt(z, factor, p.x, p.y, H));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toView, H]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, toView(e.clientX, e.clientY));
    if (pointers.current.size === 1) gesture.current = { moved: false, last: toView(e.clientX, e.clientY) };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.dist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = toView(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (pointers.current.size === 2 && g.dist) {
      // Pinch: scale around the midpoint.
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom((z) => zoomAt(z, dist / g.dist!, (a.x + b.x) / 2, (a.y + b.y) / 2, H));
      g.dist = dist;
      g.moved = true;
    } else if (pointers.current.size === 1 && g.last) {
      const dx = p.x - g.last.x;
      const dy = p.y - g.last.y;
      if (!g.moved && Math.hypot(dx, dy) < 4) return;
      if (!g.moved) svgRef.current?.setPointerCapture(e.pointerId);
      g.moved = true;
      g.last = p;
      setZoom((z) => clampZoom({ ...z, x: z.x + dx, y: z.y + dy }, H));
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.dist = undefined;
    if (pointers.current.size === 1) gesture.current.last = [...pointers.current.values()][0];
  };

  const zoomBy = (factor: number) => setZoom((z) => zoomAt(z, factor, W / 2, H / 2, H));

  const { path, projectMap } = useMemo(() => {
    const [x0, y0, x1, y1] = MAP_VIEWS.find((v) => v.value === view)!.bbox;
    const frame = {
      type: "MultiPoint" as const,
      coordinates: [
        [x0, y0],
        [x1, y0],
        [x0, y1],
        [x1, y1],
        [(x0 + x1) / 2, y0],
        [(x0 + x1) / 2, y1],
      ],
    };
    const projection = geoNaturalEarth1().fitExtent(
      [
        [12, 12],
        [W - 12, H - 12],
      ],
      frame,
    );
    return { path: geoPath(projection), projectMap: (lon: number, lat: number) => projection([lon, lat]) };
  }, [view, H]);
  const project = (lon: number, lat: number): [number, number] | null => {
    const xy = projectMap(lon, lat);
    return xy ? [xy[0] * zoom.k + zoom.x, xy[1] * zoom.k + zoom.y] : null;
  };

  const vmax = maxValue ?? Math.max(...points.map((p) => p.value ?? 0), 1);
  const grow = Math.sqrt(zoom.k);
  const radius = (v: number | null) => (v == null || v <= 0 ? 4.5 : 4 + Math.sqrt(v / vmax) * (view === "world" ? 18 : 24) * grow);

  // Draw larger markers first so small ones stay clickable.
  const sorted = [...points].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const hovered = points.find((p) => p.id === hover);
  const hoveredXY = hovered ? project(hovered.lon, hovered.lat) : null;

  return (
    <div ref={boxRef} className={cn("relative w-full overflow-hidden bg-[#eef1ef]", fill ? "h-full" : "rounded-card", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={cn("block w-full touch-none select-none", fill ? "h-full" : "h-auto", zoom.k > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
        role="img"
        aria-label="Map of hydrogen projects. Scroll or pinch to zoom, drag to pan."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const p = toView(e.clientX, e.clientY);
          setZoom((z) => zoomAt(z, 2, p.x, p.y, H));
        }}
      >
        <g transform={`translate(${zoom.x},${zoom.y}) scale(${zoom.k})`}>
          {COUNTRIES.features.map((f, i) => {
            const name = f.properties?.name;
            const selected = !!name && name === selectedCountry;
            const hovered = !!onCountrySelect && !!name && name === hoverCountry;
            return (
              <path
                key={i}
                d={path(f) ?? undefined}
                fill={selected ? "#b9cbc3" : hovered ? "#cfd8d3" : "#dfe3df"}
                stroke={selected ? "#16825f" : "#f7f6f3"}
                strokeWidth={selected ? 1.2 : 0.6}
                vectorEffect="non-scaling-stroke"
                className={cn("transition-[fill] duration-150", onCountrySelect && "cursor-pointer")}
                onMouseEnter={onCountrySelect ? () => setHoverCountry(name) : undefined}
                onMouseLeave={onCountrySelect ? () => setHoverCountry((c) => (c === name ? null : c)) : undefined}
                onClick={onCountrySelect && name ? () => !gesture.current.moved && onCountrySelect(name) : undefined}
              >
                {name && <title>{name}</title>}
              </path>
            );
          })}
        </g>
        <g>
          {sorted.map((p) => {
            const xy = project(p.lon, p.lat);
            if (!xy || xy[0] < -40 || xy[0] > W + 40 || xy[1] < -40 || xy[1] > H + 40) return null;
            const r = radius(p.value);
            const active = p.id === selectedId || p.id === hover;
            return (
              <g
                key={p.id}
                transform={`translate(${xy[0]},${xy[1]})`}
                role="button"
                tabIndex={0}
                aria-label={`${p.label}${p.sub ? `, ${p.sub}` : ""}`}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                onClick={() => !gesture.current.moved && onSelect?.(p.id)}
                onDoubleClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(p.id))}
                className="cursor-pointer outline-none"
              >
                {/* Generous invisible hit target */}
                <circle r={Math.max(r, 10)} fill="transparent" />
                <circle
                  r={r}
                  fill={p.value == null ? "#ffffff" : p.color}
                  fillOpacity={p.value == null ? 1 : active ? 0.95 : 0.72}
                  stroke={p.value == null ? p.color : "#ffffff"}
                  strokeWidth={p.value == null ? 2 : 1.5}
                  className="transition-[fill-opacity] duration-150"
                />
                {active && <circle r={r + 4} fill="none" stroke="#101f1e" strokeWidth={1.5} />}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="absolute top-3 right-3 z-[5] flex flex-col overflow-hidden rounded-btn border border-line bg-paper shadow-card">
        <button type="button" onClick={() => zoomBy(1.6)} disabled={zoom.k >= MAX_K} aria-label="Zoom in" className="grid size-8 place-items-center text-ink-2 hover:bg-paper-2 disabled:text-faint">
          <Plus className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} disabled={zoom.k <= MIN_K} aria-label="Zoom out" className="grid size-8 place-items-center border-t border-line-2 text-ink-2 hover:bg-paper-2 disabled:text-faint">
          <Minus className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={() => setZoom(IDENTITY)} disabled={zoom.k === 1} aria-label="Reset zoom" className="grid size-8 place-items-center border-t border-line-2 text-ink-2 hover:bg-paper-2 disabled:text-faint">
          <RotateCcw className="size-3.5" aria-hidden />
        </button>
      </div>
      {hovered && hoveredXY && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)]"
          style={{ left: `${(hoveredXY[0] / W) * 100}%`, top: `${(hoveredXY[1] / H) * 100}%` }}
        >
          {renderTooltip ? (
            renderTooltip(hovered)
          ) : (
            <div className="rounded-btn border border-line-2 bg-paper px-3 py-2 text-xs shadow-float">
              <div className="font-semibold text-ink">{hovered.label}</div>
              {hovered.sub && <div className="text-muted">{hovered.sub}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
