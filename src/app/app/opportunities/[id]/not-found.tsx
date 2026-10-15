import { PageBody } from "@/components/app/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function OpportunityNotFound() {
  return (
    <PageBody>
      <EmptyState
        title="Opportunity not found"
        body="This call is not in the current dataset snapshot. It may have been removed or the link is mistyped."
        action={
          <ButtonLink href="/app/opportunities" variant="secondary" size="lg">
            Back to Opportunity Radar
          </ButtonLink>
        }
      />
    </PageBody>
  );
}
