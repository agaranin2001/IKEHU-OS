import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { CompaniesExplorer } from "@/features/companies/CompaniesExplorer";
import { isCompaniesTab } from "@/features/companies/model";

export const metadata: Metadata = {
  title: "Companies & Investors",
  description: "Publicly documented hydrogen companies, investors and deals, with a preliminary due-diligence checklist.",
};

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; company?: string | string[] }> }) {
  const sp = await searchParams;
  const tab = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const company = Array.isArray(sp.company) ? sp.company[0] : sp.company;
  return (
    <>
      <PageHeader title="Investment & Company Intelligence" />
      <PageBody>
        <CompaniesExplorer initialTab={isCompaniesTab(tab) ? tab : "companies"} initialCompanyId={company} />
      </PageBody>
    </>
  );
}
