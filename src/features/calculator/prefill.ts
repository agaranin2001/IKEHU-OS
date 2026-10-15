import type { ElectrolyserTech } from "@/domain/types";
import type { CalculatorPrefill } from "./LcohCalculator";

/** Parses ?price=&zone=&capacity=&technology= deep-link parameters. */
export function parsePrefill(sp: Record<string, string | string[] | undefined>): CalculatorPrefill | undefined {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const num = (k: string) => {
    const v = one(k);
    const n = v == null ? Number.NaN : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const tech = one("technology");
  const out: CalculatorPrefill = {
    price: num("price"),
    capacity: num("capacity"),
    zone: one("zone"),
    technology: (["PEM", "Alkaline", "SOEC", "AEM"] as const).includes(tech as ElectrolyserTech) ? (tech as ElectrolyserTech) : undefined,
  };
  return Object.values(out).some((v) => v !== undefined) ? out : undefined;
}
