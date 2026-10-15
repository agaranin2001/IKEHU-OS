/**
 * Typed access to public environment variables. Only NEXT_PUBLIC_* values are
 * read here so the same config works in server and client components.
 */
export type DataProviderKind = "mock" | "http";

export const ENV = {
  dataProvider: (process.env.NEXT_PUBLIC_DATA_PROVIDER === "http" ? "http" : "mock") as DataProviderKind,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  mockLatencyMs: Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS ?? 350),
} as const;
