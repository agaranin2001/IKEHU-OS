import type { BiddingZone } from "@/domain/types";
import { cn } from "@/components/ui/cn";
import { fmtNum } from "@/lib/format";
import { electricityCostPerKg } from "@/lib/economics/lcoh";
import { slotColor, type PeriodStats, type ZoneSlot } from "./marketMath";

const NEUTRAL = "#c5d2ce";

/** All bidding zones ranked by period average (lowest first); selected zones carry their series colour. */
export function ZoneRanking({
  zones,
  statsByCode,
  selection,
  sec,
}: {
  zones: BiddingZone[];
  statsByCode: Map<string, PeriodStats | null>;
  selection: ZoneSlot[];
  sec: number | null;
}) {
  const slotOf = new Map(selection.map((s) => [s.code, s.slot]));
  const ranked = zones
    .map((z) => ({ zone: z, st: statsByCode.get(z.code) ?? null }))
    .filter((r): r is { zone: BiddingZone; st: PeriodStats } => r.st != null)
    .sort((a, b) => a.st.avg - b.st.avg);
  const missing = zones.filter((z) => !statsByCode.get(z.code));

  const top = Math.max(...ranked.map((r) => Math.abs(r.st.avg)), 1);

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-paper-2 text-left text-[11px] font-medium text-muted">
          <tr className="border-b border-line-2">
            <th scope="col" className="w-12 py-2.5 pr-2 pl-5 text-right font-medium">
              #
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              Zone
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              Country
            </th>
            <th scope="col" className="w-[38%] px-3 py-2.5 font-medium">
              Average day-ahead price, relative to the highest zone
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">
              €/MWh
            </th>
            <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-medium">
              €/kg H₂
            </th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ zone, st }, i) => {
            const slot = slotOf.get(zone.code);
            const selected = slot != null;
            return (
              <tr key={zone.code} className="border-b border-line-2 last:border-b-0">
                <td className="num py-2 pr-2 pl-5 text-right text-[11px] text-faint">{i + 1}</td>
                <td className={cn("num px-3 py-2", selected ? "font-semibold text-ink" : "text-ink-2")} title={zone.name}>
                  {zone.code}
                  {selected && <span className="sr-only"> (selected)</span>}
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2 text-ink-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/flags/${zone.country.toLowerCase()}.svg`} alt="" width={18} height={18} className="size-[18px] shrink-0 rounded-full" />
                    <span className="truncate">{zone.countryName}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="relative block h-2.5 rounded-full bg-paper-2" aria-hidden>
                    <span
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                      style={{ width: `${Math.max((Math.abs(st.avg) / top) * 100, 1.5)}%`, background: selected ? slotColor(slot) : NEUTRAL }}
                    />
                  </span>
                </td>
                <td className="num px-3 py-2 text-right text-ink">{fmtNum(st.avg, 2)}</td>
                <td className={cn("num py-2 pr-5 pl-3 text-right", selected ? "text-ink" : "text-muted")}>{sec != null ? fmtNum(electricityCostPerKg(st.avg, sec), 2) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {missing.length > 0 && <p className="border-t border-line-2 px-5 py-3 text-[11px] text-faint">No data in this period for: {missing.map((z) => z.code).join(", ")}.</p>}
    </div>
  );
}
