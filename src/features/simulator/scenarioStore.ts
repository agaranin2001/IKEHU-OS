/** Simulator scenarios saved in this browser (localStorage). Every run is kept until deleted. */
import type { PricePoint, SimInputs } from "./model";

export interface Scenario {
  source: "sample" | "upload";
  zone: string;
  day: string;
  upload: { name: string; points: PricePoint[] } | null;
  inputs: SimInputs;
}

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  scenario: Scenario;
  /** The uploaded price file was too large to keep; re-upload to run it again. */
  uploadDropped?: boolean;
}

export interface ScenarioStore {
  scenarios: SavedScenario[];
  currentId: string | null;
  /** Scenarios shown in the comparison table; empty means all. */
  compareIds: string[];
}

const KEY = "ikehu:simulator:scenarios:v1";
export const EMPTY_STORE: ScenarioStore = { scenarios: [], currentId: null, compareIds: [] };

export function loadStore(): ScenarioStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw) as Partial<ScenarioStore>;
    return {
      scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios.filter((s) => s && s.id && s.scenario?.inputs) : [],
      currentId: parsed.currentId ?? null,
      compareIds: Array.isArray(parsed.compareIds) ? parsed.compareIds : [],
    };
  } catch {
    return EMPTY_STORE;
  }
}

/** Saves the store; if it exceeds the browser quota, retries without uploaded price files. */
export function persistStore(store: ScenarioStore): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    try {
      const slim: ScenarioStore = {
        ...store,
        scenarios: store.scenarios.map((s) => (s.scenario.upload ? { ...s, uploadDropped: true, scenario: { ...s.scenario, upload: { name: s.scenario.upload.name, points: [] } } } : s)),
      };
      window.localStorage.setItem(KEY, JSON.stringify(slim));
    } catch {
      // Storage unavailable (private mode, blocked site data): scenarios last for this visit only.
    }
  }
}

export const sameScenario = (a: Scenario, b: Scenario) => JSON.stringify(a) === JSON.stringify(b);
