import type { Metadata } from "next";
import { ProjectIntelligence } from "@/features/projects/ProjectIntelligence";

export const metadata: Metadata = {
  title: "Project Intelligence",
  description: "Publicly documented hydrogen production projects with status, capacity, technology and sources.",
};

export default function ProjectsPage() {
  return <ProjectIntelligence />;
}
