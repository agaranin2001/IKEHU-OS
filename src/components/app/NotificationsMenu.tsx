"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { buildAlerts } from "@/features/dashboard/alerts";
import { useResource } from "@/hooks/useResource";
import { services } from "@/services";

const STORAGE_KEY = "ikehu:notifications:read";

function loadRead(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveRead(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage unavailable (private mode) — read state lasts for this session only.
  }
}

/**
 * Top-bar notifications: the dataset alerts (closing deadlines, cancelled and
 * delayed projects) with an unread count. Read state is kept in this browser.
 */
export function NotificationsMenu() {
  const res = useResource("notifications", async () => {
    const [opportunities, projects] = await Promise.all([services.opportunities.list(), services.projects.list()]);
    return buildAlerts(opportunities, projects);
  });
  const items = useMemo(() => res.data ?? [], [res.data]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRead(loadRead()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const unread = items.filter((a) => !read.has(a.id)).length;

  const markRead = (ids: string[]) => {
    setRead((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveRead(next);
      return next;
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        title="Notifications"
        className="relative grid size-9 place-items-center rounded-btn text-ink-2 transition-colors hover:bg-stone hover:text-ink"
      >
        <Bell className="size-[18px]" aria-hidden />
        {unread > 0 && (
          <span className="num absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-bad px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-page">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="absolute top-full right-0 z-50 mt-1.5 w-[380px] overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-line-2 px-4 py-3">
            <div>
              <div className="text-[15px] font-semibold text-ink">Notifications</div>
              <div className="text-xs text-muted">{unread ? `${unread} unread` : "All caught up"}</div>
            </div>
            <button
              type="button"
              disabled={!unread}
              onClick={() => markRead(items.map((a) => a.id))}
              className="inline-flex items-center gap-1.5 rounded-btn px-2 py-1.5 text-xs font-semibold text-forest hover:bg-paper-2 disabled:cursor-default disabled:text-faint disabled:hover:bg-transparent"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Mark all as read
            </button>
          </div>
          <ul className="scrollbar-thin max-h-[420px] overflow-y-auto p-2">
            {res.status === "loading" && <li className="px-3 py-6 text-center text-sm text-muted">Loading…</li>}
            {res.status === "success" && items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No notifications.</li>}
            {items.map((a) => {
              const isUnread = !read.has(a.id);
              return (
                <li key={a.id}>
                  <Link
                    href={a.href}
                    onClick={() => (markRead([a.id]), setOpen(false))}
                    className={cn("flex gap-3 rounded-btn px-3 py-2.5 transition-colors hover:bg-paper-2", isUnread && "bg-mint-soft/40")}
                  >
                    <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", isUnread ? "bg-forest" : "bg-transparent")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[11px] text-muted">
                        <Badge tone={a.tone}>{a.badge}</Badge>
                        <span className="truncate">{a.where}</span>
                      </span>
                      <span className={cn("mt-1 line-clamp-2 block text-[13px] leading-snug", isUnread ? "font-medium text-ink" : "text-ink-2")}>{a.title}</span>
                      <span className={cn("mt-0.5 line-clamp-1 block text-[11px]", a.tone === "bad" ? "text-bad" : "text-warn")}>{a.meta}</span>
                    </span>
                    {isUnread && <span className="sr-only">Unread</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
