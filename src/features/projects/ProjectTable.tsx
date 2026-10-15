"use client";

import { Estimate, isEstimated } from "@/components/ui/Estimate";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { ProjectStatusPill, VerificationPill } from "@/components/ui/StatusPill";
import { cn } from "@/components/ui/cn";
import type { HydrogenProject } from "@/domain/types";
import { fmtNum } from "@/lib/format";
import { PATHWAY } from "@/lib/labels";
import type { SortKey, SortState } from "./model";

interface Column {
  key: string;
  label: string;
  sort?: SortKey;
  align?: "right";
  className?: string;
  render: (p: HydrogenProject) => React.ReactNode;
}

const Capacity = ({ p }: { p: HydrogenProject }) =>
  p.capacityMw == null ? (
    <span className="text-faint">Undisclosed</span>
  ) : (
    <Estimate on={isEstimated(p, "capacityMw")}>
      <span className="num text-ink">{fmtNum(p.capacityMw, p.capacityMw < 10 ? 1 : 0)}</span>
    </Estimate>
  );

const FULL: Column[] = [
  {
    key: "name",
    label: "Project",
    sort: "name",
    className: "min-w-[240px] max-w-[320px]",
    render: (p) => (
      <>
        <span className="block font-medium leading-snug text-ink">{p.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">{p.location.label}</span>
      </>
    ),
  },
  { key: "country", label: "Country", sort: "country", className: "whitespace-nowrap", render: (p) => p.countryName },
  { key: "developer", label: "Developer", sort: "developer", className: "min-w-[160px] max-w-[220px]", render: (p) => <span className="line-clamp-2">{p.developer}</span> },
  {
    key: "technology",
    label: "Technology",
    sort: "technology",
    className: "whitespace-nowrap",
    render: (p) => (
      <Estimate on={isEstimated(p, "technology")}>
        <span className={p.technology === "Undisclosed" ? "text-faint" : ""}>{p.technology}</span>
      </Estimate>
    ),
  },
  { key: "pathway", label: "Pathway", sort: "pathway", className: "whitespace-nowrap", render: (p) => PATHWAY[p.pathway] },
  { key: "capacity", label: "Capacity (MW)", sort: "capacity", align: "right", className: "whitespace-nowrap", render: (p) => <Capacity p={p} /> },
  { key: "status", label: "Status", sort: "status", render: (p) => <ProjectStatusPill status={p.status} /> },
  {
    key: "commissioning",
    label: "Expected online",
    sort: "commissioning",
    className: "whitespace-nowrap",
    render: (p) =>
      p.expectedCommissioning ? (
        <Estimate on={isEstimated(p, "expectedCommissioning")}>
          <span className="num">{p.expectedCommissioning}</span>
        </Estimate>
      ) : (
        <span className="text-faint">Not confirmed</span>
      ),
  },
  { key: "verification", label: "Verification", render: (p) => <VerificationPill status={p.verification} /> },
];

const COMPACT: Column[] = [
  {
    key: "name",
    label: "Project",
    sort: "name",
    className: "min-w-[200px]",
    render: (p) => (
      <>
        <span className="block font-medium leading-snug text-ink">{p.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">
          {p.countryName} · {p.developer}
        </span>
      </>
    ),
  },
  { key: "capacity", label: "MW", sort: "capacity", align: "right", className: "whitespace-nowrap", render: (p) => <Capacity p={p} /> },
  { key: "status", label: "Status", sort: "status", render: (p) => <ProjectStatusPill status={p.status} /> },
];

export function ProjectTable({
  projects,
  sort,
  onSort,
  onOpen,
  onHover,
  selectedId,
  compact,
  className,
}: {
  projects: HydrogenProject[];
  sort: SortState;
  onSort: (s: SortState) => void;
  onOpen: (id: string) => void;
  onHover?: (id: string | null) => void;
  selectedId?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const cols = compact ? COMPACT : FULL;
  const toggle = (key: SortKey) =>
    onSort(sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "capacity" || key === "announced" ? "desc" : "asc" });

  return (
    <div className={cn("scrollbar-thin overflow-auto", className)}>
      <table className={cn("w-full border-separate border-spacing-0 text-[13px] text-ink-2", !compact && "min-w-[1080px]")}>
        <caption className="sr-only">Hydrogen projects matching the current filters. Select a row to open the record.</caption>
        <thead>
          <tr>
            {cols.map((c) => {
              const active = c.sort && sort.key === c.sort;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "sticky top-0 z-[1] border-b border-line-2 bg-paper-2 px-3 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase first:pl-5 last:pr-5",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.sort!)}
                      className={cn("inline-flex items-center gap-1 uppercase hover:text-ink", active && "text-ink", c.align === "right" && "flex-row-reverse")}
                    >
                      {c.label}
                      {active ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" aria-hidden />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const selected = p.id === selectedId;
            return (
              <tr
                key={p.id}
                onClick={() => onOpen(p.id)}
                onMouseEnter={() => onHover?.(p.id)}
                onMouseLeave={() => onHover?.(null)}
                aria-selected={selected}
                className={cn("group cursor-pointer transition-colors hover:bg-paper-2", selected && "bg-paper-2")}
              >
                {cols.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn(
                      "border-b border-line-2 px-3 py-3 align-middle first:pl-5 last:pr-5",
                      c.align === "right" && "text-right",
                      c.className,
                      i === 0 && selected && "shadow-[inset_3px_0_0_var(--color-forest)]",
                    )}
                  >
                    {i === 0 ? (
                      <button
                        type="button"
                        onFocus={() => onHover?.(p.id)}
                        onBlur={() => onHover?.(null)}
                        className="block w-full text-left outline-offset-4 group-hover:[&>span:first-child]:text-forest"
                        aria-label={`Open ${p.name}`}
                      >
                        {c.render(p)}
                      </button>
                    ) : (
                      c.render(p)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
