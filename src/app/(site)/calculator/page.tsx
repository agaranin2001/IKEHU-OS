import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/Reveal";
import { LcohCalculator } from "@/features/calculator/LcohCalculator";
import { parsePrefill } from "@/features/calculator/prefill";

export const metadata: Metadata = {
  title: "Hydrogen Cost Calculator (LCOH)",
  description: "Estimate the levelised cost of hydrogen with transparent assumptions, sourced benchmarks, scenarios and sensitivities.",
};

export default async function PublicCalculatorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const prefill = parsePrefill(await searchParams);
  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient no-print rounded-panel px-6 py-14 md:px-14 md:py-16">
          <Reveal className="max-w-3xl">
            <div className="eyebrow">Free tool · Hydrogen economics</div>
            <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">Hydrogen cost calculator</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              Estimate the levelised cost of hydrogen from electrolysis. Every assumption is visible, benchmarks link to their sources, and the result comes with its sensitivity range — not a single confident number.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="container-site py-10 md:py-14">
        <LcohCalculator prefill={prefill} variant="public" />
      </section>
    </>
  );
}
