/**
 * HTTP providers for the future platform API.
 *
 * Endpoint contract (REST, JSON, all responses use the types in domain/types):
 *   GET  /projects?search=&statuses=a,b&...      -> HydrogenProject[]
 *   GET  /projects/:id                           -> HydrogenProject | 404
 *   GET  /projects/_info                         -> DatasetInfo
 *   GET  /suppliers, /suppliers/:id, /products   -> TechnologySupplier[] ...
 *   POST /procurement/quote-requests             -> QuoteRequestResult
 *   GET  /companies, /investors, /opportunities  (+ /:id)
 *   GET  /insights, /benchmarks, /scenarios
 *   GET  /energy/zones, /energy/prices/monthly?zones=, /energy/prices/hourly-samples, /energy/_info
 *   GET  /workspace/snapshot
 *   POST /leads/demo-requests
 *
 * Authentication: attach a bearer token in `request()` once auth exists.
 */
import { ENV } from "@/config/env";
import type { DataServices } from "../contracts";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function toQuery(params?: object): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    qs.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!ENV.apiBaseUrl) throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not configured.");
  const res = await fetch(`${ENV.apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  });
  if (res.status === 404) return null as T;
  if (!res.ok) throw new ApiError(res.status, `Request to ${path} failed (${res.status}).`);
  return (await res.json()) as T;
}

const post = <T,>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const httpServices: DataServices = {
  projects: {
    list: (q) => request(`/projects${toQuery(q)}`),
    get: (id) => request(`/projects/${encodeURIComponent(id)}`),
    info: () => request(`/projects/_info`),
  },
  suppliers: {
    list: (q) => request(`/suppliers${toQuery(q)}`),
    get: (id) => request(`/suppliers/${encodeURIComponent(id)}`),
    products: (q) => request(`/products${toQuery(q)}`),
    info: () => request(`/suppliers/_info`),
  },
  procurement: { requestQuote: (req) => post(`/procurement/quote-requests`, req) },
  companies: {
    list: (q) => request(`/companies${toQuery(q)}`),
    get: (id) => request(`/companies/${encodeURIComponent(id)}`),
  },
  investors: {
    list: (q) => request(`/investors${toQuery(q)}`),
    get: (id) => request(`/investors/${encodeURIComponent(id)}`),
  },
  opportunities: {
    list: (q) => request(`/opportunities${toQuery(q)}`),
    get: (id) => request(`/opportunities/${encodeURIComponent(id)}`),
    info: () => request(`/opportunities/_info`),
  },
  insights: { list: () => request(`/insights`) },
  benchmarks: { list: () => request(`/benchmarks`) },
  energy: {
    zones: () => request(`/energy/zones`),
    monthly: (zones) => request(`/energy/prices/monthly${toQuery({ zones })}`),
    hourlySamples: () => request(`/energy/prices/hourly-samples`),
    info: () => request(`/energy/_info`),
  },
  scenarios: { presets: () => request(`/scenarios`) },
  workspace: { snapshot: () => request(`/workspace/snapshot`) },
  leads: { submitDemoRequest: (req) => post(`/leads/demo-requests`, req) },
};
