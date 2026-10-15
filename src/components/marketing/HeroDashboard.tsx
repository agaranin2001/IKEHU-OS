import { Building2, Calculator, Factory, Gauge, Globe2, HardHat, Radar, Zap } from "lucide-react";
import { Estimate, isEstimated } from "@/components/ui/Estimate";
import type { CSSProperties } from "react";
import type { HydrogenProject, LcohResult, PriceSeries } from "@/domain/types";
import { projectStats } from "@/lib/aggregate";
import { fmtDate, fmtMw, fmtNum } from "@/lib/format";
import { PROJECT_STATUS } from "@/lib/labels";
import { LogoMark } from "@/components/ui/Logo";
import { CountUp } from "./CountUp";
import { InView } from "./InView";

/** Stagger delay for CSS entrance animations (see globals.css .anim-scope). */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Product rendering for the hero. Every figure is computed from the datasets
 * passed in, so the "screenshot" stays truthful as data changes. Animates in
 * once when scrolled into view.
 */
export function HeroDashboard({
  projects,
  lcoh,
  prices,
  compiledAt,
}: {
  projects: HydrogenProject[];
  lcoh: LcohResult;
  prices: PriceSeries[];
  compiledAt: string;
}) {
  const s = projectStats(projects);
  const europe = projects.filter((p) => p.region === "Europe");
  const statusRows = (["operational", "under-construction", "planned", "announced", "delayed", "cancelled"] as const).map((k) => ({ k, mw: s.mwByStatus[k], n: s.countByStatus[k] }));
  const maxMw = Math.max(...statusRows.map((r) => r.mw), 1);

  const parts = [
    { k: "Electricity", v: lcoh.breakdown.electricityEurKg, c: "#16825f" },
    { k: "CAPEX", v: lcoh.breakdown.capexEurKg, c: "#7c18d3" },
    { k: "Fixed O&M", v: lcoh.breakdown.fixedOmEurKg, c: "#c47a0f" },
    { k: "Stack", v: lcoh.breakdown.stackReplacementEurKg, c: "#2b7bd6" },
    { k: "Other", v: lcoh.breakdown.variableOmEurKg + lcoh.breakdown.waterEurKg, c: "#0b8fa0" },
  ];

  // Waterfall geometry
  const W = 320;
  const H = 170;
  const scale = (H - 40) / lcoh.lcohEurKg;
  let acc = 0;
  const bw = W / (parts.length + 1) - 10;

  // Price lines
  const lines = prices.slice(0, 2).map((p, i) => ({ zone: p.biddingZone, color: i === 0 ? "#16825f" : "#7c18d3", pts: p.points.slice(-18) }));
  const allV = lines.flatMap((l) => l.pts.map((p) => p.v));
  const vmin = Math.min(0, ...allV);
  const vmax = Math.max(...allV, 1);
  const LW = 320;
  const LH = 140;
  const toPath = (pts: { v: number }[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * LW},${LH - 6 - ((p.v - vmin) / (vmax - vmin)) * (LH - 16)}`).join(" ");

  const nav = [Gauge, Globe2, Zap, Building2, Calculator, Factory, Radar, HardHat];
  const kpis = [
    { l: "Tracked projects", v: fmtNum(s.count), sub: `${s.countries} countries`, I: Globe2 },
    { l: "Pipeline capacity", v: fmtMw(s.totalMw), sub: "electrolyser, excl. cancelled", I: Factory },
    { l: "Operational", v: fmtMw(s.mwByStatus.operational), sub: `${s.countByStatus.operational} projects`, I: Gauge },
    { l: "Base-case LCOH", v: `€${lcoh.lcohEurKg.toFixed(2)}`, sub: "per kg · preliminary", I: Calculator },
  ];

  return (
    <InView threshold={0.2}>
      <div className="max-h-[60dvh] overflow-hidden rounded-t-[16px] border border-b-0 border-white/70 bg-paper shadow-float" aria-label="Platform dashboard preview" role="img">
        <div className="flex">
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 bg-deep py-4 sm:flex md:w-16">
            <LogoMark tone="light" className="size-7" />
            <div className="mt-3 flex flex-col gap-3">
              {nav.map((I, i) => (
                <span
                  key={i}
                  data-anim="fade"
                  style={d(80 + i * 45)}
                  className={`grid size-9 place-items-center rounded-lg ${i === 0 ? "rail-active bg-cream/15 text-mint" : "text-cream/55"}`}
                >
                  <I className="size-4" />
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 bg-paper-2/60 p-4 md:p-7">
            <div data-anim="fade" style={d(0)}>
              <div className="text-xs text-muted md:text-[13px]">
                <span className="text-violet">Dashboard</span> / Global pipeline / <span className="text-ink-2">Overview</span>
              </div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="text-xl font-light text-ink md:text-[26px]">Hydrogen market overview</div>
                <div className="hidden text-xs text-faint sm:block">Dataset {fmtDate(compiledAt)}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-4">
              {kpis.map((k, i) => (
                <div
                  key={k.l}
                  data-anim="fade"
                  style={d(150 + i * 90)}
                  className="rounded-xl border border-line-2 bg-paper p-3 transition-shadow duration-300 hover:shadow-card md:p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-forest md:size-8">
                      <k.I className="size-3.5" />
                    </span>
                    <span className="truncate text-[11px] text-muted md:text-[13px]">{k.l}</span>
                  </div>
                  <div className="mt-2 text-lg font-medium text-ink md:text-[26px] md:leading-tight">
                    <CountUp value={k.v} delay={250 + i * 90} />
                  </div>
                  <div className="truncate text-[10.5px] text-faint md:text-xs">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div data-anim="fade" style={d(500)} className="rounded-xl border border-line-2 bg-paper p-4">
                <div className="text-[13px] font-medium text-ink md:text-sm">Capacity by status</div>
                <div className="text-[11px] text-faint md:text-xs">Disclosed electrolyser MW</div>
                <ul className="mt-3 space-y-2.5">
                  {statusRows.map((r, i) => (
                    <li key={r.k} className="grid grid-cols-[88px_1fr_52px] items-center gap-2 text-[11px] md:grid-cols-[110px_1fr_60px] md:text-[13px]">
                      <span className="truncate text-ink-2">{PROJECT_STATUS[r.k].label}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-paper-2">
                        <span
                          data-anim="grow-x"
                          style={{ ...d(700 + i * 110), width: `${Math.max((r.mw / maxMw) * 100, r.mw > 0 ? 3 : 0)}%`, background: PROJECT_STATUS[r.k].color }}
                          className="block h-full rounded-full"
                        />
                      </span>
                      <span className="num text-right text-ink-2">{r.mw === 0 ? "—" : fmtMw(r.mw)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div data-anim="fade" style={d(600)} className="rounded-xl border border-line-2 bg-paper p-4">
                <div className="text-[13px] font-medium text-ink md:text-sm">Levelised cost of hydrogen</div>
                <div className="text-[11px] text-faint md:text-xs">Base case · €/kg H₂</div>
                <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full overflow-visible">
                  {parts.map((p, i) => {
                    const y = H - 18 - (acc + p.v) * scale;
                    const h = Math.max(p.v * scale, 1.5);
                    acc += p.v;
                    return (
                      <g key={p.k}>
                        <rect data-anim="grow-y" style={d(850 + i * 140)} x={i * (bw + 10) + 4} y={y} width={bw} height={h} rx={3} fill={p.c} />
                        <text x={i * (bw + 10) + 4 + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#5f6b69">
                          {p.k}
                        </text>
                      </g>
                    );
                  })}
                  <rect
                    data-anim="grow-y"
                    style={d(850 + parts.length * 140)}
                    x={parts.length * (bw + 10) + 4}
                    y={H - 18 - lcoh.lcohEurKg * scale}
                    width={bw}
                    height={lcoh.lcohEurKg * scale}
                    rx={3}
                    fill="#104336"
                  />
                  <text x={parts.length * (bw + 10) + 4 + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#5f6b69">
                    LCOH
                  </text>
                  <text
                    data-anim="fade"
                    style={d(1700)}
                    x={parts.length * (bw + 10) + 4 + bw / 2}
                    y={H - 24 - lcoh.lcohEurKg * scale}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#101f1e"
                    fontWeight="600"
                  >
                    {lcoh.lcohEurKg.toFixed(2)}
                  </text>
                </svg>
              </div>

              <div data-anim="fade" style={d(700)} className="rounded-xl border border-line-2 bg-paper p-4">
                <div className="text-[13px] font-medium text-ink md:text-sm">Day-ahead power price</div>
                <div className="text-[11px] text-faint md:text-xs">Monthly average, €/MWh · historical</div>
                <svg viewBox={`0 0 ${LW} ${LH}`} className="mt-3 h-auto w-full overflow-visible">
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1="0" x2={LW} y1={LH * f} y2={LH * f} stroke="#ebe8e1" />
                  ))}
                  {lines.map((l, i) => (
                    <path
                      key={l.zone}
                      data-anim="draw"
                      style={d(1000 + i * 250)}
                      pathLength={1}
                      d={toPath(l.pts)}
                      fill="none"
                      stroke={l.color}
                      strokeWidth="2.25"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <div className="mt-2 flex gap-4 text-[11px] text-ink-2 md:text-[13px]">
                  {lines.map((l) => (
                    <span key={l.zone} className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3.5 rounded" style={{ background: l.color }} /> {l.zone} {fmtNum(l.pts.at(-1)?.v, 0)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div data-anim="fade" style={d(900)} className="mt-3 hidden overflow-hidden rounded-xl border border-line-2 bg-paper md:block">
              <div className="grid grid-cols-[1.6fr_1fr_0.7fr_0.9fr] gap-2 border-b border-line-2 px-4 py-2 text-[11px] tracking-wide text-faint uppercase">
                <span>Project</span>
                <span>Developer</span>
                <span className="text-right">Capacity</span>
                <span className="text-right">Status</span>
              </div>
              {[...europe]
                .sort((a, b) => (b.capacityMw ?? 0) - (a.capacityMw ?? 0))
                .slice(0, 3)
                .map((p, i) => (
                  <div
                    key={p.id}
                    data-anim="fade"
                    style={d(1300 + i * 120)}
                    className="grid grid-cols-[1.6fr_1fr_0.7fr_0.9fr] items-center gap-2 border-b border-line-2 px-4 py-2.5 text-[13px] transition-colors last:border-0 hover:bg-paper-2"
                  >
                    <span className="truncate text-ink">{p.name}</span>
                    <span className="truncate text-muted">{p.developer}</span>
                    <span className="num text-right text-ink-2">
                      <Estimate on={isEstimated(p, "capacityMw")}>{fmtMw(p.capacityMw)}</Estimate>
                    </span>
                    <span className="text-right">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px]"
                        style={{ color: PROJECT_STATUS[p.status].color, background: `${PROJECT_STATUS[p.status].color}14` }}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {PROJECT_STATUS[p.status].label}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </InView>
  );
}
