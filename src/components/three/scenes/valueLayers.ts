import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { addMesh } from "../stage";
import { createLayerTools, G, TILE_SLOTS, type LayerKit, type LayerTools } from "./layerKit";

/**
 * Layers 2–6 in the Market Intelligence style: a central framed panel with
 * the step's key visual and six value-chain tiles (two rows of three) with
 * mini scenes, trees and badges. Each builder returns its per-frame tick.
 */

const [T1, T2, T3] = TILE_SLOTS.top;
const [B1, B2, B3] = TILE_SLOTS.bottom;

/** Small lattice pylon. */
function pylon(k: LayerTools, p: THREE.Object3D, x: number, z: number, h = 1.1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  p.add(g);
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => {
    const leg = addMesh(new THREE.CylinderGeometry(0.012, 0.012, h, 6), k.m.forest, g, [a * 0.08, h / 2, b * 0.08]);
    leg.rotation.set(b * 0.1, 0, -a * 0.1);
  });
  [0.3, 0.6, 0.85].forEach((y, i) => addMesh(new THREE.BoxGeometry(0.28 - i * 0.06, 0.015, 0.02), k.m.forest, g, [0, y * h, 0]));
  addMesh(new THREE.BoxGeometry(0.5, 0.02, 0.02), k.m.forest, g, [0, h, 0]);
}

/** Classical building: plinth, columns, pediment. */
function institution(k: LayerTools, p: THREE.Object3D, x: number, z: number) {
  k.box(p, 1.0, 0.08, 0.7, k.m.white, x, 0, z);
  for (let i = 0; i < 5; i++) k.cyl(p, 0.045, 0.5, k.m.white, x - 0.38 + i * 0.19, 0.08, z + 0.22, 12);
  k.box(p, 0.9, 0.5, 0.35, k.m.pale, x, 0.08, z - 0.12);
  k.box(p, 1.0, 0.07, 0.7, k.m.white, x, 0.58, z);
  const roof = new THREE.Shape();
  roof.moveTo(-0.5, 0);
  roof.lineTo(0.5, 0);
  roof.lineTo(0, 0.22);
  roof.lineTo(-0.5, 0);
  const pd = addMesh(new THREE.ExtrudeGeometry(roof, { depth: 0.7, bevelEnabled: false }), k.m.forest, p, [x, 0.65, z - 0.35]);
  void pd;
}

/** Document lying or standing with skeleton text lines. */
function documentSheet(k: LayerTools, p: THREE.Object3D, x: number, y: number, z: number, standing = false) {
  const d = new THREE.Group();
  d.position.set(x, y, z);
  if (standing) d.rotation.y = Math.PI / 2;
  p.add(d);
  if (standing) {
    addMesh(new RoundedBoxGeometry(0.55, 0.72, 0.03, 2, 0.02), k.m.white, d, [0, 0.36, 0]);
    for (let j = 0; j < 4; j++) addMesh(new THREE.BoxGeometry(j === 0 ? 0.25 : 0.36, 0.03, 0.01), j === 0 ? k.m.deep : k.m.forest, d, [-0.03, 0.56 - j * 0.11, 0.02]);
  } else {
    addMesh(new RoundedBoxGeometry(0.5, 0.025, 0.66, 2, 0.01), k.m.white, d, [0, 0.012, 0]);
    for (let j = 0; j < 4; j++) addMesh(new THREE.BoxGeometry(0.03, 0.01, j === 0 ? 0.25 : 0.4), j === 0 ? k.m.deep : k.m.forest, d, [0.15 - j * 0.09, 0.03, 0]);
  }
  return d;
}

function coinStack(k: LayerTools, p: THREE.Object3D, x: number, z: number, n: number) {
  for (let i = 0; i < n; i++) k.cyl(p, 0.14, 0.05, i === n - 1 ? k.m.bright : k.m.pale, x, i * 0.055, z, 20);
}

