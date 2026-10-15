import type { Metadata } from "next";
import { PageBody, PageHeader } from "@/components/app/AppShell";
import { SupplierExplorer } from "@/features/suppliers/SupplierExplorer";

export const metadata: Metadata = {
  title: "Technology & Suppliers",
  description: "Electrolyser and balance-of-plant equipment catalogue with side-by-side comparison and quotation requests.",
};

/** `?supplier=<id>` opens that supplier's profile (deep links from the workspace budget). */
export default async function SuppliersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supplier } = await searchParams;
  return (
    <>
      <PageHeader title="Technology & Supplier Explorer" />
      <PageBody>
        <SupplierExplorer initialSupplierId={typeof supplier === "string" ? supplier : undefined} />
      </PageBody>
    </>
  );
}
