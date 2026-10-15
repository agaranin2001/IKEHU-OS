"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, materials } from "../kit";
import { addMesh, pop, span } from "../stage";
import { useScene } from "../useScene";

/** Hydrogen Economics: cost components stack into a waterfall, then the LCOH total rises and a coin spins on top. */
export function WaterfallScene() {
  const ref = useScene({ view: [8, 6.4], target: [0.2, 1.6, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();
    m.outlined(addMesh(new RoundedBoxGeometry(7, 0.3, 2.6, 3, 0.1), m.ink, scene, [0.2, 0.15, 0]), false);

    const parts = [
      { h: 1.7, c: P.forest },
      { h: 1.25, c: P.violet },
      { h: 0.5, c: P.amber },
      { h: 0.3, c: P.sky },
      { h: 0.22, c: P.teal },
    ];
    const total = parts.reduce((a, p) => a + p.h, 0);
    let base = 0.3;
    const blocks = parts.map((p, i) => {
      const g = new RoundedBoxGeometry(0.78, p.h, 1.3, 3, 0.06);
      g.translate(0, p.h / 2, 0);
      const mesh = m.outlined(addMesh(g, m.glow(p.c, 0.18), scene, [-2.6 + i * 1.02, base, 0]), false);
      const y0 = base;
      base += p.h;
      return { mesh, top: y0 + p.h };
    });

    const tg = new RoundedBoxGeometry(0.95, total, 1.3, 3, 0.06);
    tg.translate(0, total / 2, 0);
    const totalBar = m.outlined(addMesh(tg, m.ink, scene, [2.65, 0.3, 0]), false);
    const capMat = m.glow(P.mint, 0.6);
    const cap = addMesh(new RoundedBoxGeometry(0.97, 0.08, 1.32, 2, 0.03), capMat, scene, [2.65, 0.3 + total, 0]);

    // Dashed connectors between block tops.
    const dash = new THREE.LineDashedMaterial({ color: P.cream, dashSize: 0.08, gapSize: 0.07 });
    const connectors = blocks.map((b, i) => {
      const x0 = -2.6 + i * 1.02 + 0.39;
      const x1 = i < blocks.length - 1 ? x0 + 0.24 : 2.65 - 0.47;
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0, b.top, 0.66), new THREE.Vector3(x1, b.top, 0.66)]);
      const l = new THREE.Line(geo, dash);
      l.computeLineDistances();
      scene.add(l);
      return l;
    });

    const coin = new THREE.Group();
    scene.add(coin);
    const coinMesh = m.outlined(addMesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 40), m.glow(P.mint, 0.35), coin));
    coinMesh.rotation.x = Math.PI / 2;
    addMesh(new THREE.TorusGeometry(0.22, 0.025, 8, 32), m.cream, coin, [0, 0, 0.06]);

    return (t) => {
      blocks.forEach(({ mesh }, i) => {
        mesh.scale.y = Math.max(0.001, span(t, 0.2 + i * 0.32, 0.75 + i * 0.32));
      });
      connectors.forEach((l, i) => (l.visible = t > 0.7 + i * 0.32));
      const grow = Math.max(0.001, span(t, 1.9, 2.7));
      totalBar.scale.y = grow;
      cap.position.y = 0.3 + total * grow;
      capMat.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.2) ** 2;
      const c = pop(t, 2.6, 3.2);
      coin.scale.setScalar(Math.max(0.001, c));
      coin.position.set(2.65, 0.3 + total * grow + 0.6 + 0.08 * Math.sin(t * 2), 0);
      coin.rotation.y = t * 1.6;
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
