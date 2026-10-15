/** Small schematic diagrams for "How the model works". Illustrative shapes only — not data. */
import type { ReactNode } from "react";

const W = 240;
const H = 96;
const BASE = 84;
/** A stylised day of hourly prices, €/MWh. */
const DAY = [62, 58, 50, 44, 40, 42, 55, 78, 96, 88, 70, 52, 38, 30, 26, 34, 58, 92, 118, 104, 86, 74, 68, 64];
const X0 = 8;
const STEP = (W - 16) / DAY.length;
const y = (v: number) => BASE - (v / 130) * 72;
const x = (i: number) => X0 + i * STEP;

/** Step path of the day's prices. */
const pricePath = DAY.map((v, i) => (i === 0 ? `M${x(0)} ${y(v)} H${x(1)}` : `V${y(v)} H${x(i + 1)}`)).join(" ");

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" role="img" aria-label={label}>
      <line x1={X0} x2={W - 8} y1={BASE} y2={BASE} className="stroke-line" strokeWidth={1} />
      {children}
    </svg>
  );
}

function Threshold({ v, label, className }: { v: number; label: string; className: string }) {
  return (
    <g className={className}>
      <line x1={X0} x2={W - 8} y1={y(v)} y2={y(v)} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" />
      <text x={W - 10} y={y(v) - 3} textAnchor="end" fontSize={8} fill="currentColor" fontWeight={600}>
        {label}
      </text>
    </g>
  );
}

const Price = () => <path d={pricePath} fill="none" className="stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />;

export function ElectrolyserIllustration() {
  const ceiling = 60;
  return (
    <Frame label="Electrolyser runs in the hours where the price is below the ceiling">
      {DAY.map((v, i) => (v <= ceiling ? <rect key={i} x={x(i) + 0.5} y={10} width={STEP - 1} height={BASE - 10} className="fill-forest/12" /> : null))}
      {DAY.map((v, i) => (v <= ceiling ? <rect key={`b${i}`} x={x(i) + 1.5} y={BASE - 8} width={STEP - 3} height={8} rx={1} className="fill-forest" /> : null))}
      <Threshold v={ceiling} label="Ceiling" className="text-violet" />
      <Price />
    </Frame>
  );
}

export function BatteryIllustration() {
  const buy = 45;
  const sell = 90;
  return (
    <Frame label="Battery charges below the buy threshold and discharges above the sell threshold">
      {DAY.map((v, i) =>
        v <= buy ? (
          <rect key={i} x={x(i) + 1.5} y={BASE - 10} width={STEP - 3} height={10} rx={1} className="fill-forest" />
        ) : v >= sell ? (
          <rect key={i} x={x(i) + 1.5} y={BASE - 10} width={STEP - 3} height={10} rx={1} className="fill-violet" />
        ) : null,
      )}
      <Threshold v={sell} label="Sell" className="text-violet" />
      <Threshold v={buy} label="Buy" className="text-forest" />
      <Price />
    </Frame>
  );
}

export function GenerationIllustration() {
  // Solar arc from hour 5 to 19, wind flat; a negative-price window at hours 12–14 is curtailed.
  const solar = DAY.map((_, i) => {
    const h = i + 0.5;
    return h > 5 && h < 19 ? Math.sin((Math.PI * (h - 5)) / 14) : 0;
  });
  const sy = (f: number) => BASE - f * 62;
  const area = `M${x(0)} ${BASE} ` + solar.map((f, i) => `L${x(i) + STEP / 2} ${sy(f)}`).join(" ") + ` L${x(DAY.length)} ${BASE} Z`;
  return (
    <Frame label="Solar follows a daylight curve, wind is flat, and output is curtailed when prices turn negative">
      <rect x={x(12)} y={10} width={STEP * 3} height={BASE - 10} className="fill-bad/10" />
      <text x={x(13.5)} y={20} textAnchor="middle" fontSize={8} fontWeight={600} className="fill-bad">
        Price &lt; 0
      </text>
      <path d={area} className="fill-ok/20 stroke-ok" strokeWidth={1.5} strokeLinejoin="round" />
      <line x1={X0} x2={W - 8} y1={BASE - 26} y2={BASE - 26} className="stroke-info" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={X0 + 2} y={BASE - 30} fontSize={8} fontWeight={600} className="fill-info">
        Wind
      </text>
      <text x={x(6)} y={sy(0.9) - 4} fontSize={8} fontWeight={600} className="fill-ok">
        Solar
      </text>
    </Frame>
  );
}

export function ScopeIllustration() {
  // Revenue − electricity − grid = operating margin, as a small waterfall.
  const bars = [
    { label: "Revenue", from: 0, to: 64, cls: "fill-ok" },
    { label: "Power", from: 64, to: 30, cls: "fill-bad/70" },
    { label: "Grid", from: 30, to: 22, cls: "fill-bad/70" },
    { label: "Margin", from: 0, to: 22, cls: "fill-forest" },
  ];
  const bw = 36;
  const gap = (W - 16 - bars.length * bw) / (bars.length - 1);
  const by = (v: number) => BASE - 6 - v;
  return (
    <Frame label="Operating margin is revenue less electricity and grid costs">
      {bars.map((b, i) => {
        const bx = X0 + i * (bw + gap);
        const top = by(Math.max(b.from, b.to));
        const h = Math.abs(b.to - b.from);
        return (
          <g key={b.label}>
            <rect x={bx} y={top} width={bw} height={h} rx={2} className={b.cls} />
            {i < bars.length - 1 && <line x1={bx + bw} x2={bx + bw + gap} y1={by(b.to)} y2={by(b.to)} className="stroke-line" strokeDasharray="2 2" />}
            <text x={bx + bw / 2} y={BASE + 9} textAnchor="middle" fontSize={8} className="fill-muted">
              {b.label}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}