// ---------------------------------------------------------------------------
// 2 · Hydrogen economics
// ---------------------------------------------------------------------------
function economics(root: THREE.Group, kit: LayerKit) {
  const k = createLayerTools(root, kit);
  const p = k.panel();

  // Cost waterfall (electricity, CAPEX, O&M, stack, other) → LCOH total.
  const parts = [
    { h: 1.05, m: k.m.forest },
    { h: 0.75, m: k.m.bright },
    { h: 0.32, m: k.m.pale },
    { h: 0.2, m: k.m.deep },
    { h: 0.14, m: k.m.glass },
  ];
  let base = 0;
  const bars: { mesh: THREE.Mesh; delay: number }[] = [];
  parts.forEach((part, i) => {
    const g = new RoundedBoxGeometry(0.42, part.h, 0.6, 2, 0.04);
    g.translate(0, part.h / 2, 0);
    const mesh = addMesh(g, part.m, p, [-3.6 + i * 0.58, base, -0.35]);
    bars.push({ mesh, delay: i * 0.25 });
    base += part.h;
  });
  const tg = new RoundedBoxGeometry(0.5, base, 0.6, 2, 0.04);
  tg.translate(0, base / 2, 0);
  const total = addMesh(tg, k.m.deep, p, [-0.55, 0, -0.35]);
  bars.push({ mesh: total, delay: 1.4 });
  const cap = k.box(p, 0.52, 0.06, 0.62, k.m.mint, -0.55, base, -0.35);
  k.label(p, "COST WATERFALL", -2.2, 0.8, 2.2);
  k.badge(p, "euro", "#104336", [-0.55, base + 0.55, -0.35]);

  // Scenario comparison.
  [
    { h: 2.1, m: k.m.deep, t: "CONS." },
    { h: 1.5, m: k.m.forest, t: "BASE" },
    { h: 1.0, m: k.m.bright, t: "OPT." },
  ].forEach(({ h, m, t }, i) => {
    const x = 1.2 + i * 0.95;
    const g = new RoundedBoxGeometry(0.5, h, 0.5, 2, 0.04);
    g.translate(0, h / 2, 0);
    bars.push({ mesh: addMesh(g, m, p, [x, 0, -0.3]), delay: 1.8 + i * 0.2 });
    k.label(p, t, x + 0.55, -0.3, 0.9);
  });
  k.label(p, "SCENARIOS", 2.15, 0.9, 1.6);
  k.ticks.push((t) => {
    // Bars regrow every 9 s to show the waterfall building up.
    const cycle = t % 9;
    bars.forEach(({ mesh, delay }) => (mesh.scale.y = Math.max(0.001, Math.min(1, (cycle - delay) / 0.6))));
    cap.visible = cycle > 2;
    (cap.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3) ** 2;
  });

  // Tiles: power, electrolyser CAPEX, O&M, water, scenarios, report.
  {
    const t = k.tile(T1[0], T1[1]);
    pylon(k, t, -0.45, -0.3, 1.2);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++) {
        const panel = addMesh(new RoundedBoxGeometry(0.36, 0.03, 0.26, 1, 0.01), k.m.deep, t, [0.2 + c * 0.4, 0.2, 0.15 + r * 0.32]);
        panel.rotation.z = 0.35;
        k.cyl(t, 0.012, 0.16, k.m.white, 0.2 + c * 0.4, 0, 0.15 + r * 0.32, 6);
      }
    k.tree(t, -0.8, 0.8);
    k.badge(t, "bolt", "#16825f", [0.6, 1.0, -0.5]);
  }
  {
    const t = k.tile(T2[0], T2[1]);
    k.box(t, 0.7, 0.35, 0.55, k.m.deep, -0.2, 0, -0.2);
    for (let i = 0; i < 4; i++) k.box(t, 0.6, 0.05, 0.45, i % 2 ? k.m.pale : k.m.forest, -0.2, 0.35 + i * 0.065, -0.2, 0.015);
    coinStack(k, t, 0.45, 0.45, 5);
    coinStack(k, t, 0.15, 0.55, 3);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "euro", "#104336", [0.6, 1.0, -0.5]);
  }
  {
    const t = k.tile(T3[0], T3[1]);
    // Service van
    k.box(t, 0.7, 0.3, 0.35, k.m.white, -0.1, 0.06, 0.1);
    k.box(t, 0.25, 0.22, 0.33, k.m.pale, 0.35, 0.06, 0.1);
    [-0.3, 0.1, 0.35].forEach((x) => {
      const w = addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.38, 12), k.m.deep, t, [x, 0.06, 0.1]);
      w.rotation.x = Math.PI / 2;
    });
    k.box(t, 0.3, 0.2, 0.25, k.m.forest, -0.5, 0, -0.5);
    k.tree(t, 0.8, -0.8);
    k.badge(t, "gear", "#16825f", [0.6, 1.0, -0.4]);
  }
  {
    const t = k.tile(B1[0], B1[1]);
    k.cyl(t, 0.32, 0.55, k.m.white, -0.3, 0, -0.2, 28);
    k.cyl(t, 0.3, 0.02, k.m.water, -0.3, 0.55, -0.2, 28);
    k.box(t, 0.35, 0.3, 0.3, k.m.pale, 0.3, 0, -0.35);
    k.box(t, 0.35, 0.3, 0.3, k.m.pale, 0.3, 0, 0.05);
    const pipe = addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), k.m.forest, t, [0, 0.2, -0.2]);
    pipe.rotation.z = Math.PI / 2;
    k.tree(t, -0.8, 0.8);
    k.tree(t, 0.75, 0.75, 0.85);
    k.badge(t, "drop", "#2a9d8f", [0.6, 1.0, 0.3]);
  }
  {
    const t = k.tile(B2[0], B2[1]);
    [0.5, 0.8, 1.1].forEach((h, i) => k.box(t, 0.28, h, 0.28, [k.m.bright, k.m.forest, k.m.deep][i], -0.45 + i * 0.4, 0, -0.1));
    k.tree(t, 0.8, 0.8);
    k.badge(t, "chart", "#12b76a", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(B3[0], B3[1]);
    for (let i = 0; i < 4; i++) documentSheet(k, t, -0.25 + i * 0.03, i * 0.03, -0.1 + i * 0.03);
    documentSheet(k, t, 0.35, 0, -0.35, true);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "doc", "#16825f", [0.6, 1.0, 0.3]);
  }
  return k.tick;
}

