"use client";

import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/land-110m.json";

/** Land polygons without Antarctica. */
const LAND: FeatureCollection<Polygon> = (() => {
  const topo = world as unknown as Topology;
  const land = feature(topo, topo.objects.land as GeometryCollection) as unknown as FeatureCollection | Feature;
  const features = "features" in land ? land.features : [land];
  const polys: Feature<Polygon>[] = [];
  for (const f of features) {
    const g = f.geometry as Polygon | MultiPolygon;
    for (const coordinates of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
      const poly: Polygon = { type: "Polygon", coordinates };
      if (geoCentroid(poly)[1] > -56) polys.push({ type: "Feature", properties: {}, geometry: poly });
    }
  }
  return { type: "FeatureCollection", features: polys };
})();

interface Cell {
  x: number;
  y: number;
  project: boolean;
  alpha: number;
  /** Scroll progress at which this cell starts to break away. */
  start: number;
  dx: number;
  dy: number;
  grow: number;
  appear: number;
}

const MINT = "15, 255, 135";
const FOREST = "16, 67, 54";

/** Deterministic PRNG so the dissolve pattern is stable across renders. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function buildCells(width: number, height: number, points: { lat: number; lon: number }[]) {
  const cell = width < 640 ? 7 : 10;
  const mapW = Math.min(width * 0.94, 1400);
  const mapH = Math.min(height * 0.78, mapW * 0.52);
  const cols = Math.floor(mapW / cell);
  const rows = Math.floor(mapH / cell);

  // Rasterise land at grid resolution, then read back which cells are land.
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const octx = off.getContext("2d", { willReadFrequently: true })!;
  const projection = geoNaturalEarth1().fitSize([cols, rows], LAND);
  octx.fillStyle = "#000";
  octx.beginPath();
  geoPath(projection, octx)(LAND);
  octx.fill();
  const data = octx.getImageData(0, 0, cols, rows).data;

  const projectCells = new Set<number>();
  for (const p of points) {
    const xy = projection([p.lon, p.lat]);
    if (xy) projectCells.add(Math.floor(xy[1]) * cols + Math.floor(xy[0]));
  }

  const ox = (width - cols * cell) / 2;
  const oy = (height - rows * cell) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const reach = Math.hypot(width, height) * 0.55;
  const rand = rng(7);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const project = projectCells.has(i);
      if (data[i * 4 + 3] < 100 && !project) continue;
      const x = ox + c * cell;
      const y = oy + r * cell;
      const vx = x - cx + (rand() - 0.5) * width * 0.5;
      const vy = y - cy + (rand() - 0.5) * height * 0.5;
      const len = Math.hypot(vx, vy) || 1;
      const dist = (0.25 + rand() * 0.9) * reach;
      cells.push({
        x,
        y,
        project,
        alpha: project ? 1 : 0.42 + rand() * 0.4,
        start: 0.04 + rand() * 0.36,
        dx: (vx / len) * dist,
        dy: (vy / len) * dist,
        grow: rand() < 0.25 ? 2 + rand() * 4 : rand() * 1.5,
        appear: rand(),
      });
    }
  }
  return { cells, cell };
}

const ease = (t: number) => 1 - (1 - t) ** 3;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll-driven statement section: a pixel world map in brand green with the
 * tracked projects picked out. As the section scrolls, the copy rises away and
 * the map breaks into squares that drift outward, grow and fade.
 */
export function MapDissolve({ points, children }: { points: { lat: number; lon: number }[]; children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let grid = { cells: [] as Cell[], cell: 10 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let shownAt = 0;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      // 0 → 1 from the section's top reaching the viewport top until its bottom leaves it, so the
      // dissolve keeps running while the pinned stage scrolls away (no empty screen at the end).
      return reduced ? 0 : clamp(-rect.top / Math.max(1, rect.height));
    };

    const draw = () => {
      raf = 0;
      const p = progress();
      const intro = shownAt ? clamp((performance.now() - shownAt) / 1200) : 0;
      ctx.clearRect(0, 0, w, h);
      const size = grid.cell - 2;
      for (const c of grid.cells) {
        const shown = clamp((intro - c.appear * 0.6) / 0.4);
        if (shown <= 0) continue;
        const t = clamp((p - c.start) / 0.5);
        const e = ease(t);
        const fade = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
        const a = c.alpha * shown * fade;
        if (a <= 0.01) continue;
        const s = size * (1 + c.grow * e);
        ctx.fillStyle = `rgba(${c.project && t < 0.3 ? FOREST : MINT}, ${a})`;
        ctx.fillRect(c.x + c.dx * e - (s - size) / 2, c.y + c.dy * e - (s - size) / 2, s, s);
      }
      if (copyRef.current) {
        copyRef.current.style.transform = `translateY(${-p * 110}vh)`;
        copyRef.current.style.opacity = String(1 - clamp((p - 0.22) / 0.26));
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp(p / 0.04));
      if (intro < 1) schedule();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = buildCells(w, h, points);
      schedule();
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !shownAt) {
        shownAt = reduced ? performance.now() - 1200 : performance.now();
        schedule();
      }
    });
    io.observe(section);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", schedule);
    };
  }, [points]);

  return (
    <section ref={sectionRef} className="relative h-[220vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden motion-reduce:relative">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
        <div ref={copyRef} className="relative px-4 text-center will-change-transform">
          {children}
        </div>
        <div ref={hintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-reduce:hidden">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-[15px] text-ink shadow-card">
            Scroll to continue <ChevronDown className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </section>
  );
}
