import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { FOUNDERS, type Founder } from "@/config/founders";
import { Reveal } from "./Reveal";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

function Portrait({ f }: { f: Founder }) {
  return (
    <div className="relative aspect-[1.38] overflow-hidden rounded-[12px] bg-deep">
      {f.photo ? (
        <Image src={f.photo} alt={f.name} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover object-[50%_28%]" />
      ) : (
        <div className="dark-gradient absolute inset-0">
          <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_45%,black,transparent)]" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[72px] leading-none font-light tracking-[-0.03em] text-cream/90 md:text-[88px]" aria-hidden>
              {initials(f.name)}
            </span>
          </div>
        </div>
      )}
      {f.profile && (
        <span aria-hidden className="absolute right-4 bottom-4 grid size-10 place-items-center rounded-[8px] bg-ink text-white">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
          </svg>
        </span>
      )}
    </div>
  );
}

/**
 * Founders of Rand Hydrogen (reference: integratedbio.com/company): a tagged
 * intro on the left and white cards with an inset portrait, name, mono role
 * and — when a profile link exists — "View profile" seated in a notched corner.
 */
export function FoundersSection() {
  return (
    <section id="founders" className="scroll-mt-24 pb-24 md:pb-32">
      <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-8">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex items-center gap-2.5 rounded-btn bg-paper px-3 py-1.5 font-mono text-[13px] tracking-[0.08em] text-ink uppercase">
            <span aria-hidden className="size-2.5 bg-forest" />
            Founders
          </span>
          <p className="mt-10 max-w-[480px] text-[24px] leading-[1.35] font-light tracking-[-0.01em] text-ink-2 md:text-[26px]">
            IKEHU OS is built by the team behind Rand Hydrogen — engineering, procuring and delivering green hydrogen production in Estonia and beyond.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {FOUNDERS.map((f, i) => {
            const body = (
              <>
                <div className={`${f.profile ? "notched" : ""} flex h-full flex-col rounded-card bg-paper p-2 transition-colors duration-300 ${f.profile ? "group-hover:bg-paper-2" : ""}`}>
                  <Portrait f={f} />
                  <div className="px-5 pt-8 pb-6">
                    <div className="text-[30px] leading-tight font-light tracking-[-0.015em] text-ink">{f.name}</div>
                    <div className="mt-2 font-mono text-[14px] tracking-[0.04em] text-muted uppercase">{f.role}</div>
                  </div>
                  {f.profile && <div className="mt-auto px-5 pt-6 pb-5 font-mono text-[14px] tracking-[0.06em] text-ink uppercase">View profile</div>}
                </div>
                {f.profile && (
                  <span className="notch-btn" aria-hidden>
                    <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                )}
              </>
            );
            return (
              <Reveal key={f.name} delay={i * 80} className="h-full">
                {f.profile ? (
                  <a href={f.profile} target="_blank" rel="noopener noreferrer" className="group relative block h-full" aria-label={`${f.name} — view profile`}>
                    {body}
                  </a>
                ) : (
                  <div className="relative h-full">{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