// ---------------------------------------------------------------------------
// 3 · Project & technology
// ---------------------------------------------------------------------------
function technology(root: THREE.Group, kit: LayerKit) {
  const k = createLayerTools(root, kit);
  const p = k.panel();
  // Spec bench: four electrolyser types with efficiency bars (lower kWh/kg = longer bar).
  const tech = [
    { name: "PEM", eff: 0.62 },
    { name: "ALKALINE", eff: 0.66 },
    { name: "SOEC", eff: 0.95 },
    { name: "AEM", eff: 0.6 },
  ];
  tech.forEach(({ name, eff }, i) => {
    const x = -3.0 + i * 2.0;
    const g = new THREE.Group();
    g.position.set(x, 0, -0.6);
    p.add(g);
    if (name === "PEM") {
      k.box(g, 0.8, 0.12, 0.6, k.m.deep, 0, 0, 0);
      for (let j = 0; j < 6; j++) k.box(g, 0.7, 0.06, 0.5, j % 2 ? k.m.pale : k.m.forest, 0, 0.12 + j * 0.08, 0, 0.015);
      k.box(g, 0.8, 0.12, 0.6, k.m.deep, 0, 0.6, 0);
    } else if (name === "ALKALINE") {
      const c = addMesh(new THREE.CylinderGeometry(0.28, 0.28, 1.0, 24), k.m.white, g, [0, 0.32, 0]);
      c.rotation.z = Math.PI / 2;
      for (let j = 0; j < 5; j++) {
        const ring = addMesh(new THREE.TorusGeometry(0.29, 0.025, 8, 24), k.m.forest, g, [-0.4 + j * 0.2, 0.32, 0]);
        ring.rotation.y = Math.PI / 2;
      }
      k.box(g, 0.9, 0.06, 0.4, k.m.deep, 0, 0, 0);
    } else if (name === "SOEC") {
      k.box(g, 0.75, 0.65, 0.6, k.m.deep, 0, 0, 0);
      const core = k.box(g, 0.45, 0.35, 0.02, k.m.mint, 0, 0.15, 0.31);
      k.ticks.push((t) => ((core.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 2.4) ** 2));
    } else {
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) k.box(g, 0.32, 0.32, 0.26, (a + b) % 2 ? k.m.pale : k.m.white, -0.18 + a * 0.36, 0, -0.15 + b * 0.3);
    }
    // Efficiency bar on the panel in front of the device.
    k.box(p, 0.2, 0.05, 1.5, k.m.white, x + 0.6, 0, 0.5);
    const bar = new RoundedBoxGeometry(0.2, 0.08, 1.5 * eff, 2, 0.03);
    bar.translate(0, 0, (1.5 * eff) / 2);
    const bm = addMesh(bar, k.m.bright, p, [x + 0.6, 0.02, 0.5 - 0.75]);
    k.ticks.push((t) => (bm.scale.z = Math.max(0.01, Math.min(1, ((t % 8) - i * 0.3) / 0.8))));
    k.label(p, name, x - 0.15, 1.1, 1.3);
  });
  k.label(p, "EFFICIENCY · CAPACITY · PRESSURE", 0.5, -1.6, 3.6);

  // Tiles: compressor, storage vessels, power electronics, water treatment, fuel cell, RFQ.
  {
    const t = k.tile(T1[0], T1[1]);
    k.box(t, 0.6, 0.35, 0.5, k.m.white, -0.25, 0, -0.2);
    [-0.35, 0.05].forEach((z) => {
      const c = addMesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), k.m.forest, t, [0.3, 0.2, z]);
      c.rotation.z = Math.PI / 2;
    });
    k.tree(t, -0.8, 0.8);
    k.badge(t, "gear", "#16825f", [0.6, 1.0, 0.4]);
  }
  {
    const t = k.tile(T2[0], T2[1]);
    [[-0.4, -0.3], [0, -0.4], [0.4, -0.3]].forEach(([x, z], i) => {
      k.cyl(t, 0.16, 0.8 + i * 0.1, k.m.white, x, 0, z, 24);
      const b = addMesh(new THREE.TorusGeometry(0.162, 0.015, 6, 24), k.m.bright, t, [x, 0.55, z]);
      b.rotation.x = Math.PI / 2;
    });
    k.tree(t, -0.8, 0.8);
    k.tree(t, 0.8, 0.8, 0.85);
    k.badge(t, "check", "#12b76a", [0.6, 1.2, 0.3]);
  }
  {
    const t = k.tile(T3[0], T3[1]);
    for (let i = 0; i < 3; i++) {
      k.box(t, 0.28, 0.62, 0.4, k.m.white, -0.4 + i * 0.33, 0, -0.2);
      k.box(t, 0.2, 0.05, 0.02, k.m.mint, -0.4 + i * 0.33, 0.45, 0.005);
    }
    k.tree(t, 0.8, 0.8);
    k.badge(t, "bolt", "#16825f", [0.6, 1.0, -0.5]);
  }
  {
    const t = k.tile(B1[0], B1[1]);
    k.cyl(t, 0.25, 0.45, k.m.white, -0.35, 0, -0.1, 24);
    k.cyl(t, 0.23, 0.02, k.m.water, -0.35, 0.45, -0.1, 24);
    k.box(t, 0.5, 0.28, 0.35, k.m.pale, 0.3, 0, -0.1);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "drop", "#2a9d8f", [0.6, 1.0, 0.4]);
  }
  {
    const t = k.tile(B2[0], B2[1]);
    k.box(t, 0.7, 0.12, 0.5, k.m.deep, -0.1, 0, -0.1);
    for (let i = 0; i < 7; i++) k.box(t, 0.6, 0.04, 0.42, k.m.pale, -0.1, 0.12 + i * 0.05, -0.1, 0.01);
    k.box(t, 0.7, 0.1, 0.5, k.m.deep, -0.1, 0.48, -0.1);
    k.tree(t, 0.8, 0.8);
    k.badge(t, "leaf", "#12b76a", [0.6, 1.0, -0.5]);
  }
  {
    const t = k.tile(B3[0], B3[1]);
    documentSheet(k, t, -0.2, 0, 0, true);
    documentSheet(k, t, 0.2, 0, -0.25, true);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "euro", "#104336", [0.6, 1.0, 0.3]);
  }
  return k.tick;
}

