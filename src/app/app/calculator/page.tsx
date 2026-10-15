import type { Metadata } from "next";
import { CalculatorViews } from "@/features/calculator/CalculatorViews";
import { parsePrefill } from "@/features/calculator/prefill";

export const metadata: Metadata = { title: "LCOH Calculator" };

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const prefill = parsePrefill(params);
  return <CalculatorViews prefill={prefill} initialView={params.view === "simulator" ? "simulator" : "lcoh"} />;
}
