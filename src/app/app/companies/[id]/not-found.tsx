import { PageBody, PageHeader } from "@/components/app/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function ProfileNotFound() {
  return (
    <>
      <PageHeader title="Profile not found" />
      <PageBody>
        <EmptyState
          title="No company or investor with this id"
          body="The record may have been renamed or removed in a newer dataset version."
          action={
            <ButtonLink href="/app/companies" variant="secondary" size="lg">
              Back to Companies & Investors
            </ButtonLink>
          }
        />
      </PageBody>
    </>
  );
}
