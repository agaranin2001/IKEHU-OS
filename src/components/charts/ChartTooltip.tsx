import type { ReactNode } from "react";

export interface TooltipRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  color?: string;
}

/** Shared tooltip card for all charts. Text stays in ink tokens; colour lives on the swatch. */
export function TooltipCard({ title, rows }: { title?: ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="pointer-events-none min-w-36 rounded-btn border border-line-2 bg-paper px-3 py-2 text-xs shadow-float">
      {title && <div className="mb-1 font-semibold text-ink">{title}</div>}
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2">
            {r.color && <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />}
            <span className="flex-1 text-muted">{r.label}</span>
            <span className="num font-medium text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Legend({ items, className }: { items: { key: string; label: ReactNode; color: string; dashed?: boolean }[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2 ${className ?? ""}`}>
      {items.map((i) => (
        <li key={i.key} className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded" style={{ background: i.dashed ? `repeating-linear-gradient(90deg, ${i.color} 0 3px, transparent 3px 5px)` : i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
