"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for per-browser UI state (checklists,
 * self-assessments). Every access is wrapped in try/catch; when storage is
 * unavailable (private mode, quota, blocked) values live in memory for the
 * session and `persisted` is false so the UI can say so.
 */

const PREFIX = "h2os:";
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value == null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, value);
    memory.delete(key);
  } catch {
    if (value == null) memory.delete(key);
    else memory.set(key, value);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

let storageProbe: boolean | null = null;
function canPersist(): boolean {
  if (storageProbe != null) return storageProbe;
  try {
    const k = `${PREFIX}__probe`;
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    storageProbe = true;
  } catch {
    storageProbe = false;
  }
  return storageProbe;
}

export function useBrowserStore<T>(key: string, fallback: T, parse: (raw: unknown) => T | null) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  const persisted = useSyncExternalStore(
    subscribe,
    () => canPersist() && !memory.has(key),
    () => true,
  );

  const value = useMemo(() => {
    if (raw == null) return fallback;
    try {
      return parse(JSON.parse(raw)) ?? fallback;
    } catch {
      return fallback;
    }
  }, [raw, fallback, parse]);

  const setValue = useCallback((next: T | null) => writeRaw(key, next == null ? null : JSON.stringify(next)), [key]);

  return { value, setValue, persisted };
}

/* Typed helpers ---------------------------------------------------- */

const EMPTY_LIST: string[] = [];
const parseStringList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : null);

/** Ticked checklist item ids for one opportunity. */
export function useChecklistState(opportunityId: string) {
  const { value, setValue, persisted } = useBrowserStore<string[]>(`checklist:${opportunityId}`, EMPTY_LIST, parseStringList);
  const checked = useMemo(() => new Set(value), [value]);
  const toggle = useCallback(
    (id: string, on: boolean) => {
      const next = new Set(value);
      if (on) next.add(id);
      else next.delete(id);
      setValue(next.size ? [...next] : null);
    },
    [value, setValue],
  );
  const clear = useCallback(() => setValue(null), [setValue]);
  return { checked, toggle, clear, persisted };
}

export type SelfAssessment = "yes" | "no" | "unsure";
const EMPTY_ANSWERS: Record<string, SelfAssessment> = {};
const parseAnswers = (v: unknown): Record<string, SelfAssessment> | null => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, SelfAssessment> = {};
  for (const [k, a] of Object.entries(v)) if (a === "yes" || a === "no" || a === "unsure") out[k] = a;
  return out;
};

/** Eligibility self-assessment answers for one opportunity. */
export function useSelfAssessment(opportunityId: string) {
  const { value, setValue, persisted } = useBrowserStore(`eligibility:${opportunityId}`, EMPTY_ANSWERS, parseAnswers);
  const answer = useCallback((id: string, a: SelfAssessment) => setValue({ ...value, [id]: a }), [value, setValue]);
  const clear = useCallback(() => setValue(null), [setValue]);
  return { answers: value, answer, clear, persisted };
}

/** Stable checklist item ids derived from record text. */
export const docItemId = (text: string) => `doc:${text}`;
export const reqItemId = (text: string) => `req:${text}`;
