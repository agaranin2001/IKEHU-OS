"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { addMesh, createStage, pop } from "../stage";
import { buildMarketLayer } from "./marketLayer";
import { buildValueLayers } from "./valueLayers";

/**
 * Layered platform illustration (Arcadia-style, IKEHU greens): one white platform per
 * story step, stacked vertically and joined by a translucent data beam with
 * arrows flowing down through it. Each layer has its title engraved on the
 * front-right face, objects on top and labelled pills. The canvas spans the
 * full steps column and every layer is visible at once, each beside its step;
 * the active step's layer lifts slightly.
 */

/** Initial spacing; the real value is derived from the canvas size in `layout()`. */
const SPACING = 13;
/** World width the camera always fits (the stack is width-fitted). */
const VIEW_W = 15.5;
const SLAB = { w: 10, h: 1.3, d: 10 };
const LAYER_TITLES = ["MARKET INTELLIGENCE", "HYDROGEN ECONOMICS", "PROJECT & TECHNOLOGY", "PROCUREMENT & TENDERS", "INVESTMENT & M&A", "PROJECT DELIVERY"];

const COL = {
  white: new THREE.Color(0xffffff),
  lavender: new THREE.Color(0xd3ebdf), // mint-tinted shade
  sage: new THREE.Color(0xc4d9cf),
  ink: "#0b2c24",
  violet: 0x16825f, // forest
  violetLight: 0xb6e3cc, // pale mint
  violetDeep: 0x104336, // deep green
  purple: 0x12b76a, // bright green accent
  pill: 0xd6eee2,
  mint: 0x0fff87,
};

