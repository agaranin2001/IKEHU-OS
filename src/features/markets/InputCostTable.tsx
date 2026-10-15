import { ArrowUpRight } from "lucide-react";
import type { BiddingZone } from "@/domain/types";
import { ButtonLink } from "@/components/ui/Button";
import { fmtNum } from "@/lib/format";
import { electricityCostPerKg } from "@/lib/economics/lcoh";
import { fmtSec, slotColor, type PeriodStats, type ZoneSlot } from "./marketMath";

/** Per-zone electricity input cost for hydrogen production with a hand-off to the LCOH calculator. */
export function InputCostTable({
  selection,
  zoneByCode,
  statsByCode,
  gridFee,
  sec,
  periodLabel,
}: {
  selection: ZoneSlot[];
  zoneByCode: Map<string, BiddingZone>;
  statsByCode: Map<string, PeriodStats | null>;
  gridFee: number | null;
  sec: number | null;
  periodLabel: string;
}) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[760px] text-[13px]">
        <thead className="sticky top-0 bg-paper-2">
          <tr className="border-y border-line-2 text-left text-[11px] text-muted">
            <th scope="col" className="px-5 py-2.5 font-medium">Bidding zone</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">
              Day-ahead average
              <span className="block font-normal text-faint">€/MWh · {periodLabel}</span>
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">
              + Grid fee input
              <span className="block font-normal text-faint">€/MWh · your assumption</span>
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">
              Electricity input
              <span className="block font-normal text-faint">€/MWh</span>
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">
              Electricity cost
              <span className="block font-normal text-faint">€/kg H₂{sec != null ? ` at ${fmtSec(sec)} kWh/kg` : ""}</span>
            </th>
            <th scope="col" className="px-5 py-2.5 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {selection.map(({ code, slot }) => {
            const st = statsByCode.get(code) ?? null;
            const total = st && gridFee != null ? st.avg + gridFee : null;
            const perKg = total != null && sec != null ? electricityCostPerKg(total, sec) : null;
            const zone = zoneByCode.get(code);
            return (
              <tr key={code} className="border-b border-line-2 last:border-0 hover:bg-paper-2">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: slotColor(slot) }} />
                    <span className="num font-semibold text-ink">{code}</span>
                    <span className="truncate text-muted">{zone?.name}</span>
                  </div>
                </td>
                <td className="num px-3 py-3 text-right text-ink">{fmtNum(st?.avg, 2)}</td>
                <td className="num px-3 py-3 text-right text-ink-2">{gridFee != null ? fmtNum(gridFee, 2) : "—"}</td>
                <td className="num px-3 py-3 text-right text-ink">{fmtNum(total, 2)}</td>
                <td className="num px-3 py-3 text-right text-base font-medium text-forest">{fmtNum(perKg, 2)}</td>
                <td className="px-5 py-3 text-right">
                  {st ? (
                    <ButtonLink
                      href={`/app/calculator?price=${Math.round(st.avg)}&zone=${encodeURIComponent(code)}`}
                      variant="secondary"
                      size="sm"
                      aria-label={`Use ${code} average of ${Math.round(st.avg)} €/MWh in the LCOH calculator`}
                    >
                      Use in LCOH calculator <ArrowUpRight className="size-4" aria-hidden />
                    </ButtonLink>
                  ) : (
                    <span className="text-xs text-faint">No data in period</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
