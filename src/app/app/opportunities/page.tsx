import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { OpportunityRadar } from "@/features/opportunities/OpportunityRadar";

export const metadata: Metadata = {
  title: "Opportunity Radar",
  description: "Hydrogen funding calls, auctions and public tenders with deadlines, budgets, eligibility and an application checklist.",
};

export default function OpportunitiesPage() {
  return (
    <>
      <PageHeader title="Opportunity Radar" />
      <PageBody>
        <OpportunityRadar />
      </PageBody>
    </>
  );
}
