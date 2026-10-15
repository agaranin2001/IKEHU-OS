"use client";

import { ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { TopicTag } from "@/components/ui/TopicTag";
import { cn } from "@/components/ui/cn";
import type { PriceSeries, SourceRef } from "@/domain/types";
import { fmtDate } from "@/lib/format";
import { fmtMonth } from "./marketMath";

interface SourceUse {
  source: SourceRef;
  zones: Set<string>;
  resolutions: Set<string>;
  retrievedAt: Set<string>;
}

/** Groups every series' SourceRef by URL so each source is listed once with the zones it covers. */
function collectSources(series: PriceSeries[]): SourceUse[] {
  const map = new Map<string, SourceUse>();
  for (const s of series) {
    const u = map.get(s.source.url) ?? { source: s.source, zones: new Set(), resolutions: new Set(), retrievedAt: new Set() };
    u.zones.add(s.biddingZone);
    u.resolutions.add(s.resolution);
    u.retrievedAt.add(s.retrievedAt);
    map.set(s.source.url, u);
  }
  return [...map.values()].sort((a, b) => b.zones.size - a.zones.size);
}

/** Splits the dataset notes at labelled clauses ("Sources: …", "Not included: …"); text is unchanged. */
function splitNotes(notes: string): string[] {
  return notes
    .split(/(?<=\.)\s+(?=[A-Z][\w\s()–'-]{0,48}:\s)/)
    .map((n) => n.trim())
    .filter(Boolean);
}

/**
 * Turns a note like "Gap fills (series keep their primary SourceRef): Energy-Charts …"
 * into a chip label ("Gap fills") and body; a parenthetical in the label stays in the body.
 */
function labelNote(note: string): { label: string; body: string } {
  const m = note.match(/^([A-Z][\w\s–'-]{0,40}?)\s*(\([^)]*\))?:\s+([\s\S]*)$/);
  if (!m) return { label: "Note", body: note };
  const body = m[2] ? `${m[2]} ${m[3]}` : m[3];
  return { label: m[1].trim(), body: body.charAt(0).toUpperCase() + body.slice(1) };
}

export function Methodology({
  info,
  monthly,
  hourly,
  span,
}: {
  info: { compiledAt: string; coverage: string; notes: string };
  monthly: PriceSeries[];
  hourly: PriceSeries[];
  span: { first: string; last: string } | null;
}) {
  const sources = collectSources([...monthly, ...hourly]);
  const statements = [
    {
      tag: "Data",
      title: "Historical, not live",
      body: `Day-ahead auction results${span ? ` from ${fmtMonth(span.first)} to ${fmtMonth(span.last)}` : ""}, compiled ${fmtDate(info.compiledAt)}. No live market feed is connected; figures do not update automatically.`,
    },
    {
      tag: "Scope",
      title: "Wholesale energy only",
      body: "Grid tariffs, taxes, levies and supplier margins are excluded. The grid-fee field in the cost table is your own assumption, not sourced data.",
    },
    {
      tag: "Method",
      title: "How figures are derived",
      body: "Period averages are unweighted means of the monthly averages in the period. Hydrogen figures cover electricity input only: price × SEC ÷ 1000 (€/kg), excluding capex, O&M, water and stack replacement.",
    },
    {
      tag: "Model",
      title: "Extensible data model",
      body: "Each series carries its bidding zone, resolution, source and retrieval date, so further markets and zones can be added to the dataset without changing this screen.",
    },
  ];

  return (
    <div className="space-y-6">
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statements.map((s) => (
          <li key={s.title} className="flex flex-col rounded-card bg-paper p-8">
            <TopicTag>{s.tag}</TopicTag>
            <h3 className="mt-7 text-[22px] leading-[1.3] text-ink">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.body}</p>
          </li>
        ))}
      </ul>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Coverage and dataset notes">
        {[{ label: "Coverage", body: info.coverage }, ...splitNotes(info.notes).map(labelNote)].map((n, i) => (
          <li key={i} className="flex flex-col rounded-card bg-paper p-8">
            <TopicTag>{n.label}</TopicTag>
            <ClampedText text={n.body} />
          </li>
        ))}
      </ul>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Series sources">
        {sources.map((u) => (
          <li key={u.source.url}>
            <a href={u.source.url} target="_blank" rel="noopener noreferrer" className="group relative block h-full">
              <div className="notched flex h-full min-h-[300px] flex-col rounded-card bg-paper p-8 transition-colors duration-300 group-hover:bg-paper-2">
                <div className="flex items-center justify-between gap-4">
                  <TopicTag>Source</TopicTag>
                  <span className="text-[13px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">{[...u.retrievedAt].map((d) => fmtDate(d)).join(", ")}</span>
                </div>
                <h3 className="mt-7 text-[22px] leading-[1.3] text-ink">{u.source.title}</h3>
                <p className="mt-2 text-sm text-muted">{u.source.publisher}</p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                  <dt className="text-faint">Zones</dt>
                  <dd className="num text-ink-2">{[...u.zones].join(", ")}</dd>
                  <dt className="text-faint">Resolution</dt>
                  <dd className="text-ink-2">{[...u.resolutions].join(", ")}</dd>
                </dl>
                <div className="mt-auto pt-10 text-[13px] font-medium tracking-[0.08em] text-forest uppercase">Open source</div>
              </div>
              <span className="notch-btn" aria-hidden>
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-snug text-faint">Each series keeps its primary source; gap-filled months from other publishers are described in the dataset notes.</p>
    </div>
  );
}

/** Text clamped to three lines with a "Read more" toggle, shown only when the text overflows. */
function ClampedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    if (!expanded) measure();
    const ro = new ResizeObserver(() => !expanded && measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, text]);

  return (
    <>
      <p ref={ref} className={cn("mt-6 text-sm leading-relaxed text-ink-2", !expanded && "line-clamp-3")}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button type="button" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} className="mt-3 self-start text-[13px] font-medium tracking-[0.08em] text-forest uppercase hover:underline">
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </>
  );
}
