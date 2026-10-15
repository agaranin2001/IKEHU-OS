import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectRecord } from "@/features/projects/ProjectRecord";
import { relatedProjects } from "@/features/projects/model";
import { PROJECT_STATUS } from "@/lib/labels";
import { fmtMw } from "@/lib/format";
import { services } from "@/services";

type Params = Promise<{ id: string }>;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const projects = await services.projects.list();
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = await services.projects.get(id);
  if (!p) return { title: "Project not found" };
  return {
    title: p.name,
    description: `${p.name} — ${PROJECT_STATUS[p.status].label.toLowerCase()} hydrogen project in ${p.location.label}, ${p.countryName}. Developer: ${p.developer}. Electrolyser capacity: ${fmtMw(p.capacityMw)}.`,
  };
}

export default async function ProjectRecordPage({ params }: { params: Params }) {
  const { id } = await params;
  const project = await services.projects.get(id);
  if (!project) notFound();
  const [all, info] = await Promise.all([services.projects.list(), services.projects.info()]);
  return <ProjectRecord project={project} related={relatedProjects(project, all)} info={info} />;
}
