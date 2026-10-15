import type { Metadata } from "next";
import { WorkspaceView } from "@/features/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "Project Workspace",
  description: "Preview of the Engineering & Project Delivery workspace using a fictional demo project.",
};

export default function WorkspacePage() {
  return <WorkspaceView />;
}
