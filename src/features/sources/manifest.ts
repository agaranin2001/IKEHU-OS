/**
 * Dataset metadata for repositories whose contract has no `info()` method
 * (companies, investors, insights). The manifest is metadata only — version,
 * compile date and scope — never records, so reading it here does not bypass
 * the service layer for data. Record counts always come from the services.
 */
import { DATASET_MANIFEST } from "@/data/manifest";
import { fmtDate } from "@/lib/format";

export type ManifestKey = keyof typeof DATASET_MANIFEST;

export interface ManifestEntry {
  version: string;
  compiledAt: string;
  scope: string;
}

export const manifestEntry = (key: ManifestKey): ManifestEntry => DATASET_MANIFEST[key];

/** Footnote text for aggregates: scope · compile date · version. */
export const manifestNote = (key: ManifestKey) => {
  const m = DATASET_MANIFEST[key];
  return `${m.scope}. Compiled ${fmtDate(m.compiledAt)} · dataset v${m.version}.`;
};
