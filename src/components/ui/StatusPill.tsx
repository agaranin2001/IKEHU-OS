import type { OpportunityStatus, ProjectStatus, VerificationStatus } from "@/domain/types";
import { OPPORTUNITY_STATUS, PROJECT_STATUS, VERIFICATION } from "@/lib/labels";
import { Badge } from "./Badge";

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function OpportunityStatusPill({ status }: { status: OpportunityStatus }) {
  const s = OPPORTUNITY_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function VerificationPill({ status, className }: { status: VerificationStatus; className?: string }) {
  const v = VERIFICATION[status];
  return (
    <span title={v.help}>
      <Badge tone={v.tone} className={className} dot>
        {v.label}
      </Badge>
    </span>
  );
}
