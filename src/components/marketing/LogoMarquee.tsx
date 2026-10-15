/** Data-source logos. Files and their origins: public/logos/SOURCES.md. */
const LOGOS = [
  { src: "/logos/iea.svg", alt: "International Energy Agency", h: 54 },
  { src: "/logos/eho.svg", alt: "European Hydrogen Observatory", h: 54 },
  { src: "/logos/ec.svg", alt: "European Commission", h: 50 },
  { src: "/logos/clean-hydrogen-partnership.svg", alt: "Clean Hydrogen Partnership", h: 68 },
  { src: "/logos/nord-pool.svg", alt: "Nord Pool", h: 50 },
  { src: "/logos/elering.svg", alt: "Elering", h: 42 },
  { src: "/logos/fraunhofer.svg", alt: "Fraunhofer ISE Energy-Charts", h: 48 },
  { src: "/logos/irena.png", alt: "International Renewable Energy Agency", h: 58 },
];

/** Infinite, CSS-only logo marquee. Pauses on hover; static for reduced motion. */
export function LogoMarquee() {
  return (
    <div className="marquee group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="marquee-track flex w-max items-center group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-16 pr-16 md:gap-24 md:pr-24">
            {LOGOS.map((l) => (
              <li key={l.src} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.src}
                  alt={copy === 0 ? l.alt : ""}
                  title={l.alt}
                  style={{ height: l.h }}
                  className="w-auto opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  loading="lazy"
                  draggable={false}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
