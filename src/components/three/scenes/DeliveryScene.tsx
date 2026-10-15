"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, materials } from "../kit";
import { addMesh, pop, span } from "../stage";
import { useScene } from "../useScene";

/** Engineering & Project Delivery: Gantt bars slide into place on a plan board while a milestone marker walks the timeline. */
export function DeliveryScene() {
  const ref = useScene({ view: [8.2, 6.2], target: [0, 1, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();
    m.outlined(addMesh(new RoundedBoxGeometry(7, 0.3, 3.6, 3, 0.1), m.ink, scene, [0, 0.15, 0]), false);
    // Grid lines across the board.
    for (let i = 0; i < 7; i++) addMesh(new THREE.BoxGeometry(0.015, 0.01, 3.3), m.inset, scene, [-3 + i, 0.31, 0]);

    const rows = [
      { z: -1.2, x: -2.9, len: 1.8, c: P.forest },
      { z: -0.55, x: -1.6, len: 2.1, c: P.violet },
      { z: 0.1, x: -0.2, len: 1.6, c: P.sky },
      { z: 0.75, x: 0.9, len: 2.0, c: P.amber },
    ];
    const bars = rows.map((r, i) => {
      const g = new RoundedBoxGeometry(r.len, 0.26, 0.42, 3, 0.08);
      g.translate(r.len / 2, 0, 0);
      const b = m.outlined(addMesh(g, m.glow(r.c, 0.2), scene, [r.x, 0.45, r.z]), false);
      return { b, delay: 0.2 + i * 0.3 };
    });

    // Timeline track along the front edge.
    m.outlined(addMesh(new RoundedBoxGeometry(6.4, 0.06, 0.12, 2, 0.03), m.cream, scene, [0, 0.34, 1.5]), false);
    const flags = [-2.4, -0.6, 1.4].map((x, i) => {
      const f = new THREE.Group();
      f.position.set(x, 0.34, 1.5);
      scene.add(f);
      addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), m.cream, f, [0, 0.35, 0]);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.38, -0.12);
      shape.lineTo(0, -0.24);
      const flag = addMesh(new THREE.ShapeGeometry(shape), m.glow(i === 2 ? P.amber : P.forest, 0.35), f, [0.02, 0.7, 0]);
      flag.material.side = THREE.DoubleSide;
      return f;
    });
    const markerMat = m.glow(P.mint, 0.8);
    const marker = m.outlined(addMesh(new THREE.OctahedronGeometry(0.22), markerMat, scene), false);
    const today = addMesh(new THREE.BoxGeometry(0.02, 0.02, 3.3), m.mint, scene);

    return (t) => {
      bars.forEach(({ b, delay }) => {
        const k = span(t, delay, delay + 0.6);
        b.scale.x = Math.max(0.001, k);
        b.visible = k > 0;
      });
      flags.forEach((f, i) => f.scale.setScalar(Math.max(0.001, pop(t, 1.3 + i * 0.2, 1.7 + i * 0.2))));
      const x = -3 + ((t * 0.5) % 6);
      marker.position.set(x, 0.75 + 0.08 * Math.sin(t * 3), 1.5);
      marker.rotation.y = t * 1.5;
      markerMat.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3) ** 2;
      today.position.set(x, 0.32, 0);
      today.visible = t > 1;
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
