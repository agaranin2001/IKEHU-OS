"use client";

import { ErrorState } from "@/components/ui/States";

export default function PlatformError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState error={error} onRetry={reset} />
    </div>
  );
}
