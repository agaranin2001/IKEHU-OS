import Image from "next/image";

/** Plant photograph (Rand Hydrogen) for the problem section. */
export function ProblemVisual() {
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-card lg:aspect-auto lg:h-full lg:min-h-[480px]">
      <Image src="/images/rand/storage.jpg" alt="Hydrogen storage and electrolysis plant with wind turbines" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[60%_50%]" />
    </div>
  );
}
