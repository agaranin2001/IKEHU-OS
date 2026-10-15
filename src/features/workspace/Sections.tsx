"use client";

import { ArrowUpRight, ChevronRight, Upload } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Panel, Stat } from "@/components/ui/Panel";
import type { WorkspaceRisk } from "@/domain/types";
import { fmtDate, fmtEurCompact, fmtNum } from "@/lib/format";
import type { Tone } from "@/lib/labels";
import { budgetTotals, dayDiff, relativeDays, riskLevel, riskScore, RISK_LEVEL, sortRisks, type RiskLevel, type WorkspaceSnapshot } from "./model";

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

const committedLabel = (committed: number, budget: number) =>
  committed > 0 ? `${fmtEurCompact(committed)} · ${fmtNum(budget > 0 ? (committed / budget) * 100 : 0, 0)} %` : "Nothing committed";

export function Budget({ budget }: { budget: WorkspaceSnapshot["budget"] }) {
  const totals = budgetTotals(budget);
  const rows = [...budget].sort((a, b) => b.budgetEur - a.budgetEur);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const allOpen = open.size === rows.length;
  const toggle = (line: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total budget", value: fmtEurCompact(totals.budgetEur) },
          { label: "Committed", value: fmtEurCompact(totals.committedEur), hint: `${fmtNum(totals.committedPct, 1)} % of budget` },
          { label: "Uncommitted", value: fmtEurCompact(totals.budgetEur - totals.committedEur) },
          { label: "Cost lines", value: budget.length },
        ].map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} hint={k.hint} className="rounded-card border border-line-2 bg-paper p-5 shadow-card" />
        ))}
      </div>
      <Panel
        title="Budget vs committed by cost line"
        actions={
          <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(rows.map((r) => r.line)))} className="text-xs font-medium text-forest hover:underline">
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        }
        bodyClassName="p-0"
      >
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-paper-2 text-xs text-muted">
              <tr className="border-b border-line-2">
                <th scope="col" className="px-5 py-2.5 font-medium">Cost line</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Suppliers</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Deadline</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Budget</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">Committed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const expanded = open.has(b.line);
                const days = dayDiff(b.deadline.date);
                const pending = b.committedEur < b.budgetEur;
                const id = `budget-${b.line.replace(/\W+/g, "-").toLowerCase()}`;
                return (
                  <Fragment key={b.line}>
                    <tr className={cn("border-b border-line-2 align-top", expanded && "bg-paper-2/60")}>
                      <th scope="row" className="px-5 py-3 font-normal">
                        <button type="button" onClick={() => toggle(b.line)} aria-expanded={expanded} aria-controls={id} className="group inline-flex items-start gap-2 text-left text-ink hover:text-forest">
                          <ChevronRight className={cn("mt-0.5 size-4 shrink-0 text-faint transition-transform group-hover:text-forest", expanded && "rotate-90")} aria-hidden />
                          <span>
                            {b.line}
                            <span className="block text-[11px] text-faint">
                              {b.items.length} item{b.items.length === 1 ? "" : "s"}
                            </span>
                          </span>
                        </button>
                      </th>
                      <td className="px-3 py-3 text-ink-2">
                        {b.suppliers.length ? (
                          <ul className="space-y-0.5">
                            {b.suppliers.map((sup) => (
                              <li key={sup.name}>
                                {sup.supplierId ? (
                                  <a
                                    href={`/app/suppliers?supplier=${encodeURIComponent(sup.supplierId)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-1 text-ink underline decoration-line underline-offset-2 hover:text-forest hover:decoration-forest"
                                    aria-label={`${sup.name} — open supplier profile in a new tab`}
                                  >
                                    {sup.name}
                                    <ArrowUpRight className="size-3 text-faint group-hover:text-forest" aria-hidden />
                                  </a>
                                ) : (
                                  sup.name
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-faint">Not yet sourced</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="num text-ink">{fmtDate(b.deadline.date)}</div>
                        <div className="text-[11px] text-muted">{b.deadline.label}</div>
                        <div className={cn("text-[11px]", pending && days < 0 ? "text-bad" : pending && days <= 60 ? "text-warn" : "text-faint")}>{relativeDays(b.deadline.date)}</div>
                      </td>
                      <td className="num px-3 py-3 text-right text-ink">{fmtEurCompact(b.budgetEur)}</td>
                      <td className={cn("num px-5 py-3 text-right whitespace-nowrap", b.committedEur > 0 ? "text-ink" : "text-faint")}>{committedLabel(b.committedEur, b.budgetEur)}</td>
                    </tr>
                    {expanded &&
                      b.items.map((it, i) => (
                        <tr key={it.item} id={i === 0 ? id : undefined} className="border-b border-line-2 bg-paper-2/60 text-[13px]">
                          <td className="py-2 pr-3 pl-11 text-ink-2" colSpan={3}>
                            {it.item}
                          </td>
                          <td className="num px-3 py-2 text-right text-ink-2">{fmtEurCompact(it.budgetEur)}</td>
                          <td className={cn("num px-5 py-2 text-right whitespace-nowrap", it.committedEur > 0 ? "text-ink-2" : "text-faint")}>{it.committedEur > 0 ? committedLabel(it.committedEur, it.budgetEur) : "—"}</td>
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="px-5 py-4 text-left font-medium text-ink">
                  Total
                </th>
                <td className="num px-3 py-4 text-right font-medium text-ink">{fmtEurCompact(totals.budgetEur)}</td>
                <td className="num px-5 py-4 text-right whitespace-nowrap text-ink-2">{committedLabel(totals.committedEur, totals.budgetEur)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Risks                                                               */
/* ------------------------------------------------------------------ */

const LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export function Risks({ risks }: { risks: WorkspaceRisk[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  // Bumped on every selection so the register rows re-run their flash animation.
  const [flash, setFlash] = useState(0);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const sorted = sortRisks(risks);
  const isSel = (id: string) => selected.includes(id);

  /** Select risks (from a matrix cell or chip), then scroll the register to them. Same selection again clears it. */
  const select = (ids: string[]) => {
    const same = ids.length === selected.length && ids.every((id) => selected.includes(id));
    setSelected(same ? [] : ids);
    if (same) return;
    setFlash((n) => n + 1);
    const first = sorted.find((r) => ids.includes(r.id));
    if (first) requestAnimationFrame(() => rowRefs.current.get(first.id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Risk matrix"
        actions={
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-2">
            {LEVELS.map((l) => (
              <li key={l} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-sm ring-1 ring-ink/10", RISK_LEVEL[l].cell)} /> {RISK_LEVEL[l].label} <span className="num text-faint">{RISK_LEVEL[l].range}</span>
              </li>
            ))}
          </ul>
        }
      >
        <div className="flex gap-2">
          <div className="flex w-5 items-center justify-center">
            <span className="-rotate-90 text-[11px] font-medium whitespace-nowrap text-muted">Impact →</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[24px_repeat(5,minmax(0,1fr))] gap-1" role="grid" aria-label="Risk matrix, impact rows by likelihood columns">
              {[5, 4, 3, 2, 1].map((impact) => (
                <div key={impact} role="row" className="contents">
                  <div role="rowheader" className="num flex items-center justify-center text-xs text-muted">
                    {impact}
                  </div>
                  {[1, 2, 3, 4, 5].map((likelihood) => {
                    const score = likelihood * impact;
                    const here = sorted.filter((r) => r.likelihood === likelihood && r.impact === impact);
                    return (
                      <div
                        key={likelihood}
                        role="gridcell"
                        aria-label={`Likelihood ${likelihood}, impact ${impact}, score ${score}: ${here.length ? here.map((r) => r.id.toUpperCase()).join(", ") : "no risks"}`}
                        onClick={here.length ? () => select(here.map((r) => r.id)) : undefined}
                        className={cn(
                          "relative flex min-h-14 flex-wrap content-center items-center justify-center gap-1 rounded-md p-1 transition-shadow sm:min-h-16",
                          RISK_LEVEL[riskLevel(score)].cell,
                          here.length > 0 && "cursor-pointer hover:ring-2 hover:ring-ink/15",
                          here.length > 0 && here.every((r) => isSel(r.id)) && "ring-2 ring-ink/50 hover:ring-ink/50",
                        )}
                      >
                        <span aria-hidden className="num absolute top-1 right-1.5 text-[10px] text-ink/30">
                          {score}
                        </span>
                        {here.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              select([r.id]);
                            }}
                            aria-pressed={isSel(r.id)}
                            title={r.title}
                            className={cn(
                              "num rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
                              isSel(r.id) ? "border-ink bg-ink text-white" : "border-ink/15 bg-paper text-ink hover:border-ink/40",
                            )}
                          >
                            {r.id.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div />
              {[1, 2, 3, 4, 5].map((l) => (
                <div key={l} className="num pt-1 text-center text-xs text-muted">
                  {l}
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-[11px] font-medium text-muted">Likelihood →</div>
          </div>
        </div>
      </Panel>

      <Panel title="Risk register" subtitle="Sorted by score (likelihood × impact), highest first" bodyClassName="p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-paper-2 text-xs text-muted">
              <tr className="border-y border-line-2">
                <th scope="col" className="px-5 py-2.5 font-medium">ID</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Risk</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Category</th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">L</th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium">I</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Score</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Mitigation</th>
                <th scope="col" className="px-5 py-2.5 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const score = riskScore(r);
                const lvl = RISK_LEVEL[riskLevel(score)];
                return (
                  <tr
                    key={isSel(r.id) ? `${r.id}-${flash}` : r.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(r.id, el);
                      else rowRefs.current.delete(r.id);
                    }}
                    className={cn("scroll-my-24 border-b border-line-2 align-top last:border-0", isSel(r.id) ? "risk-row-flash bg-violet-soft/60" : "hover:bg-paper-2")}
                  >
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => select([r.id])} className="num font-semibold text-ink hover:text-forest" aria-pressed={isSel(r.id)}>
                        {r.id.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-ink">{r.title}</td>
                    <td className="px-4 py-3 text-ink-2">{r.category}</td>
                    <td className="num px-4 py-3 text-center text-ink-2">{r.likelihood}</td>
                    <td className="num px-4 py-3 text-center text-ink-2">{r.impact}</td>
                    <td className="px-4 py-3">
                      <Badge tone={lvl.tone}>
                        <span className="num">{score}</span> · {lvl.label}
                      </Badge>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 leading-relaxed text-ink-2">{r.mitigation}</td>
                    <td className="px-5 py-3 text-ink-2">{r.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documents & packages                                                */
/* ------------------------------------------------------------------ */

const DOC_TONE: Record<string, Tone> = { Approved: "ok", Issued: "ok", Submitted: "info", IFR: "info", Draft: "neutral" };
const PKG_TONE: Record<string, Tone> = { "RFQ issued": "info", "Market sounding": "violet", "Not started": "neutral", Awarded: "ok" };

/** `inset` aligns the outer columns with the page title (full-bleed tables). */
/** Full-bleed panels: edge to edge in the content area, square, flush under the page header; outer columns align with the page title. */
const BLEED = "-mx-4 rounded-none border-x-0 border-t-0 md:-mx-8 lg:-mt-6";
const BLEED_HEADER = "px-4 md:px-8";
const FIRST_COL = "pr-4 pl-4 md:pl-8";
const LAST_COL = "md:pr-8";

function SimpleTable({ head, children, minWidth = 560, inset = false }: { head: string[]; children: React.ReactNode; minWidth?: number; inset?: boolean }) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-[13px]" style={{ minWidth }}>
        <thead className="bg-paper-2 text-xs text-muted">
          <tr className="border-y border-line-2">
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("py-2.5 font-medium", i === 0 ? (inset ? FIRST_COL : "px-5") : "px-4", inset && i === head.length - 1 && LAST_COL)}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Documents({ documents }: { documents: WorkspaceSnapshot["documents"] }) {
  const rows = [...documents].sort((a, b) => b.updated.localeCompare(a.updated));
  return (
    <Panel
      title="Document register"
      bodyClassName="p-0"
      className={BLEED}
      headerClassName={BLEED_HEADER}
      actions={
        <span className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled aria-label="Upload document — planned feature">
            <Upload className="size-3.5" /> Upload
          </Button>
        </span>
      }
    >
      <SimpleTable head={["Document", "Type", "Updated", "Status"]} inset>
        {rows.map((d) => (
          <tr key={d.id} className="border-b border-line-2 last:border-0 hover:bg-paper-2">
            <td className={cn("py-3 text-ink", FIRST_COL)}>{d.title}</td>
            <td className="px-4 py-3 text-ink-2">{d.type}</td>
            <td className="num px-4 py-3 text-ink-2">{fmtDate(d.updated)}</td>
            <td className={cn("px-4 py-3", LAST_COL)}>
              <Badge tone={DOC_TONE[d.status] ?? "neutral"}>{d.status}</Badge>
            </td>
          </tr>
        ))}
      </SimpleTable>
    </Panel>
  );
}

export function Packages({ suppliers }: { suppliers: WorkspaceSnapshot["suppliers"] }) {
  return (
    <Panel title="Supplier packages" bodyClassName="p-0" className={BLEED} headerClassName={BLEED_HEADER}>
      <SimpleTable head={["Package / supplier", "Scope", "Status"]} inset>
        {suppliers.map((s) => (
          <tr key={s.name} className="border-b border-line-2 last:border-0 hover:bg-paper-2">
            <td className={cn("py-3 text-ink", FIRST_COL)}>{s.name}</td>
            <td className="px-4 py-3 text-ink-2">{s.scope}</td>
            <td className={cn("px-4 py-3", LAST_COL)}>
              <Badge tone={PKG_TONE[s.status] ?? "neutral"}>{s.status}</Badge>
            </td>
          </tr>
        ))}
      </SimpleTable>
    </Panel>
  );
}
