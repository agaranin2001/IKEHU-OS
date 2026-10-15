import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityProfile } from "@/features/companies/EntityProfile";
import { buildNameIndex, entityKindOf } from "@/features/companies/model";
import { services } from "@/services";

type Params = Promise<{ id: string }>;

async function load(id: string) {
  const kind = entityKindOf(id);
  if (kind === "company") {
    const record = await services.companies.get(id);
    return record ? ({ kind, record } as const) : null;
  }
  if (kind === "investor") {
    const record = await services.investors.get(id);
    return record ? ({ kind, record } as const) : null;
  }
  return null;
}

export async function generateStaticParams() {
  const [companies, investors] = await Promise.all([services.companies.list(), services.investors.list()]);
  return [...companies, ...investors].map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const entry = await load(id);
  if (!entry) return { title: "Profile not found" };
  return {
    title: entry.record.name,
    description: `${entry.kind === "company" ? "Company" : "Investor"} profile: publicly documented facts, deals and sources for ${entry.record.name}.`,
  };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  const entry = await load(id);
  if (!entry) notFound();

  const [companies, investors] = await Promise.all([services.companies.list(), services.investors.list()]);
  const nameIndex = buildNameIndex(companies, investors);

  if (entry.kind === "investor") return <EntityProfile kind="investor" record={entry.record} nameIndex={nameIndex} />;
  return (
    <EntityProfile
      kind="company"
      record={entry.record}
      nameIndex={nameIndex}
      supplierHref={entry.record.supplierId ? "/app/suppliers" : undefined}
    />
  );
}
