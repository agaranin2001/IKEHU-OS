import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand, SectionHeading, TextLink } from "@/components/marketing/Sections";
import { VerificationPill } from "@/components/ui/StatusPill";
import type { VerificationStatus } from "@/domain/types";
import { StatusLegend } from "@/features/projects";
import { fmtDate } from "@/lib/format";
import { VERIFICATION } from "@/lib/labels";
import { services } from "@/services";

export const metadata: Metadata = {
  title: "Data & methodology",
  description: "How the platform sources, verifies and calculates — and what it does not claim.",
};

const RULES = [
  ["Announced is not committed", "Projects are classified by the furthest stage confirmed in sources; FID is flagged separately."],
  ["Electrolyser MW is not generation MW", "Capacity always means electrolyser electrical input. Wind or solar capacity is never counted as hydrogen capacity."],
  ["Production cost is not a price", "LCOH estimates plant-gate production cost. It is not a market price, offtake price or investment return."],
  ["Vendor claims are labelled", "Datasheet figures are shown as manufacturer claims, not independently tested results."],
  ["Prices only when public", "Equipment prices appear only where a public source discloses them; otherwise a quotation is required."],
  ["Missing data stays missing", "Undisclosed values show as undisclosed — never as zero and never estimated silently."],
  ["Dated and scoped", "Every aggregate shows its dataset scope and compile date; every record its last-verified date."],
  ["Historical is not live", "Electricity prices are historical day-ahead data; no live feed is connected in this version."],
];

export default async function DataPage() {
  const [projects, suppliers, opps, companies, investors, insights, pInfo, sInfo, oInfo, eInfo] = await Promise.all([
    services.projects.list(),
    services.suppliers.list(),
    services.opportunities.list(),
    services.companies.list(),
    services.investors.list(),
    services.insights.list(),
    services.projects.info(),
    services.suppliers.info(),
    services.opportunities.info(),
    services.energy.info(),
  ]);
  const all = [...projects, ...suppliers, ...opps, ...companies, ...investors, ...insights];
  const byVer = Object.fromEntries(Object.keys(VERIFICATION).map((k) => [k, all.filter((r) => r.verification === k).length]));
  const datasets = [
    { name: "Hydrogen projects", n: projects.length, v: pInfo.version, d: pInfo.compiledAt, scope: pInfo.scope },
    { name: "Suppliers & equipment", n: suppliers.length, v: sInfo.version, d: sInfo.compiledAt, scope: sInfo.scope },
    { name: "Opportunities", n: opps.length, v: oInfo.version, d: oInfo.compiledAt, scope: oInfo.scope },
    { name: "Companies", n: companies.length, v: "2026.10.1", d: "2026-10-14", scope: "Value-chain companies with documented deals" },
    { name: "Investors & funders", n: investors.length, v: "2026.10.1", d: "2026-10-14", scope: "Investors with documented hydrogen investments" },
    { name: "Market insights", n: insights.length, v: "2026.10.1", d: "2026-10-14", scope: "Headline findings from public reports" },
    { name: "Electricity prices", n: 18, v: "2026.10.1", d: eInfo.compiledAt, scope: "Monthly day-ahead averages, 18 bidding zones (count = zones)" },
  ];

  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient rounded-panel px-6 py-16 md:px-14 md:py-24">
          <Reveal className="max-w-3xl">
            <div className="eyebrow">Data & methodology</div>
            <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">Credibility is a feature. Here is how we earn it.</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              The platform is only useful if engineers and investors can trust — and check — what it shows. These are the rules every record and calculation follows.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-site">
          <SectionHeading title="Eight rules we do not break" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map(([t, b], i) => (
              <Reveal key={t} delay={(i % 4) * 60}>
                <div className="h-full rounded-card border border-line-2 bg-paper p-6">
                  <div className="num text-xs font-semibold text-violet">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-3 text-lg font-medium text-ink">{t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 md:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[30px] leading-tight font-light text-ink md:text-h3">Verification status</h2>
            <p className="mt-3 text-ink-2">Shown on every record, computed here across all {all.length} sourced records.</p>
            <ul className="mt-8 space-y-3">
              {Object.entries(VERIFICATION).map(([k, v]) => (
                <li key={k} className="flex items-start gap-4 rounded-card border border-line-2 bg-page p-4">
                  <VerificationPill status={k as VerificationStatus} />
                  <span className="flex-1 text-sm text-ink-2">{v.help}</span>
                  <span className="num text-lg font-light text-ink">{byVer[k]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[30px] leading-tight font-light text-ink md:text-h3">Project status taxonomy</h2>
            <p className="mt-3 text-ink-2">Six stages plus a separate final-investment-decision flag.</p>
            <StatusLegend variant="definitions" showFid className="mt-8" />
          </div>
        </div>
      </section>

      <section id="methodology" className="scroll-mt-24 py-20 md:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="eyebrow">Hydrogen economics</div>
            <h2 className="mt-4 text-[30px] leading-tight font-light text-ink md:text-h3">How the LCOH is calculated</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
              A discounted levelised-cost model in real euros. Capital recovery enters once — through discounting production — so financing cost is never counted twice. Stack replacements follow cumulative operating hours; degradation lowers output at constant power.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              <TextLink href="/app/sources#lcoh-methodology">Full methodology</TextLink>
              <TextLink href="/calculator">Try the calculator</TextLink>
            </div>
          </div>
          <div className="rounded-panel bg-deep p-8 text-cream" data-header="dark">
            <div className="font-mono text-[15px] leading-relaxed text-white">
              LCOH = [CAPEX₀ + Σ (OPEXₜ + Stackₜ)(1+r)⁻ᵗ] ÷ Σ H₂ₜ(1+r)⁻ᵗ
            </div>
            <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <div className="font-medium text-mint">Included</div>
                <ul className="mt-2 space-y-1 text-cream/75">
                  <li>Installed system CAPEX</li>
                  <li>Stack replacements</li>
                  <li>Fixed & variable O&M</li>
                  <li>Electricity incl. grid fees</li>
                  <li>Water</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-mint">Excluded</div>
                <ul className="mt-2 space-y-1 text-cream/75">
                  <li>Compression, storage, transport</li>
                  <li>Land & grid connection (unless in CAPEX)</li>
                  <li>Taxes and subsidies</li>
                  <li>Oxygen & heat revenue</li>
                  <li>Heat input for SOEC</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-site">
          <h2 className="text-[30px] leading-tight font-light text-ink md:text-h3">Dataset inventory</h2>
          <p className="mt-3 max-w-2xl text-ink-2">Research-sample sizes, not claims of market coverage. Each dataset is versioned and can be replaced by a live data provider.</p>
          <div className="scrollbar-thin mt-8 overflow-x-auto rounded-card border border-line-2 bg-paper">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-paper-2 text-left text-[11px] tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Dataset</th>
                  <th className="px-3 py-3 text-right font-medium">Records</th>
                  <th className="px-3 py-3 font-medium">Version</th>
                  <th className="px-3 py-3 font-medium">Compiled</th>
                  <th className="px-5 py-3 font-medium">Scope</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.name} className="border-t border-line-2">
                    <td className="px-5 py-3 font-medium text-ink">{d.name}</td>
                    <td className="num px-3 py-3 text-right">{d.n}</td>
                    <td className="num px-3 py-3 text-muted">{d.v}</td>
                    <td className="px-3 py-3 text-muted">{fmtDate(d.d)}</td>
                    <td className="px-5 py-3 text-ink-2">{d.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <CtaBand />
      <div className="h-10" />
    </>
  );
}
