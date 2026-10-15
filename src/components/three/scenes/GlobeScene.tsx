"use client";

import * as THREE from "three";
import { P, materials } from "../kit";
import { addMesh, pop, span } from "../stage";
import { useScene } from "../useScene";

/** Market Intelligence: a slowly turning globe on a plinth; project pins pop up and pulse. */
export function GlobeScene() {
  const ref = useScene({ view: [7.2, 6.2], target: [0, 1.4, 0], groundY: 0, shadowOpacity: 0.22 }, ({ scene }) => {
    const m = materials();

    m.outlined(addMesh(new THREE.CylinderGeometry(2.7, 2.9, 0.4, 64), m.ink, scene, [0, 0.2, 0]));
    const rim = addMesh(new THREE.TorusGeometry(2.45, 0.03, 8, 96), m.mint, scene, [0, 0.41, 0]);
    rim.rotation.x = Math.PI / 2;

    // Expanding pulse rings on the plinth.
    const pulses = [0, 1, 2].map(() => {
      const mat = new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 96), mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.42;
      scene.add(ring);
      return { ring, mat };
    });

    const globe = new THREE.Group();
    globe.position.y = 2.1;
    scene.add(globe);
    m.outlined(addMesh(new THREE.SphereGeometry(1.55, 64, 48), m.ink, globe), false);
    for (const lat of [-50, -25, 0, 25, 50]) {
      const r = Math.cos((lat * Math.PI) / 180) * 1.56;
      const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 96), m.cream);
      t.rotation.x = Math.PI / 2;
      t.position.y = Math.sin((lat * Math.PI) / 180) * 1.56;
      globe.add(t);
    }
    for (let k = 0; k < 6; k++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.012, 6, 96), m.cream);
      t.rotation.y = (k * Math.PI) / 6;
      globe.add(t);
    }

    // Pins: stem + glowing head, oriented along the surface normal.
    const spots: [number, number, number][] = [
      [58, 10, P.forest],
      [52, 25, P.violet],
      [25, 45, P.mint],
      [20, 80, P.sky],
      [-22, 130, P.amber],
      [36, -95, P.forest],
      [-30, -60, P.violet],
      [10, 170, P.sky],
    ];
    const pins = spots.map(([lat, lon, color]) => {
      const pin = new THREE.Group();
      const phi = (lat * Math.PI) / 180;
      const th = (lon * Math.PI) / 180;
      const n = new THREE.Vector3(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th));
      pin.position.copy(n).multiplyScalar(1.55);
      pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      const head = m.glow(color, 0.6);
      addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), m.cream, pin, [0, 0.21, 0]);
      addMesh(new THREE.SphereGeometry(0.11, 20, 16), head, pin, [0, 0.46, 0]);
      globe.add(pin);
      return { pin, head };
    });

    return (t) => {
      globe.rotation.y = t * 0.22;
      globe.position.y = 2.1 + 0.05 * Math.sin(t * 1.2);
      const enter = span(t, 0, 0.8);
      globe.scale.setScalar(0.6 + 0.4 * enter);
      pins.forEach(({ pin, head }, i) => {
        pin.scale.setScalar(pop(t, 0.6 + i * 0.18, 1.1 + i * 0.18));
        head.emissiveIntensity = 0.5 + 0.6 * Math.max(0, Math.sin(t * 2.4 - i));
      });
      pulses.forEach(({ ring, mat }, i) => {
        const k = ((t * 0.45 + i / 3) % 1 + 1) % 1;
        ring.scale.setScalar(0.6 + k * 2.1);
        mat.opacity = 0.55 * (1 - k) * span(t, 0.5, 1.2);
      });
    };
  });
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
