import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { addMesh } from "../stage";

/**
 * Shared building blocks for the "value chain" layer style: a framed central
 * panel, floating pedestal tiles with mini scenes, trees and camera-facing
 * icon badges — all in the IKEHU green palette.
 */

export type Mat = (hex: number, emissive?: number, extra?: Partial<THREE.MeshPhysicalMaterialParameters>) => THREE.MeshPhysicalMaterial;

export interface LayerKit {
  mat: Mat;
  soft: THREE.Material;
  gradient: (g: THREE.BufferGeometry) => THREE.BufferGeometry;
  textures: THREE.Texture[];
  /** Text on a transparent plane (faces +z, reads along +x). */
  textPlane: (lines: string[], w: number, h: number, color: string, opts?: { weight?: number; scale?: number }) => THREE.Mesh;
  /** Lays a text plane flat on a top face, reading along −z. */
  onTop: (plane: THREE.Mesh) => THREE.Group;
}

export const G = {
  deep: 0x104336,
  forest: 0x16825f,
  bright: 0x12b76a,
  pale: 0xb6e3cc,
  white: 0xf6faf8,
  mint: 0x0fff87,
  water: 0x2a9d8f,
  tree: 0x2f8f5f,
  red: 0xe5533d,
  ink: "#0b2c24",
};

/** Central panel footprint and tile rows (top row z<0, bottom row z>0). */
export const PANEL = { w: 8.4, d: 3.3 };
export const TILE_SLOTS = {
  top: [
    [-3.4, -3.75],
    [0, -3.75],
    [3.4, -3.75],
  ],
  bottom: [
    [-3.4, 3.75],
    [0, 3.75],
    [3.4, 3.75],
  ],
} as const;

export type BadgeIcon = "bolt" | "leaf" | "ship" | "gear" | "warning" | "check" | "euro" | "drop" | "chart" | "doc" | "clock";

/** Circular icon badge drawn on a canvas, used as a camera-facing sprite. */
export function badgeTexture(icon: BadgeIcon, color: string, textures: THREE.Texture[]) {
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 104, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.save();
  ctx.translate(S / 2, S / 2);
  const poly = (pts: number[][]) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  };
  switch (icon) {
    case "bolt":
      poly([[12, -62], [-38, 8], [-2, 8], [-14, 62], [38, -10], [2, -10]]);
      ctx.fill();
      break;
    case "leaf":
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, -44);
      ctx.lineTo(0, 64);
      ctx.stroke();
      break;
    case "ship":
      poly([[-58, 10], [58, 10], [40, 44], [-40, 44]]);
      ctx.fill();
      ctx.fillRect(-26, -26, 52, 30);
      ctx.fillRect(-6, -48, 12, 24);
      break;
    case "gear":
      for (let k = 0; k < 8; k++) {
        ctx.save();
        ctx.rotate((k * Math.PI) / 4);
        ctx.fillRect(-12, -62, 24, 26);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "warning":
      poly([[0, -56], [56, 44], [-56, 44]]);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-6, -18, 12, 36);
      ctx.beginPath();
      ctx.arc(0, 30, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "check":
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(-40, 2);
      ctx.lineTo(-10, 32);
      ctx.lineTo(44, -28);
      ctx.stroke();
      break;
    case "euro":
      ctx.font = "700 128px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("€", 0, 6);
      break;
    case "drop":
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.bezierCurveTo(30, -20, 44, 6, 44, 22);
      ctx.arc(0, 22, 44, 0, Math.PI);
      ctx.bezierCurveTo(-44, 6, -30, -20, 0, -60);
      ctx.fill();
      break;
    case "chart":
      ctx.fillRect(-48, 10, 22, 38);
      ctx.fillRect(-11, -14, 22, 62);
      ctx.fillRect(26, -42, 22, 90);
      break;
    case "doc":
      ctx.fillRect(-38, -56, 76, 112);
      ctx.fillStyle = color;
      [-30, -8, 14, 36].forEach((y, i) => ctx.fillRect(-24, y, i === 0 ? 34 : 48, 9));
      break;
    case "clock":
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, 0);
      ctx.lineTo(26, 14);
      ctx.stroke();
      break;
  }
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textures.push(tex);
  return tex;
}

