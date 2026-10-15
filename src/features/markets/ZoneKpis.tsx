import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { BiddingZone } from "@/domain/types";
import { cn } from "@/components/ui/cn";
import { Sparkline } from "@/components/charts/Bars";
import { fmtNum } from "@/lib/format";
import { electricityCostPerKg } from "@/lib/economics/lcoh";
import { fmtMonth, fmtSec, slotColor, type PeriodStats, type ZoneSlot } from "./marketMath";

/** One KPI card per selected zone: period average, min/max month, trend and electricity cost per kg H₂. */
export function ZoneKpis({
  selection,
  zoneByCode,
  statsByCode,
  periodLabel,
  sec,
  active = [],
  onToggle,
}: {
  selection: ZoneSlot[];
  zoneByCode: Map<string, BiddingZone>;
  statsByCode: Map<string, PeriodStats | null>;
  periodLabel: string;
  sec: number | null;
  /** Codes of the zones currently focused; others render dimmed. */
  active?: string[];
  onToggle?: (code: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {selection.map(({ code, slot }) => {
        const zone = zoneByCode.get(code);
        const st = statsByCode.get(code) ?? null;
        const color = slotColor(slot);
        return (
          <li key={code}>
            <button
              type="button"
              onClick={() => onToggle?.(code)}
              aria-pressed={active.includes(code)}
              className={cn(
                "flex h-full w-full flex-col rounded-card border bg-paper p-5 text-left shadow-card transition-[opacity,border-color,box-shadow] duration-200",
                active.includes(code) ? "ring-2 ring-offset-0" : "border-line-2 hover:border-sage",
                active.length > 0 && !active.includes(code) && "opacity-55 hover:opacity-90",
              )}
              style={active.includes(code) ? ({ borderColor: color, "--tw-ring-color": `${color}33` } as CSSProperties) : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="num text-sm font-semibold text-ink">{code}</span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">{zone?.name ?? code}</div>
                </div>
                {st && <Sparkline values={st.values} color={color} width={96} height={32} />}
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium text-muted">Average day-ahead price · {periodLabel}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="num text-[28px] leading-none font-light tracking-tight text-ink">{fmtNum(st?.avg, 2)}</span>
                  <span className="text-sm text-muted">€/MWh</span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-btn bg-paper-2 px-3 py-2">
                  <dt className="flex items-center gap-1 text-muted">
                    <ArrowDownRight className="size-3.5 text-ok" aria-hidden /> Lowest month
                  </dt>
                  <dd className="mt-0.5">
                    <span className="num text-sm text-ink">{fmtNum(st?.min.v, 2)}</span>
                    <span className="block text-[11px] text-faint">{st ? fmtMonth(st.min.t) : "—"}</span>
                  </dd>
                </div>
                <div className="rounded-btn bg-paper-2 px-3 py-2">
                  <dt className="flex items-center gap-1 text-muted">
                    <ArrowUpRight className="size-3.5 text-bad" aria-hidden /> Highest month
                  </dt>
                  <dd className="mt-0.5">
                    <span className="num text-sm text-ink">{fmtNum(st?.max.v, 2)}</span>
                    <span className="block text-[11px] text-faint">{st ? fmtMonth(st.max.t) : "—"}</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-end justify-between gap-3 border-t border-line-2 pt-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ink-2">Electricity cost per kg H₂</div>
                  <div className="text-[11px] text-faint">electricity input only · {sec != null ? `at ${fmtSec(sec)} kWh/kg` : "set a valid SEC"}</div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="num text-lg text-ink">{st && sec != null ? fmtNum(electricityCostPerKg(st.avg, sec), 2) : "—"}</span>
                  <span className="ml-1 text-xs text-muted">€/kg</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