/** White → lavender/sage vertex gradient (top stays white). */
function gradient(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = (pos.getY(i) - bb.min.y) / Math.max(bb.max.y - bb.min.y, 1e-6);
    const x = (pos.getX(i) - bb.min.x) / Math.max(bb.max.x - bb.min.x, 1e-6);
    const tint = c.copy(COL.lavender).lerp(COL.sage, x);
    c.copy(COL.white).lerp(tint, (1 - y) * 0.75);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

const textures: THREE.Texture[] = [];

/** Text drawn on a transparent plane (w × h world units). Plane faces +z, reads along +x. */
function textPlane(lines: string[], w: number, h: number, color: string, opts: { weight?: number; italic?: boolean; scale?: number } = {}) {
  const pxPerUnit = 160;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * pxPerUnit);
  canvas.height = Math.round(h * pxPerUnit);
  const ctx = canvas.getContext("2d")!;
  const size = (canvas.height / Math.max(lines.length, 1)) * 0.62 * (opts.scale ?? 1);
  ctx.fillStyle = color;
  ctx.font = `${opts.italic ? "italic " : ""}${opts.weight ?? 700} ${size}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * size * 1.1));
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  textures.push(tex);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
}

/** Lays a text plane flat on a top face, reading lower-left → upper-right (along −z). */
function onTop(plane: THREE.Mesh) {
  const holder = new THREE.Group();
  holder.rotation.y = Math.PI / 2;
  plane.rotation.x = -Math.PI / 2;
  holder.add(plane);
  return holder;
}

export function PlatformStackScene({ active }: { active: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const { scene, camera, target, viewDir, key, start, dispose } = createStage(mount, {
      view: [VIEW_W, 1],
      maxPixelRatio: 1.25,
      target: [0, 0, 0],
      groundY: -200,
      shadowOpacity: 0,
    });
    scene.add(key.target);

    const soft = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.5 });
    const mat = (hex: number, emissive = 0, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
      new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.45, clearcoat: 0.4, emissive: hex, emissiveIntensity: emissive, ...extra });
    const violet = mat(COL.violet);

    const slabGeo = gradient(new RoundedBoxGeometry(SLAB.w, SLAB.h, SLAB.d, 4, 0.45));

    const layers = LAYER_TITLES.map((title, i) => {
      const g = new THREE.Group();
      g.position.y = -i * SPACING;
      scene.add(g);
      addMesh(slabGeo, soft, g, [0, -SLAB.h / 2, 0]);
      // Engraved title on the +x face, reading along −z.
      const t = textPlane([title], 8.6, 0.9, COL.ink, { scale: 1.25 });
      t.rotation.y = Math.PI / 2;
      t.position.set(SLAB.w / 2 + 0.01, -SLAB.h / 2, 0.4);
      g.add(t);
      const content = new THREE.Group();
      g.add(content);
      return { g, content, baseY: -i * SPACING, lift: 0 };
    });

    // 1 · Market intelligence — extruded world map, project pins and arcs, value-chain tiles.
    const marketTick = buildMarketLayer(layers[0].content, { mat, soft, gradient, textures });

    // 2–6 · Value-chain layers in the same style (central panel + six tiles).
    const valueTick = buildValueLayers(
      layers.slice(1).map((l) => l.content),
      { mat, soft, gradient, textures, textPlane, onTop },
    );

    // Data beam through all layers, with arrows flowing down. Built in a group
    // whose height is re-laid-out whenever the layer spacing changes.
    const beamGroup = new THREE.Group();
    scene.add(beamGroup);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x5fd39a, transparent: true, opacity: 0.16, depthWrite: false });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.6), beamMat);
    beamGroup.add(beam);
    const dashMat = new THREE.LineDashedMaterial({ color: 0x16825f, dashSize: 0.14, gapSize: 0.12 });
    let dashes: THREE.Line[] = [];
    const arrowGeo = new THREE.ConeGeometry(0.1, 0.24, 12);
    arrowGeo.rotateX(Math.PI);
    const arrows = Array.from({ length: 14 }, (_, k) => ({ m: addMesh(arrowGeo, violet, scene, [k % 2 ? 3.9 : 3.2, 0, k % 2 ? -3.3 : -3.9]), k }));

    // Orthographic: distance doesn't change scale, so sit far back with a deep
    // frustum — otherwise the near plane slices through the tall stack.
    const camDist = 400;
    camera.near = 1;
    camera.far = 2000;
    camera.updateProjectionMatrix();
    const lightOffset = new THREE.Vector3(-6, 14, 3);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /** Screen-space factor of a vertical world distance under the isometric camera. */
    const VERTICAL = Math.sqrt(2 / 3);

    // Lay the whole stack out to fill the canvas: one layer per step, evenly spaced
    // so layer i sits beside step i (the canvas spans the full steps column).
    let spacing = 0;
    let top = 5;
    let total = 0;
    const layout = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      const visibleH = VIEW_W / (w / h);
      const next = visibleH / layers.length / VERTICAL;
      if (Math.abs(next - spacing) < 0.01) return;
      spacing = next;
      layers.forEach((l, i) => (l.baseY = -i * spacing));
      const mid = (-(layers.length - 1) * spacing) / 2;
      target.set(0, mid + 0.8, 0);
      camera.position.copy(target).addScaledVector(viewDir, camDist);
      camera.lookAt(target);
      key.position.copy(target).add(lightOffset);
      key.target.position.copy(target);
      const reach = (layers.length * spacing) / 2 + 12;
      Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: reach * 4 });
      key.shadow.camera.updateProjectionMatrix();
      top = 5;
      total = (layers.length - 1) * spacing + 10;
      beam.scale.y = total;
      beam.position.set(3.6, top - total / 2, -3.6);
      dashes.forEach((d) => {
        scene.remove(d);
        d.geometry.dispose();
      });
      dashes = [[3.2, -3.9], [3.9, -3.3]].map(([x, z]) => {
        const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, top, z), new THREE.Vector3(x, top - total, z)]), dashMat);
        l.computeLineDistances();
        scene.add(l);
        return l;
      });
    };

    start((t) => {
      layout();
      const a = Math.min(Math.max(activeRef.current, 0), layers.length - 1);
      // All layers are shown at once; they pop in together on first view and the
      // active step's layer lifts slightly.
      layers.forEach((l, i) => {
        l.lift += ((i === a ? 0.6 : 0) - l.lift) * (reduce ? 1 : 0.08);
        l.g.position.y = l.baseY + l.lift;
        const k = reduce ? 1 : pop(t, 0.1 + i * 0.12, 0.8 + i * 0.12);
        l.content.scale.setScalar(Math.max(0.001, k));
      });
      marketTick(t);
      valueTick(t);
      arrows.forEach(({ m, k }) => {
        const u = ((t * 0.05 + k / arrows.length) % 1 + 1) % 1;
        m.position.y = top - u * total;
      });
    }, 4);

    return () => {
      textures.splice(0).forEach((tx) => tx.dispose());
      dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
