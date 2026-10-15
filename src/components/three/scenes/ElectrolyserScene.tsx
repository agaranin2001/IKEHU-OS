"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { P, materials } from "../kit";
import { addMesh, pop, span } from "../stage";
import { useScene } from "../useScene";

/** Project & Technology: solar power pulses into an electrolyser stack; hydrogen bubbles travel to a storage tank. */
export function ElectrolyserScene() {
  const ref = useScene({ view: [8.4, 6.4], target: [0, 1.3, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();
    m.outlined(addMesh(new RoundedBoxGeometry(7.6, 0.25, 3, 3, 0.1), m.ink, scene, [0, 0.125, 0]), false);

    // Solar panel on a post.
    const panel = new THREE.Group();
    panel.position.set(-2.9, 0.25, -0.2);
    scene.add(panel);
    m.outlined(addMesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12), m.ink, panel, [0, 0.55, 0]));
    const face = m.outlined(addMesh(new RoundedBoxGeometry(1.5, 0.08, 1.1, 2, 0.03), m.glow(P.sky, 0.25), panel, [0, 1.15, 0]), false);
    face.rotation.z = 0.45;
    for (let i = -1; i <= 1; i++) addMesh(new THREE.BoxGeometry(0.02, 0.09, 1.08), m.cream, face, [i * 0.38, 0.005, 0]);

    // Electrolyser container with a stack of cells on top.
    const box = m.outlined(addMesh(new RoundedBoxGeometry(2.3, 1.3, 1.5, 3, 0.1), m.ink, scene, [-0.3, 0.9, 0]), false);
    void box;
    addMesh(new RoundedBoxGeometry(1.2, 0.5, 0.04, 2, 0.04), m.inset, scene, [-0.55, 0.95, 0.76]);
    const leds = [0, 1, 2].map((i) => addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), m.glow(P.mint, 0.3), scene, [0.4 + i * 0.2, 1.25, 0.76]));
    leds.forEach((l) => (l.rotation.x = Math.PI / 2));
    const cells = Array.from({ length: 7 }, (_, i) =>
      m.outlined(addMesh(new RoundedBoxGeometry(1.7, 0.1, 1.1, 2, 0.03), i % 2 ? m.cream : m.glow(P.forest, 0.25), scene, [-0.3, 1.62 + i * 0.12, 0]), false),
    );

    // Cable from the panel and pipe to the tank.
    const cablePath = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.9, 0.3, 0.6), new THREE.Vector3(-2.2, 0.3, 0.9), new THREE.Vector3(-1.45, 0.3, 0.6)]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 24, 0.035, 8), m.cream));
    const spark = addMesh(new THREE.SphereGeometry(0.09, 16, 12), m.mint, scene);

    const pipePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.85, 0.9, 0),
      new THREE.Vector3(1.55, 0.9, 0),
      new THREE.Vector3(1.9, 1.2, 0),
      new THREE.Vector3(2.3, 1.2, 0),
    ]);
    m.outlined(addMesh(new THREE.TubeGeometry(pipePath, 32, 0.11, 12), m.ink, scene), false);

    // Storage tank.
    const tank = m.outlined(addMesh(new THREE.CapsuleGeometry(0.62, 1.5, 8, 32), m.cream, scene, [2.75, 1.6, 0]), false);
    void tank;
    const band = addMesh(new THREE.TorusGeometry(0.63, 0.04, 8, 48), m.glow(P.mint, 0.5), scene, [2.75, 1.6, 0]);
    band.rotation.x = Math.PI / 2;

    const bubbleMat = m.glow(P.mint, 0.8);
    const bubbles = Array.from({ length: 6 }, () => addMesh(new THREE.SphereGeometry(0.075, 14, 10), bubbleMat, scene));

    return (t) => {
      cells.forEach((c, i) => c.scale.setScalar(Math.max(0.001, pop(t, 0.2 + i * 0.12, 0.6 + i * 0.12))));
      const k = (t * 0.7) % 1;
      spark.position.copy(cablePath.getPoint(k));
      spark.visible = t > 0.6;
      leds.forEach((l, i) => ((l.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.floor(t * 3) % 3 === i ? 1.4 : 0.25));
      bubbles.forEach((b, i) => {
        const u = (t * 0.35 + i / bubbles.length) % 1;
        if (u < 0.75) {
          b.position.copy(pipePath.getPoint(u / 0.75));
          b.position.y += 0.16;
        } else {
          const v = (u - 0.75) / 0.25;
          b.position.set(2.75 + 0.15 * Math.sin(i), 1.0 + v * 1.4, 0.2);
        }
        b.scale.setScalar(span(t, 1.2, 1.6) * (0.8 + 0.3 * Math.sin(t * 4 + i)));
      });
      band.position.y = 1.6 + 0.5 * Math.sin(t * 0.8);
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
