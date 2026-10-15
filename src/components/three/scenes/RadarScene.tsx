"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, materials } from "../kit";
import { addMesh, pop } from "../stage";
import { useScene } from "../useScene";

/** Procurement & Tenders: a radar sweeps for opportunities; tender documents fan out and get a check mark. */
export function RadarScene() {
  const ref = useScene({ view: [8, 6.4], target: [0.3, 1.3, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();
    m.outlined(addMesh(new THREE.CylinderGeometry(2.3, 2.45, 0.3, 64), m.ink, scene, [-0.9, 0.15, 0.4]));
    for (const r of [0.7, 1.35, 2.0]) {
      const ring = addMesh(new THREE.TorusGeometry(r, 0.015, 6, 96), m.cream, scene, [-0.9, 0.31, 0.4]);
      ring.rotation.x = Math.PI / 2;
    }
    const sweepMat = new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0.32, side: THREE.DoubleSide });
    const sweep = new THREE.Mesh(new THREE.CircleGeometry(2.1, 40, 0, 0.8), sweepMat);
    sweep.rotation.x = -Math.PI / 2;
    sweep.position.set(-0.9, 0.32, 0.4);
    scene.add(sweep);

    const blips = [
      [0.9, 0.6],
      [1.6, 2.4],
      [1.2, 4.1],
      [1.8, 5.3],
    ].map(([r, a]) => {
      const mat = m.glow(P.mint, 0.4);
      const b = addMesh(new THREE.SphereGeometry(0.1, 16, 12), mat, scene, [-0.9 + r * Math.cos(a), 0.42, 0.4 - r * Math.sin(a)]);
      return { b, a, mat };
    });

    // Fanned tender documents.
    const docs = [0, 1, 2].map((i) => {
      const g = new THREE.Group();
      g.position.set(2.0 + i * 0.25, 1.4 + i * 0.12, -0.6 + i * 0.35);
      g.rotation.y = -0.25 + i * 0.12;
      scene.add(g);
      m.outlined(addMesh(new RoundedBoxGeometry(1.3, 1.7, 0.06, 2, 0.05), m.cream, g), false);
      for (let k = 0; k < 4; k++) addMesh(new RoundedBoxGeometry(k === 0 ? 0.7 : 0.95, 0.07, 0.02, 2, 0.03), k === 0 ? m.ink : m.inset, g, [-0.08 + (k === 0 ? -0.1 : 0), 0.55 - k * 0.22, 0.04]);
      return g;
    });

    const badge = new THREE.Group();
    scene.add(badge);
    const disc = m.outlined(addMesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 40), m.glow(P.mint, 0.6), badge));
    disc.rotation.x = Math.PI / 2;
    const tick = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.15, 0, 0.06), new THREE.Vector3(-0.04, -0.11, 0.06), new THREE.Vector3(0.17, 0.12, 0.06)], false, "catmullrom", 0);
    badge.add(new THREE.Mesh(new THREE.TubeGeometry(tick, 12, 0.03, 6), new THREE.MeshBasicMaterial({ color: P.ink })));

    return (t) => {
      const ang = t * 1.4;
      sweep.rotation.z = ang;
      blips.forEach(({ b, a, mat }, i) => {
        const diff = (((ang - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        mat.emissiveIntensity = 0.2 + 1.6 * Math.max(0, 1 - diff / 1.6);
        b.scale.setScalar(Math.max(0.001, pop(t, 0.4 + i * 0.2, 0.8 + i * 0.2)) * (1 + 0.4 * Math.max(0, 1 - diff / 0.8)));
      });
      docs.forEach((g, i) => {
        g.scale.setScalar(Math.max(0.001, pop(t, 0.6 + i * 0.22, 1.1 + i * 0.22)));
        g.position.y = 1.4 + i * 0.12 + 0.06 * Math.sin(t * 1.4 + i);
      });
      badge.scale.setScalar(Math.max(0.001, pop(t, 1.8, 2.3)));
      badge.position.set(2.85, 2.35 + 0.06 * Math.sin(t * 1.4 + 2), 0.2);
      badge.rotation.y = -0.15 + 0.12 * Math.sin(t);
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
