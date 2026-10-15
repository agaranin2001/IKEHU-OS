"use client";

import dynamic from "next/dynamic";
import type { ModuleSlug } from "@/config/navigation";

// Three.js is heavy and browser-only, so each scene loads on demand.
const SCENES: Record<ModuleSlug, React.ComponentType> = {
  "market-intelligence": dynamic(() => import("./scenes/GlobeScene").then((m) => m.GlobeScene), { ssr: false }),
  "hydrogen-economics": dynamic(() => import("./scenes/WaterfallScene").then((m) => m.WaterfallScene), { ssr: false }),
  "project-intelligence": dynamic(() => import("./scenes/ElectrolyserScene").then((m) => m.ElectrolyserScene), { ssr: false }),
  procurement: dynamic(() => import("./scenes/RadarScene").then((m) => m.RadarScene), { ssr: false }),
  investment: dynamic(() => import("./scenes/InvestmentScene").then((m) => m.InvestmentScene), { ssr: false }),
  "project-delivery": dynamic(() => import("./scenes/DeliveryScene").then((m) => m.DeliveryScene), { ssr: false }),
};

/** The animated 3D scene for a platform module. */
export function ModuleScene({ slug }: { slug: ModuleSlug }) {
  const Scene = SCENES[slug];
  return <Scene />;
}
