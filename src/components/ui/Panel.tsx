import type { ReactNode } from "react";
import { cn } from "./cn";

export function Panel({
  title,
  subtitle,
  actions,
  footer,
  children,
  className,
  bodyClassName,
  headerClassName,
  id,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Extra classes for the title row, e.g. to align it with the page title. */
  headerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-card border border-line-2 bg-paper shadow-card", className)}>
      {(title || actions) && (
        <header className={cn("flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-line-2 px-5 py-3", headerClassName)}>
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName ?? "p-5"}>{children}</div>
      {footer && <footer className="border-t border-line-2 px-5 py-3 text-xs text-muted">{footer}</footer>}
    </section>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="num text-2xl font-normal tracking-tight text-ink">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-faint">{hint}</div>}
    </div>
  );
}
