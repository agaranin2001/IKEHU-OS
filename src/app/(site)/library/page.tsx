import type { Metadata } from "next";
import { LibraryCard } from "@/components/marketing/LibraryCard";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/Sections";
import { sortArticles, toArticle } from "@/features/library/library";
import { services } from "@/services";

export const metadata: Metadata = {
  title: "R&D Library",
  description: "Findings from the public reports behind the platform — summarised, dated and linked to their sources.",
};

export default async function LibraryPage() {
  const articles = sortArticles((await services.insights.list()).map(toArticle));

  return (
    <>
      <section className="container-site pt-2">
        <div className="hero-gradient rounded-panel px-6 py-16 md:px-14 md:py-24">
          <Reveal className="max-w-3xl">
            <div className="eyebrow">R&amp;D Library</div>
            <h1 className="mt-4 text-[38px] leading-[1.08] font-light text-ink md:text-[52px]">IKEHU R&amp;D Library</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              Findings from the public reports behind the platform — summarised, dated and linked to their sources. {articles.length} articles.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pt-8 pb-16 md:pt-10 md:pb-24">
        <div className="container-site grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, k) => (
            <Reveal key={a.id} delay={(k % 3) * 60} className="h-full">
              <LibraryCard article={a} />
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
      <div className="h-10" />
    </>
  );
}
