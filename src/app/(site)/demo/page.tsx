import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/Reveal";
import { DemoRequestForm } from "@/features/leads/DemoRequestForm";

export const metadata: Metadata = { title: "Request a demo" };

export default function DemoPage() {
  return (
    <section className="container-site pt-2 pb-24">
      <div className="hero-gradient grid gap-12 rounded-panel px-6 py-14 md:px-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="eyebrow">Request a demo</div>
          <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">See the platform on your own project questions.</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">
            Tell us what you are evaluating — a site, a technology choice, a funding call or a counterparty — and we will walk through the relevant modules with you.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-ink-2">
            <li>• 30-minute walkthrough of intelligence and economics modules</li>
            <li>• Review of your LCOH assumptions against sourced benchmarks</li>
            <li>• Roadmap discussion for delivery and procurement tools</li>
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <DemoRequestForm />
        </Reveal>
      </div>
    </section>
  );
}
