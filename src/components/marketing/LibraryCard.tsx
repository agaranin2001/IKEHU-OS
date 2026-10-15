/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { CATEGORY_LABEL, type LibraryArticle, libraryHref, publisherMark } from "@/features/library/library";
import { fmtDate } from "@/lib/format";

/** Publisher logo, or a wordmark for publishers without one on file. */
export function PublisherMark({ publisher, className }: { publisher: string; className?: string }) {
  const m = publisherMark(publisher);
  if (m.kind === "logo") return <img src={m.src} alt={publisher} width={m.width} height={m.height} className={cn("h-10 w-auto", className)} />;
  return <span className={cn("block text-[22px] leading-10 font-bold tracking-tight text-ink", className)}>{m.text}</span>;
}

/**
 * R&D Library card (reference: integratedbio.com): topic badge and date, title,
 * "Read article", and the action seated in a notched corner.
 */
export function LibraryCard({ article }: { article: LibraryArticle }) {
  return (
    <Link href={libraryHref(article)} className="group relative block h-full">
      <div className="notched flex h-full min-h-[300px] flex-col rounded-card bg-paper p-8 transition-colors duration-300 group-hover:bg-paper-2">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2.5 rounded-btn bg-paper-2 px-3 py-1.5 text-[13px] font-medium tracking-[0.08em] text-ink uppercase">
            <span aria-hidden className="size-2.5 bg-forest" />
            {CATEGORY_LABEL[article.category]}
          </span>
          <span className="text-[13px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
            {fmtDate(article.publishedAt, { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <h3 className="mt-7 max-w-[460px] text-[22px] leading-[1.3] text-ink">{article.title}</h3>
        <div className="mt-auto pt-10 text-[13px] font-medium tracking-[0.08em] text-forest uppercase">Read article</div>
      </div>
      <span className="notch-btn" aria-hidden>
        <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
