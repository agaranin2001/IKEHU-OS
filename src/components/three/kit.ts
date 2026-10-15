import * as THREE from "three";
import { createOutliner } from "./stage";

/** IKEHU palette for the 3D module scenes. */
export const P = {
  ink: 0x0f2c24,
  inset: 0x173d33,
  cream: 0xf9f3e8,
  mint: 0x0fff87,
  forest: 0x16825f,
  // Accent slots, all in the green brand family.
  violet: 0x12b76a,
  sky: 0x7fd8b0,
  amber: 0x0b8f6a,
  teal: 0x5fbf94,
};

export const OUTLINE = 0.028;

/** Materials shared by every scene: glossy ink bodies, cream details, glowing accents. */
export function materials() {
  const ink = new THREE.MeshPhysicalMaterial({ color: P.ink, metalness: 0.15, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const inset = new THREE.MeshStandardMaterial({ color: P.inset, roughness: 0.7 });
  const cream = new THREE.MeshStandardMaterial({ color: P.cream, roughness: 0.5 });
  const glow = (color: number, intensity = 0.5) =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.35 });
  const mint = glow(P.mint, 0.55);
  const outlined = createOutliner(P.cream, OUTLINE);
  const line = new THREE.LineBasicMaterial({ color: P.cream });
  return { ink, inset, cream, glow, mint, outlined, line };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
