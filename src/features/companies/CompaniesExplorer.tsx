"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/Fields";
import { CompanyList } from "./CompanyList";
import { DealsTable } from "./DealsTable";
import { DueDiligence } from "./DueDiligence";
import { InvestorList } from "./InvestorList";
import { COMPANY_TABS, type CompaniesTab } from "./model";

const LABELS: Record<CompaniesTab, string> = {
  companies: "Companies",
  investors: "Investors",
  deals: "Deals",
  diligence: "Due diligence",
};

/**
 * Tabbed explorer for /app/companies. The active tab is mirrored to `?tab=`
 * (and the DD company to `?company=`) so views can be linked and shared.
 */
export function CompaniesExplorer({ initialTab = "companies", initialCompanyId }: { initialTab?: CompaniesTab; initialCompanyId?: string }) {
  const [tab, setTab] = useState<CompaniesTab>(initialTab);

  const change = (t: CompaniesTab) => {
    setTab(t);
    const url = new URL(window.location.href);
    if (t === "companies") url.searchParams.delete("tab");
    else url.searchParams.set("tab", t);
    if (t !== "diligence") url.searchParams.delete("company");
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-6">
      <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <Segmented label="Intelligence views" value={tab} onChange={change} options={COMPANY_TABS.map((t) => ({ value: t, label: LABELS[t] }))} />
      </div>
      <div role="tabpanel" aria-label={LABELS[tab]}>
        {tab === "companies" && <CompanyList />}
        {tab === "investors" && <InvestorList />}
        {tab === "deals" && <DealsTable />}
        {tab === "diligence" && <DueDiligence initialCompanyId={initialCompanyId} />}
      </div>
    </div>
  );
}
