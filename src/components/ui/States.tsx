import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-stone", className)} />;
}

export function LoadingRows({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={cn("space-y-2", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line px-6 py-12 text-center">
      <Inbox className="size-6 text-faint" aria-hidden />
      <p className="mt-3 font-medium text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-card border border-bad/30 bg-bad-soft/40 px-6 py-10 text-center">
      <AlertTriangle className="size-6 text-bad" aria-hidden />
      <p className="mt-3 font-medium text-ink">Data could not be loaded</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{error?.message ?? "The data provider returned an error."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw className="size-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}

/** Renders loading / error / empty / success branches of a resource consistently. */
export function ResourceView<T>({
  resource,
  loading,
  empty,
  isEmpty,
  children,
}: {
  resource: { data: T | undefined; status: "loading" | "success" | "error"; error?: Error; refetch: () => void };
  loading?: ReactNode;
  empty?: ReactNode;
  isEmpty?: (d: T) => boolean;
  children: (data: T) => ReactNode;
}) {
  if (resource.status === "error") return <ErrorState error={resource.error} onRetry={resource.refetch} />;
  if (resource.status === "loading" || resource.data === undefined) return <>{loading ?? <LoadingRows />}</>;
  if (isEmpty?.(resource.data)) return <>{empty ?? <EmptyState title="No results" />}</>;
  return <>{children(resource.data)}</>;
}
