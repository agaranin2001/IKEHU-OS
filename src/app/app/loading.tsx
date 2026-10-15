import { Skeleton } from "@/components/ui/States";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-4 px-4 py-8 md:px-8">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-5 w-[32rem] max-w-full" />
      <div className="grid gap-4 pt-4 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
