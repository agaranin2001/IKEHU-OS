import { PageBody } from "@/components/app/AppShell";
import { LoadingRows, Skeleton } from "@/components/ui/States";

export default function ProfileLoading() {
  return (
    <>
      <div className="border-b border-line-2">
        <div className="mx-auto max-w-[1480px] px-4 pt-8 pb-5 md:px-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-9 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-48" />
        </div>
      </div>
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <LoadingRows rows={8} />
          <LoadingRows rows={5} />
        </div>
      </PageBody>
    </>
  );
}