/** Creates the materials and helpers used by every value-chain layer. */
export function createLayerTools(root: THREE.Group, kit: LayerKit) {
  const { mat, soft, gradient, textures } = kit;
  const m = {
    deep: mat(G.deep),
    forest: mat(G.forest),
    bright: mat(G.bright, 0.25),
    pale: mat(G.pale),
    white: mat(G.white),
    leaves: mat(G.tree),
    trunk: mat(0x6b4f3a),
    water: mat(G.water, 0.1),
    mint: mat(G.mint, 0.8),
    red: mat(G.red, 0.2),
    glass: mat(0x9fdcb9, 0.15, { transparent: true, opacity: 0.8 }),
  };
  const spinners: { o: THREE.Object3D; axis: "x" | "y" | "z"; speed: number }[] = [];
  const bobbers: { o: THREE.Object3D; base: number; k: number; amp: number }[] = [];
  const ticks: ((t: number) => void)[] = [];

  const box = (p: THREE.Object3D, w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, r = 0.03) =>
    addMesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), material, p, [x, y + h / 2, z]);
  const cyl = (p: THREE.Object3D, r: number, h: number, material: THREE.Material, x: number, y: number, z: number, seg = 20) =>
    addMesh(new THREE.CylinderGeometry(r, r, h, seg), material, p, [x, y + h / 2, z]);

  /** Dotted background grid around the central panel. */
  {
    const pts: number[] = [];
    for (let x = -4.6; x <= 4.6; x += 0.22) {
      for (let z = -4.6; z <= 4.6; z += 0.22) {
        const onPanel = Math.abs(x) < PANEL.w / 2 + 0.35 && Math.abs(z) < PANEL.d / 2 + 0.4;
        if (!onPanel && (Math.round(x * 50) + Math.round(z * 30)) % 3 === 0) pts.push(x, 0.01, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    root.add(new THREE.Points(g, new THREE.PointsMaterial({ color: G.forest, size: 2.2, transparent: true, opacity: 0.35, sizeAttenuation: false })));
  }

  /** Framed central panel; returns a group whose origin sits on the panel surface. */
  const panel = () => {
    addMesh(new RoundedBoxGeometry(PANEL.w + 0.5, 0.05, PANEL.d + 0.5, 3, 0.2), mat(0xe4f4eb), root, [0, 0.025, 0]);
    const frame = addMesh(new RoundedBoxGeometry(PANEL.w + 0.6, 0.03, PANEL.d + 0.6, 3, 0.24), mat(G.forest, 0.15), root, [0, 0.012, 0]);
    frame.receiveShadow = true;
    const g = new THREE.Group();
    g.position.y = 0.05;
    root.add(g);
    return g;
  };

  const tileGeo = gradient(new RoundedBoxGeometry(2.3, 0.32, 2.3, 3, 0.12));
  /** Floating pedestal tile at (x, z); returns the group on its top face. */
  const tile = (x: number, z: number) => {
    const t = new THREE.Group();
    t.position.set(x, 0.12, z);
    root.add(t);
    addMesh(tileGeo, soft, t, [0, 0.16, 0]);
    const glow = addMesh(new RoundedBoxGeometry(2.34, 0.04, 2.34, 2, 0.12), mat(G.mint, 0.45, { transparent: true, opacity: 0.55 }), t, [0, 0.02, 0]);
    glow.castShadow = false;
    const top = new THREE.Group();
    top.position.y = 0.32;
    t.add(top);
    return top;
  };

  const tree = (p: THREE.Object3D, x: number, z: number, s = 1) => {
    addMesh(new THREE.CylinderGeometry(0.02 * s, 0.025 * s, 0.1 * s, 6), m.trunk, p, [x, 0.05 * s, z]);
    addMesh(new THREE.ConeGeometry(0.1 * s, 0.22 * s, 10), m.leaves, p, [x, 0.2 * s, z]);
    addMesh(new THREE.ConeGeometry(0.075 * s, 0.17 * s, 10), m.leaves, p, [x, 0.3 * s, z]);
  };

  const badge = (p: THREE.Object3D, icon: BadgeIcon, color: string, pos: [number, number, number]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture(icon, color, textures), depthWrite: false }));
    s.scale.set(0.5, 0.5, 1);
    s.position.set(...pos);
    p.add(s);
    bobbers.push({ o: s, base: pos[1], k: bobbers.length, amp: 0.03 });
  };

  /** Small label lying on the panel, reading along −z. */
  const label = (p: THREE.Object3D, text: string, x: number, z: number, w = 1.2) => {
    const l = kit.onTop(kit.textPlane([text], w, 0.3, G.ink, { scale: 0.85 }));
    l.position.set(x, 0.02, z);
    p.add(l);
  };

  /** Thin tube along a curve with a pulse travelling along it. */
  const link = (p: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, lift = 0.3, phase = 0) => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += lift;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    p.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 6), mat(G.bright, 0.5, { transparent: true, opacity: 0.8 })));
    const pulse = addMesh(new THREE.SphereGeometry(0.045, 10, 8), m.mint, p);
    ticks.push((t) => pulse.position.copy(curve.getPoint((t * 0.35 + phase) % 1)));
  };

  const tick = (t: number) => {
    spinners.forEach(({ o, axis, speed }) => (o.rotation[axis] = t * speed));
    bobbers.forEach(({ o, base, k, amp }) => (o.position.y = base + Math.sin(t * 1.8 + k) * amp));
    ticks.forEach((f) => f(t));
  };

  return { m, mat, box, cyl, panel, tile, tree, badge, label, link, spinners, bobbers, ticks, tick };
}

export type LayerTools = ReturnType<typeof createLayerTools>;
