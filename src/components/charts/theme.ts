/** Chart tokens — mirror the CSS variables in globals.css (validated palette). */
export const SERIES = ["#16825f", "#7c18d3", "#c47a0f", "#2b7bd6", "#d04a3a", "#0b8fa0"] as const;
export const CHART = {
  grid: "#ebe8e1",
  axis: "#8b9593",
  text: "#5f6b69",
  ink: "#101f1e",
  surface: "#ffffff",
  font: 11,
};

/** Stable colour per entity key — colour follows the entity, never its rank. */
export function colorFor(key: string, keys: readonly string[]): string {
  const i = keys.indexOf(key);
  return SERIES[(i < 0 ? 0 : i) % SERIES.length];
}
