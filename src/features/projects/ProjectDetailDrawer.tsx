"use client";

import { MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProvenanceBlock } from "@/components/ui/Sources";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { ProjectStatusPill } from "@/components/ui/StatusPill";
import type { HydrogenProject } from "@/domain/types";
import { FactList, projectDrawerFacts } from "./ProjectFacts";
import { calculatorHref, projectHref } from "./model";

export function ProjectDetailDrawer({
  projectId,
  project,
  status,
  error,
  onRetry,
  onClose,
}: {
  projectId: string | null;
  project: HydrogenProject | null | undefined;
  /** "loading" while the record is being fetched; "missing" when the id is not in the dataset. */
  status: "loading" | "ready" | "missing" | "error";
  error?: Error;
  onRetry?: () => void;
  onClose: () => void;
}) {
  const lcoh = project ? calculatorHref(project) : null;
  return (
    <Drawer
      open={!!projectId}
      onClose={onClose}
      width="max-w-xl"
      title={
        project ? (
          <h2 className="text-[22px] leading-tight font-light text-ink">{project.name}</h2>
        ) : (
          <div className="text-[15px] font-semibold text-ink">{status === "loading" ? "Loading project…" : "Project"}</div>
        )
      }
      footer={
        project ? (
          <div className="space-y-2">
            <div className={lcoh ? "grid grid-cols-2 gap-2" : "grid"}>
              <ButtonLink href={projectHref(project.id)} size="lg">
                Open full record
              </ButtonLink>
              {lcoh && (
                <ButtonLink href={lcoh} variant="secondary" size="lg">
                  Model LCOH
                </ButtonLink>
              )}
            </div>
            {!lcoh && <p className="text-[11px] text-faint">LCOH modelling needs a disclosed capacity and an electrolytic technology (PEM, Alkaline, SOEC or AEM).</p>}
          </div>
        ) : undefined
      }
    >
      {status === "error" ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : status === "missing" ? (
        <EmptyState title="Project not found" body={`No record with id “${projectId}” exists in the current dataset. The link may be outdated.`} />
      ) : !project ? (
        <div className="space-y-3" role="status" aria-label="Loading project">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectStatusPill status={project.status} />
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3.5" aria-hidden />
                {project.location.label}, {project.countryName}
              </span>
            </div>
            {project.statusNote && <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{project.statusNote}</p>}
          </div>
          <FactList facts={projectDrawerFacts(project)} />
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">Description</h3>
            <p className="text-[14px] leading-relaxed text-ink-2">{project.description}</p>
          </section>
          <ProvenanceBlock record={project} />
        </div>
      )}
    </Drawer>
  );
}
