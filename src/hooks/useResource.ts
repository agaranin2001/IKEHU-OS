"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type ResourceStatus = "loading" | "success" | "error";

export interface Resource<T> {
  data: T | undefined;
  error: Error | undefined;
  status: ResourceStatus;
  /** True while a (re)fetch runs; previous data stays visible meanwhile. */
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Minimal async data hook: keeps the previous data visible while a new query
 * loads (no flashing), exposes loading / error / success states, and ignores
 * stale responses. `key` must change whenever the query changes.
 */
export function useResource<T>(key: string, fetcher: () => Promise<T>): Resource<T> {
  const [nonce, setNonce] = useState(0);
  const token = `${key}#${nonce}`;
  const [state, setState] = useState<{ token?: string; data?: T; error?: Error }>({});
  const fetcherRef = useRef(fetcher);
  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let alive = true;
    fetcherRef
      .current()
      .then((data) => alive && setState({ token, data }))
      .catch((e: unknown) => alive && setState((s) => ({ ...s, token, error: e instanceof Error ? e : new Error(String(e)) })));
    return () => {
      alive = false;
    };
  }, [token]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  const error = state.token === token ? state.error : undefined;
  const status: ResourceStatus = error ? "error" : state.data === undefined ? "loading" : "success";
  return { data: state.data, error, status, isFetching: state.token !== token, refetch };
}