// ---------------------------------------------------------------------------
// 4 · Procurement & tenders
// ---------------------------------------------------------------------------
function procurement(root: THREE.Group, kit: LayerKit) {
  const k = createLayerTools(root, kit);
  const p = k.panel();
  // Deadline calendar (7 × 4 days) with a few highlighted calls.
  const days: THREE.Mesh[] = [];
  const special: Record<number, THREE.Material> = { 5: k.m.bright, 11: k.m.bright, 18: k.m.red, 23: k.m.bright, 26: k.m.deep };
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++) {
      const i = r * 7 + c;
      const h = special[i] ? 0.2 : 0.08;
      days.push(k.box(p, 0.42, h, 0.5, special[i] ?? k.m.white, -3.6 + c * 0.55, 0, -1.2 + r * 0.62, 0.04));
    }
  k.label(p, "DEADLINES", -1.95, 1.45, 1.8);
  k.ticks.push((t) => {
    const hot = Math.floor(t * 1.5) % 28;
    days.forEach((d, i) => (d.position.y = (special[i] ? 0.1 : 0.04) + (i === hot ? 0.08 : 0)));
  });

  // Radar sweep.
  const radar = new THREE.Group();
  radar.position.set(2.6, 0, 0);
  p.add(radar);
  k.cyl(radar, 1.35, 0.08, k.m.white, 0, 0, 0, 48);
  [0.45, 0.9, 1.25].forEach((r) => {
    const ring = addMesh(new THREE.TorusGeometry(r, 0.015, 6, 64), k.m.forest, radar, [0, 0.085, 0]);
    ring.rotation.x = Math.PI / 2;
  });
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(1.3, 32, 0, 0.8), new THREE.MeshBasicMaterial({ color: G.bright, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  sweep.rotation.x = -Math.PI / 2;
  sweep.position.y = 0.09;
  radar.add(sweep);
  k.spinners.push({ o: sweep, axis: "z", speed: 1.4 });
  [[0.6, 0.4], [-0.5, 0.7], [0.2, -0.9], [-0.9, -0.3]].forEach(([x, z], i) => {
    const b = addMesh(new THREE.SphereGeometry(0.08, 14, 10), k.m.bright, radar, [x, 0.14, z]);
    k.bobbers.push({ o: b, base: 0.14, k: i, amp: 0.04 });
  });

  // Tiles: EU funding, auctions, public tenders, checklist, grants, deadline.
  {
    const t = k.tile(T1[0], T1[1]);
    institution(k, t, -0.15, -0.15);
    k.tree(t, 0.8, 0.8);
    k.badge(t, "euro", "#104336", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(T2[0], T2[1]);
    k.box(t, 0.5, 0.15, 0.5, k.m.forest, -0.2, 0, -0.1);
    const gavel = new THREE.Group();
    gavel.position.set(-0.2, 0.45, -0.1);
    t.add(gavel);
    const head = addMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.38, 18), k.m.deep, gavel);
    head.rotation.z = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 10), k.m.pale, gavel, [0, -0.05, 0.27]).rotation.x = Math.PI / 2;
    k.ticks.push((tt) => (gavel.rotation.x = -0.4 + Math.max(0, Math.sin(tt * 3)) * 0.5));
    k.tree(t, 0.8, 0.8);
    k.badge(t, "chart", "#12b76a", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(T3[0], T3[1]);
    for (let i = 0; i < 5; i++) documentSheet(k, t, -0.2 + i * 0.02, i * 0.028, -0.1 + i * 0.02);
    documentSheet(k, t, 0.4, 0, -0.4, true);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "doc", "#16825f", [0.6, 1.0, 0.3]);
  }
  {
    const t = k.tile(B1[0], B1[1]);
    const clip = new THREE.Group();
    clip.position.set(-0.1, 0, -0.1);
    clip.rotation.y = Math.PI / 2;
    t.add(clip);
    addMesh(new RoundedBoxGeometry(0.7, 0.9, 0.04, 2, 0.04), k.m.forest, clip, [0, 0.45, 0]);
    addMesh(new RoundedBoxGeometry(0.6, 0.78, 0.02, 2, 0.02), k.m.white, clip, [0, 0.43, 0.03]);
    for (let j = 0; j < 4; j++) {
      addMesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), j < 3 ? k.m.bright : k.m.pale, clip, [-0.2, 0.68 - j * 0.16, 0.045]);
      addMesh(new THREE.BoxGeometry(0.3, 0.035, 0.01), k.m.deep, clip, [0.06, 0.68 - j * 0.16, 0.045]);
    }
    k.tree(t, 0.8, 0.8);
    k.badge(t, "check", "#12b76a", [0.6, 1.1, -0.4]);
  }
  {
    const t = k.tile(B2[0], B2[1]);
    k.cyl(t, 0.25, 0.4, k.m.pale, -0.3, 0, -0.1, 20);
    addMesh(new THREE.SphereGeometry(0.25, 20, 14), k.m.pale, t, [-0.3, 0.4, -0.1]);
    coinStack(k, t, 0.3, -0.3, 6);
    coinStack(k, t, 0.35, 0.15, 4);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "euro", "#104336", [0.6, 1.1, 0.4]);
  }
  {
    const t = k.tile(B3[0], B3[1]);
    const clock = new THREE.Group();
    clock.position.set(-0.1, 0.5, -0.1);
    clock.rotation.y = Math.PI / 2;
    t.add(clock);
    const face = addMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 40), k.m.white, clock);
    face.rotation.x = Math.PI / 2;
    const rim = addMesh(new THREE.TorusGeometry(0.42, 0.035, 8, 40), k.m.forest, clock);
    void rim;
    const hand = new THREE.Group();
    hand.position.z = 0.06;
    clock.add(hand);
    addMesh(new THREE.BoxGeometry(0.03, 0.3, 0.02), k.m.deep, hand, [0, 0.15, 0]);
    k.spinners.push({ o: hand, axis: "z", speed: -1.2 });
    k.box(t, 0.2, 0.1, 0.3, k.m.forest, -0.1, 0, -0.1);
    k.tree(t, 0.8, 0.8);
    k.badge(t, "clock", "#e5533d", [0.6, 1.1, -0.5]);
  }
  return k.tick;
}

