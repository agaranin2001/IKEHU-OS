"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, materials } from "../kit";
import { addMesh, span } from "../stage";
import { useScene } from "../useScene";

/** Investment & M&A: coins drop into growing stacks beside a turning allocation pie. */
export function InvestmentScene() {
  const ref = useScene({ view: [8, 6.4], target: [0, 1.3, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();
    m.outlined(addMesh(new RoundedBoxGeometry(7.2, 0.25, 3.2, 3, 0.1), m.ink, scene, [0, 0.125, 0]), false);

    const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.13, 40);
    const coinMat = m.glow(P.forest, 0.2);
    const stacks = [
      { x: -2.6, n: 5 },
      { x: -1.6, n: 9 },
      { x: -0.6, n: 13 },
    ].map(({ x, n }, s) =>
      Array.from({ length: n }, (_, i) => {
        const c = m.outlined(addMesh(coinGeo, i === n - 1 ? m.glow(P.mint, 0.45) : coinMat, scene, [x, 0.32 + i * 0.145, 0.3]));
        return { c, x, y: 0.32 + i * 0.145, delay: 0.2 + s * 0.35 + i * 0.07 };
      }),
    );

    const pie = new THREE.Group();
    pie.position.set(1.9, 0.5, -0.2);
    scene.add(pie);
    const slices = [
      { a: 0, l: 2.4, c: P.violet },
      { a: 2.4, l: 1.9, c: P.sky },
      { a: 4.3, l: 1.98, c: P.amber },
    ].map(({ a, l, c }) => {
      const g = new THREE.Group();
      pie.add(g);
      m.outlined(addMesh(new THREE.CylinderGeometry(1.35, 1.35, 0.32, 48, 1, false, a, l), m.glow(c, 0.22), g), false);
      return { g, mid: a + l / 2 };
    });

    return (t) => {
      stacks.flat().forEach(({ c, y, delay }) => {
        const k = span(t, delay, delay + 0.35);
        c.visible = k > 0;
        c.position.y = y + (1 - k) * 1.6;
      });
      pie.rotation.y = t * 0.35;
      pie.scale.setScalar(Math.max(0.001, span(t, 0.3, 1)));
      slices.forEach(({ g, mid }, i) => {
        const lift = i === Math.floor(t / 2) % 3 ? 0.25 : 0;
        const cur = g.position.length();
        const next = cur + (lift - cur) * 0.08;
        g.position.set(Math.sin(mid) * next, next * 0.6, Math.cos(mid) * next);
      });
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
