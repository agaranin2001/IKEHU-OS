import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LibraryCard, PublisherMark } from "@/components/marketing/LibraryCard";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/Sections";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SourceLink } from "@/components/ui/Sources";
import { VerificationPill } from "@/components/ui/StatusPill";
import { CATEGORY_LABEL, CATEGORY_TOOL, type LibraryArticle, relatedArticles, toArticle } from "@/features/library/library";
import { fmtDate } from "@/lib/format";
import { LIBRARY_CONTENT } from "@/data/library-content";
import { cn } from "@/components/ui/cn";
import { services } from "@/services";

/** Numbered citation links pointing at the article's source list. */
function Cite({ urls, index, className }: { urls: string[]; index: Map<string, number>; className?: string }) {
  const nums = [...new Set(urls.map((u) => index.get(u)).filter((n): n is number => n !== undefined))].sort((x, y) => x - y);
  if (nums.length === 0) return null;
  return (
    <span className={cn("inline-flex gap-1 align-super text-[11px] font-semibold text-violet", className)}>
      {nums.map((n) => (
        <a key={n} href={`#source-${n}`} className="hover:underline" aria-label={`Source ${n}`}>
          [{n}]
        </a>
      ))}
    </span>
  );
}

async function allArticles(): Promise<LibraryArticle[]> {
  return (await services.insights.list()).map(toArticle);
}

export async function generateStaticParams() {
  return (await allArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = (await allArticles()).find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function LibraryArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await allArticles();
  const a = all.find((x) => x.slug === slug);
  if (!a) notFound();
  const tool = CATEGORY_TOOL[a.category];
  const related = relatedArticles(a, all);
  const content = LIBRARY_CONTENT[a.id];
  const sources = [...a.sources, ...(content?.extraSources ?? []).filter((x) => !a.sources.some((s) => s.url === x.url))];
  const sourceIndex = new Map(sources.map((s, i) => [s.url, i + 1]));
  const longDate = (iso: string) => fmtDate(iso, { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient flex flex-col gap-10 rounded-panel px-6 py-14 md:flex-row md:items-end md:justify-between md:px-14 md:py-20">
          <Reveal className="max-w-4xl">
            <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline">
              <ArrowLeft className="size-4" aria-hidden /> R&amp;D Library
            </Link>
            <div className="mt-10 flex flex-wrap gap-2">
              <Badge className="bg-mint-soft! px-3! py-1! text-sm! text-forest!">
                {CATEGORY_LABEL[a.category]}
              </Badge>
              <Badge className="bg-mint-soft! px-3! py-1! text-sm! text-forest!">{a.region}</Badge>
            </div>
            <h1 className="mt-4 text-[34px] leading-[1.1] font-light text-ink md:text-[48px]">{a.title}</h1>
            <div className="mt-6 text-[15px] font-semibold tracking-[0.06em] text-violet uppercase">{longDate(a.publishedAt)}</div>
          </Reveal>
          <PublisherMark publisher={a.publisher} className="shrink-0 self-start md:self-end" />
        </div>
      </section>

      <section className="pt-8 pb-16 md:pt-10 md:pb-24">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16">
          <article className="min-w-0">
            {a.metric && (
              <Reveal>
                <div className="rounded-panel bg-deep p-8 text-cream md:p-10" data-header="dark">
                  <div className="text-xs font-semibold tracking-[0.08em] text-mint uppercase">Headline figure</div>
                  <div className="num mt-4 text-[40px] leading-[1.1] font-light text-white md:text-[56px]">{a.metric.value}</div>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cream/75">{a.metric.label}</p>
                </div>
              </Reveal>
            )}

            {content && content.keyFacts.length > 0 && (
              <Reveal delay={40}>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {content.keyFacts.map((f) => (
                    <div key={f.label} className="flex flex-col rounded-card border border-line-2 bg-paper p-6">
                      <div className="num text-[28px] leading-[1.15] font-light text-ink">{f.value}</div>
                      <p className="mt-2 flex-1 text-[15px] leading-snug text-ink-2">{f.label}</p>
                      <Cite urls={[f.sourceUrl]} index={sourceIndex} className="mt-3" />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal delay={80}>
              <h2 className="mt-14 text-2xl font-light text-ink md:text-[30px]">Summary</h2>
              <p className="mt-5 max-w-[720px] text-lg leading-[1.7] text-ink-2 md:text-xl">{a.summary}</p>
            </Reveal>

            {content?.sections.map((sec) => (
              <Reveal key={sec.heading}>
                <h2 className="mt-14 text-2xl font-light text-ink md:text-[30px]">{sec.heading}</h2>
                <div className="mt-5 max-w-[720px] space-y-5">
                  {sec.paragraphs.map((p) => (
                    <p key={p.text.slice(0, 40)} className="text-[17px] leading-[1.7] text-ink-2">
                      {p.text} <Cite urls={p.sourceUrls} index={sourceIndex} />
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}

            {a.notes && (
              <Reveal delay={120}>
                <h2 className="mt-14 text-2xl font-light text-ink md:text-[30px]">Notes &amp; caveats</h2>
                <p className="mt-5 max-w-[720px] border-l-2 border-violet pl-5 text-[17px] leading-[1.7] text-ink-2">{a.notes}</p>
              </Reveal>
            )}

            <Reveal delay={160}>
              <h2 className="mt-14 text-2xl font-light text-ink md:text-[30px]">Sources</h2>
              <ol className="mt-5 max-w-[720px] space-y-1 rounded-card border border-line-2 bg-paper p-4">
                {sources.map((s, i) => (
                  <li key={s.url} id={`source-${i + 1}`} className="flex scroll-mt-28 gap-3">
                    <span className="num mt-2 w-5 shrink-0 text-right text-xs font-semibold text-violet">{i + 1}</span>
                    <SourceLink source={s} className="flex-1" />
                  </li>
                ))}
              </ol>
            </Reveal>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line-2 bg-paper p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-forest" aria-hidden />
                <span className="text-sm font-semibold text-ink">Record details</span>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                {(
                  [
                    ["Publisher", a.publisher],
                    ["Published", longDate(a.publishedAt)],
                    ["Region", a.region],
                    ["Topic", CATEGORY_LABEL[a.category]],
                    ["Confidence", a.confidence],
                    ["Last verified", longDate(a.verifiedAt)],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}</dt>
                    <dd className="max-w-[60%] text-right text-ink first-letter:uppercase">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Status</dt>
                  <dd>
                    <VerificationPill status={a.verification} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="hero-gradient rounded-card p-6">
              <div className="eyebrow">Put it to work</div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{tool.body}</p>
              <ButtonLink href={tool.href} className="mt-5 w-full">
                {tool.label} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-24 md:pb-32">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="text-[30px] leading-[1.1] font-light text-ink md:text-[40px]">More from the library</h2>
              <ButtonLink href="/library" variant="secondary" size="lg">
                View all
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r, k) => (
                <Reveal key={r.id} delay={k * 60} className="h-full">
                  <LibraryCard article={r} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
      <div className="h-10" />
    </>
  );
}
