import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Reveal } from "./Reveal";

/** Centered section heading in the reference's light-weight display style. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Reveal className={cn(align === "center" ? "mx-auto max-w-[760px] text-center" : "max-w-[680px]", className)}>
      {eyebrow && <div className={cn("eyebrow mb-4", tone === "dark" && "text-mint")}>{eyebrow}</div>}
      <h2 className={cn("text-[34px] leading-[1.1] font-light tracking-[-0.015em] md:text-h2", tone === "dark" ? "text-white" : "text-ink")}>{title}</h2>
      {body && <p className={cn("mt-5 text-[17px] leading-[1.6] md:text-lg", tone === "dark" ? "text-cream/75" : "text-ink-2")}>{body}</p>}
    </Reveal>
  );
}

/** Card on dark sections: icon tile top-left, arrow circle top-right. */
export function DarkFeatureCard({ icon, title, body, href, badge }: { icon: ReactNode; title: string; body: string; href: string; badge?: string }) {
  return (
    <Link href={href} className="group flex h-full flex-col rounded-card border border-cream/10 bg-deep-2 p-6 transition-colors duration-300 hover:border-cream/25 hover:bg-[#164336]">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-btn bg-mint-soft text-forest">{icon}</span>
        <span className="grid size-8 place-items-center rounded-full border border-cream/20 text-cream transition-all duration-300 group-hover:border-mint group-hover:bg-mint group-hover:text-deep">
          <ArrowRight className="size-4" />
        </span>
      </div>
      <div className="mt-10 flex items-center gap-2">
        <h3 className="text-xl font-medium text-white">{title}</h3>
        {badge && <span className="rounded bg-cream/10 px-1.5 py-px text-[10px] font-semibold tracking-wide text-cream/70 uppercase">{badge}</span>}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{body}</p>
    </Link>
  );
}

/** Closing call-to-action band. */
export function CtaBand({ title = "Start with the numbers.", body }: { title?: string; body?: string }) {
  return (
    <section className="container-site py-10">
      <div className="relative overflow-hidden rounded-panel bg-deep px-6 py-16 text-center md:px-16 md:py-24" data-header="dark">
        <Image src="/images/rand/hero-background.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_50%,rgb(11_44_36/0.7),transparent),linear-gradient(180deg,rgb(11_44_36/0.2)_0%,rgb(11_44_36/0.5)_45%,rgb(11_44_36/0.95)_100%)]" />
        <div className="relative">
          <h2 className="text-[36px] leading-[1.1] font-light text-white md:text-h2">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white">
            {body ?? "Run a cost estimate, explore the project database, or walk through the platform with our team."}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/app" variant="mint" size="lg">
              Explore the platform
            </ButtonLink>
            <ButtonLink href="/calculator" variant="outline-light" size="lg">
              Calculate hydrogen cost
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TextLink({ href, children, tone = "light" }: { href: string; children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2 text-[15px] font-bold", tone === "dark" ? "text-mint" : "text-forest")}>
      {children}
      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
