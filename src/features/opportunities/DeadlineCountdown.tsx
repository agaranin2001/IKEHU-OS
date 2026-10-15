"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/components/ui/cn";
import type { Tone } from "@/lib/labels";

const MINUTE = 60_000;
const subscribe = (tick: () => void) => {
  const t = setInterval(tick, MINUTE);
  return () => clearInterval(t);
};
/** Current time floored to the minute (stable between renders); null on the server. */
const useNowMinute = () =>
  useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => null,
  );

const toneBox: Record<Tone, string> = {
  bad: "border-bad/20 bg-bad-soft/60 text-bad",
  warn: "border-warn/25 bg-warn-soft/70 text-warn",
  ok: "border-ok/20 bg-ok-soft/70 text-ok",
  info: "border-info/20 bg-info-soft/70 text-info",
  violet: "border-violet/20 bg-violet-soft/70 text-violet",
  neutral: "border-line-2 bg-paper-2 text-ink-2",
};

/** Days + hours until the deadline (ISO; date-only means end of that day, UTC), ticking each minute. */
export function DeadlineCountdown({ deadline, tone, className }: { deadline: string; tone: Tone; className?: string }) {
  const now = useNowMinute();
  const end = Date.parse(deadline.length <= 10 ? `${deadline}T23:59:59Z` : deadline);
  if (now == null || !Number.isFinite(end) || end <= now) return null;

  const totalHours = Math.floor((end - now) / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const units = [
    { v: days, l: days === 1 ? "day" : "days" },
    { v: hours, l: hours === 1 ? "hour" : "hours" },
  ];

  return (
    <div className={cn("inline-flex shrink-0 items-stretch rounded-card border", toneBox[tone], className)} role="timer" aria-label={`${days} days and ${hours} hours to deadline`}>
      {units.map((u, i) => (
        <div key={u.l} className={cn("min-w-[64px] px-3 py-2 text-center", i > 0 && "border-l border-current/15")}>
          <div className="num text-2xl leading-none font-light">{u.v}</div>
          <div className="mt-1 text-[11px] text-muted">{u.l}</div>
        </div>
      ))}
    </div>
  );
}
