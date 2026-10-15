import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { BenchmarksTable } from "@/features/sources/BenchmarksTable";
import { DatasetCards } from "@/features/sources/DatasetCards";
import { DataRules, FutureIntegrations, LcohMethodology, Section, SOURCES_TOC, VerificationDefinitions } from "@/features/sources/Methodology";
import { PublisherList } from "@/features/sources/PublisherList";
import { SourcesTabs } from "@/features/sources/SourcesTabs";

export const metadata: Metadata = {
  title: "Sources & Methodology",
  description: "Datasets, verification rules, LCOH methodology, benchmarks and source publishers behind the platform.",
};

const EYEBROW: Record<(typeof SOURCES_TOC)[number]["id"], string> = {
  datasets: "Coverage",
  verification: "Provenance",
  "data-rules": "Credibility",
  "lcoh-methodology": "Economics",
  benchmarks: "Reference values",
  publishers: "Citations",
  "future-integrations": "Roadmap",
};

const CONTENT: Record<(typeof SOURCES_TOC)[number]["id"], ReactNode> = {
  datasets: <DatasetCards />,
  verification: <VerificationDefinitions />,
  "data-rules": <DataRules />,
  "lcoh-methodology": <LcohMethodology />,
  benchmarks: <BenchmarksTable />,
  publishers: <PublisherList />,
  "future-integrations": <FutureIntegrations />,
};

/** One section at a time, switched by the chip tabs (`#<section>` deep-links to a tab). */
export default function SourcesPage() {
  return (
    <>
      <PageHeader title="Sources & Methodology" />
      <PageBody className="pb-16">
        <SourcesTabs
          panels={SOURCES_TOC.map((t) => ({
            id: t.id,
            label: t.label,
            content: (
              <Section id={t.id} eyebrow={EYEBROW[t.id]} title={t.label}>
                {CONTENT[t.id]}
              </Section>
            ),
          }))}
        />
      </PageBody>
    </>
  );
}