// ---------------------------------------------------------------------------
// 5 · Investment & M&A
// ---------------------------------------------------------------------------
function investment(root: THREE.Group, kit: LayerKit) {
  const k = createLayerTools(root, kit);
  const p = k.panel();
  // Deal network: companies and investors linked by documented deals.
  const nodes: [number, number, number, THREE.Material][] = [
    [-2.8, -0.6, 0.32, k.m.deep],
    [-1.5, 0.7, 0.22, k.m.bright],
    [-0.4, -0.5, 0.42, k.m.forest],
    [0.9, 0.6, 0.26, k.m.bright],
    [1.9, -0.7, 0.34, k.m.deep],
    [3.2, 0.4, 0.24, k.m.forest],
    [-3.4, 0.9, 0.18, k.m.pale],
    [2.9, -1.1, 0.16, k.m.pale],
  ];
  const pos = nodes.map(([x, z, r]) => new THREE.Vector3(x, r + 0.1, z));
  nodes.forEach(([, , r, m], i) => {
    const s = addMesh(new THREE.SphereGeometry(r, 28, 20), m, p, pos[i].toArray() as [number, number, number]);
    k.bobbers.push({ o: s, base: pos[i].y, k: i, amp: 0.05 });
    k.cyl(p, r * 0.8, 0.03, k.m.pale, pos[i].x, 0, pos[i].z, 24);
  });
  [[0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [6, 1], [2, 4], [5, 7], [0, 6]].forEach(([a, b], i) =>
    k.link(p, pos[a].clone(), pos[b].clone(), 0.35 + (i % 3) * 0.15, i * 0.21),
  );
  k.label(p, "DOCUMENTED DEALS", 0.3, 1.45, 2.4);

  // Tiles: venture fund, infrastructure fund, development bank, start-up, manufacturer, joint venture.
  {
    const t = k.tile(T1[0], T1[1]);
    k.box(t, 0.45, 1.3, 0.45, k.m.white, -0.25, 0, -0.2, 0.04);
    for (let j = 0; j < 6; j++) k.box(t, 0.47, 0.03, 0.47, k.m.glass, -0.25, 0.2 + j * 0.18, -0.2, 0.01);
    k.box(t, 0.35, 0.6, 0.35, k.m.pale, 0.3, 0, -0.35, 0.04);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "chart", "#12b76a", [0.6, 1.1, 0.3]);
  }
  {
    const t = k.tile(T2[0], T2[1]);
    institution(k, t, -0.15, -0.15);
    k.tree(t, 0.8, 0.8);
    k.badge(t, "euro", "#104336", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(T3[0], T3[1]);
    k.cyl(t, 0.4, 0.5, k.m.white, -0.15, 0, -0.15, 28);
    const dome = addMesh(new THREE.SphereGeometry(0.4, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), k.m.forest, t, [-0.15, 0.5, -0.15]);
    void dome;
    k.tree(t, 0.8, 0.8);
    k.tree(t, -0.8, 0.8, 0.85);
    k.badge(t, "leaf", "#12b76a", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(B1[0], B1[1]);
    k.box(t, 0.6, 0.35, 0.45, k.m.white, -0.25, 0, -0.1);
    const rocket = new THREE.Group();
    rocket.position.set(0.4, 0, -0.3);
    t.add(rocket);
    k.cyl(rocket, 0.09, 0.45, k.m.pale, 0, 0.05, 0, 16);
    addMesh(new THREE.ConeGeometry(0.09, 0.2, 16), k.m.bright, rocket, [0, 0.6, 0]);
    k.bobbers.push({ o: rocket, base: 0, k: 9, amp: 0.06 });
    k.tree(t, -0.8, 0.8);
    k.badge(t, "bolt", "#16825f", [0.6, 1.1, 0.4]);
  }
  {
    const t = k.tile(B2[0], B2[1]);
    k.box(t, 0.9, 0.4, 0.7, k.m.white, -0.1, 0, -0.1);
    const tooth = new THREE.Shape();
    tooth.moveTo(0, 0);
    tooth.lineTo(0.23, 0);
    tooth.lineTo(0.23, 0.22);
    tooth.lineTo(0, 0);
    const tg = new THREE.ExtrudeGeometry(tooth, { depth: 0.9, bevelEnabled: false });
    for (let i = 0; i < 3; i++) addMesh(tg, i === 1 ? k.m.forest : k.m.deep, t, [0.35, 0.4, -0.45 + i * 0.23]).rotation.y = -Math.PI / 2;
    k.cyl(t, 0.06, 0.6, k.m.deep, -0.45, 0.4, -0.35, 12);
    k.tree(t, 0.8, 0.8);
    k.badge(t, "gear", "#16825f", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(B3[0], B3[1]);
    k.box(t, 0.4, 0.8, 0.4, k.m.white, -0.45, 0, -0.2);
    k.box(t, 0.4, 0.6, 0.4, k.m.pale, 0.35, 0, -0.2);
    k.box(t, 0.4, 0.08, 0.15, k.m.forest, -0.05, 0.45, -0.2);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "check", "#12b76a", [0.6, 1.1, 0.4]);
  }
  return k.tick;
}

// ---------------------------------------------------------------------------
// 6 · Project delivery
// ---------------------------------------------------------------------------
function delivery(root: THREE.Group, kit: LayerKit) {
  const k = createLayerTools(root, kit);
  const p = k.panel();
  // Gantt board: phases as bars, milestone diamonds and a "today" marker.
  const rows = [
    { x: -3.8, len: 1.5, m: k.m.deep, t: "FEASIBILITY" },
    { x: -2.6, len: 1.9, m: k.m.forest, t: "FEED" },
    { x: -1.0, len: 2.2, m: k.m.bright, t: "PROCUREMENT" },
    { x: 0.6, len: 2.4, m: k.m.forest, t: "CONSTRUCTION" },
    { x: 2.4, len: 1.5, m: k.m.deep, t: "COMMISSIONING" },
  ];
  const gantt = rows.map((r, i) => {
    const z = -1.25 + i * 0.6;
    const g = new RoundedBoxGeometry(r.len, 0.16, 0.34, 2, 0.06);
    g.translate(r.len / 2, 0.08, 0);
    const mesh = addMesh(g, r.m, p, [r.x, 0, z]);
    return { mesh, delay: i * 0.4 };
  });
  [-2.3, -0.6, 1.4, 3.9].forEach((x, i) => {
    const d = addMesh(new THREE.OctahedronGeometry(0.14), i === 3 ? k.m.mint : k.m.bright, p, [x, 0.35, 1.6]);
    k.spinners.push({ o: d, axis: "y", speed: 1.2 });
  });
  const today = k.box(p, 0.03, 0.02, 3.1, k.m.mint, 0, 0, 0.15);
  k.label(p, "PHASE-GATED PLAN", -2.4, 1.6, 2.4);
  k.ticks.push((t) => {
    const cycle = t % 10;
    gantt.forEach(({ mesh, delay }) => (mesh.scale.x = Math.max(0.001, Math.min(1, (cycle - delay) / 0.8))));
    today.position.x = -4 + ((t * 0.6) % 8);
  });

  // Tiles: feasibility, FEED, procurement, construction, commissioning, operations.
  {
    const t = k.tile(T1[0], T1[1]);
    // Surveyor's tripod and a site map
    const tri = new THREE.Group();
    tri.position.set(-0.35, 0, -0.2);
    t.add(tri);
    [0, 2.1, 4.2].forEach((a) => {
      const leg = addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 6), k.m.deep, tri, [Math.cos(a) * 0.12, 0.33, Math.sin(a) * 0.12]);
      leg.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
    });
    k.box(tri, 0.16, 0.12, 0.12, k.m.bright, 0, 0.66, 0);
    k.box(t, 0.7, 0.03, 0.55, k.m.pale, 0.3, 0, 0.2);
    k.tree(t, 0.8, -0.8);
    k.badge(t, "doc", "#16825f", [0.6, 1.0, -0.4]);
  }
  {
    const t = k.tile(T2[0], T2[1]);
    const board = addMesh(new RoundedBoxGeometry(0.9, 0.04, 0.7, 2, 0.02), k.m.white, t, [-0.1, 0.45, -0.1]);
    board.rotation.x = -0.35;
    [[-0.45, -0.35], [0.25, -0.35], [-0.45, 0.15], [0.25, 0.15]].forEach(([x, z]) => k.cyl(t, 0.02, 0.4, k.m.deep, x, 0, z, 6));
    [0, 1, 2].forEach((i) => {
      const roll = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12), i === 1 ? k.m.bright : k.m.pale, t, [0.5, 0.05 + i * 0.1, 0.4]);
      roll.rotation.x = Math.PI / 2;
    });
    k.badge(t, "gear", "#16825f", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(T3[0], T3[1]);
    [[-0.45, -0.3], [-0.15, -0.3], [-0.3, -0.3]].forEach(([x, z], i) => k.box(t, 0.28, 0.28, 0.28, i === 2 ? k.m.forest : k.m.pale, x, i === 2 ? 0.28 : 0, z));
    // Forklift
    k.box(t, 0.35, 0.22, 0.25, k.m.bright, 0.35, 0.05, 0.2);
    k.box(t, 0.04, 0.5, 0.2, k.m.deep, 0.15, 0, 0.2);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "check", "#12b76a", [0.6, 1.0, -0.5]);
  }
  {
    const t = k.tile(B1[0], B1[1]);
    // Tower crane + building frame
    k.box(t, 0.12, 1.5, 0.12, k.m.forest, -0.5, 0, -0.4, 0.01);
    const jib = new THREE.Group();
    jib.position.set(-0.5, 1.5, -0.4);
    t.add(jib);
    addMesh(new THREE.BoxGeometry(1.2, 0.06, 0.08), k.m.forest, jib, [0.35, 0, 0]);
    addMesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), k.m.deep, jib, [0.75, -0.2, 0]);
    k.ticks.push((tt) => (jib.rotation.y = Math.sin(tt * 0.5) * 0.6));
    for (let y = 0; y < 3; y++) {
      [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]].forEach(([a, b]) => k.box(t, 0.04, 0.25, 0.04, k.m.white, 0.05 + a, y * 0.25, 0.05 + b, 0.01));
      k.box(t, 0.58, 0.03, 0.58, k.m.pale, 0.3, y * 0.25 + 0.25, 0.3, 0.01);
    }
    k.badge(t, "warning", "#e5533d", [0.6, 1.2, -0.5]);
  }
  {
    const t = k.tile(B2[0], B2[1]);
    for (let a = 0; a < 3; a++) {
      k.box(t, 0.3, 0.42, 0.42, a === 1 ? k.m.pale : k.m.white, -0.5 + a * 0.36, 0, -0.2);
      k.cyl(t, 0.07, 0.03, k.m.deep, -0.5 + a * 0.36, 0.42, -0.2, 14);
    }
    k.cyl(t, 0.18, 0.55, k.m.white, 0.55, 0, 0.35, 20);
    k.tree(t, -0.8, 0.8);
    k.badge(t, "check", "#12b76a", [0.6, 1.1, -0.5]);
  }
  {
    const t = k.tile(B3[0], B3[1]);
    // Control screen + wind turbine
    k.box(t, 0.06, 0.4, 0.06, k.m.deep, -0.3, 0, -0.1, 0.01);
    const screen = new THREE.Group();
    screen.position.set(-0.3, 0.6, -0.1);
    screen.rotation.y = Math.PI / 2;
    t.add(screen);
    addMesh(new RoundedBoxGeometry(0.75, 0.45, 0.04, 2, 0.03), k.m.deep, screen);
    addMesh(new RoundedBoxGeometry(0.66, 0.36, 0.01, 2, 0.02), k.m.bright, screen, [0, 0, 0.025]);
    k.cyl(t, 0.02, 1.2, k.m.white, 0.45, 0, 0.35, 8);
    const rotor = new THREE.Group();
    rotor.position.set(0.5, 1.2, 0.35);
    t.add(rotor);
    for (let b = 0; b < 3; b++) {
      const blade = addMesh(new RoundedBoxGeometry(0.02, 0.45, 0.05, 1, 0.01), k.m.pale, rotor);
      blade.geometry.translate(0, 0.22, 0);
      blade.rotation.x = (b * Math.PI * 2) / 3;
    }
    k.spinners.push({ o: rotor, axis: "x", speed: 2 });
    k.badge(t, "bolt", "#16825f", [0.6, 1.1, -0.5]);
  }
  return k.tick;
}

/** Builds layers 2–6 into the given content groups; returns one tick for all. */
export function buildValueLayers(roots: THREE.Group[], kit: LayerKit) {
  const builders = [economics, technology, procurement, investment, delivery];
  const ticks = builders.map((b, i) => b(roots[i], kit));
  return (t: number) => ticks.forEach((f) => f(t));
}
