import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/features/opportunities/OpportunityDetail";
import { services } from "@/services";

type Params = Promise<{ id: string }>;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const items = await services.opportunities.list();
    return items.map((o) => ({ id: o.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const o = await services.opportunities.get(id).catch(() => null);
  if (!o) return { title: "Opportunity not found" };
  return { title: o.title, description: o.summary.slice(0, 200) };
}

export default async function OpportunityPage({ params }: { params: Params }) {
  const { id } = await params;
  const opportunity = await services.opportunities.get(id);
  if (!opportunity) notFound();
  return <OpportunityDetail opportunity={opportunity} />;
}
