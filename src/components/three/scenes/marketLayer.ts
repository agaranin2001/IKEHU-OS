import { geoCentroid, geoEquirectangular } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/land-110m.json";
import { addMesh } from "../stage";

/**
 * Market Intelligence layer: an extruded world map with real project pins and
 * glowing trade arcs, surrounded by six floating tiles showing the hydrogen
 * value chain (renewables, production, export, suppliers, storage &
 * transport, electrolysers), each with trees and an icon badge.
 */

type Mat = (hex: number, emissive?: number, extra?: Partial<THREE.MeshPhysicalMaterialParameters>) => THREE.MeshPhysicalMaterial;

export interface MarketLayerKit {
  mat: Mat;
  soft: THREE.Material;
  gradient: (g: THREE.BufferGeometry) => THREE.BufferGeometry;
  textures: THREE.Texture[];
}

const G = {
  deep: 0x104336,
  forest: 0x16825f,
  bright: 0x12b76a,
  pale: 0xb6e3cc,
  white: 0xf6faf8,
  mint: 0x0fff87,
  water: 0x2a9d8f,
  tree: 0x2f8f5f,
};

/** Real tracked projects (dataset coordinates). */
const PINS: { lat: number; lon: number; tone: "forest" | "bright" }[] = [
  { lat: 27.95, lon: 35.3, tone: "bright" }, // NEOM
  { lat: 65.82, lon: 21.69, tone: "forest" }, // Stegra Boden
  { lat: 51.96, lon: 4.0, tone: "bright" }, // Holland Hydrogen 1
  { lat: 16.99, lon: 82.25, tone: "forest" }, // AM Green Kakinada
  { lat: 41.72, lon: 82.96, tone: "bright" }, // Sinopec Kuqa
  { lat: 37.49, lon: 141.0, tone: "forest" }, // FH2R Fukushima
  { lat: -27.71, lon: 114.16, tone: "bright" }, // Murchison
  { lat: 39.51, lon: -112.58, tone: "forest" }, // ACES Delta
  { lat: -53.16, lon: -70.91, tone: "bright" }, // HIF Haru Oni
  { lat: 29.6, lon: 32.33, tone: "forest" }, // Egypt Green Hydrogen
];
const ARCS: [number, number][] = [
  [7, 2],
  [2, 0],
  [0, 3],
  [3, 4],
  [4, 5],
  [6, 4],
  [8, 2],
  [9, 1],
];

const MAP_W = 8.4;
const projection = geoEquirectangular()
  .scale(MAP_W / (2 * Math.PI))
  .center([8, 12])
  .translate([0, 0]);

/** Lon/lat → (x, z) on the layer top. East → +x, north → −z. */
function project(lon: number, lat: number): [number, number] {
  const p = projection([lon, lat])!;
  return [p[0], p[1]];
}

function ringToPoints(ring: Position[]) {
  return ring.map(([lon, lat]) => {
    const [x, z] = project(lon, lat);
    return new THREE.Vector2(x, -z);
  });
}

function landGeometry() {
  const topo = world as unknown as Topology;
  const land = feature(topo, topo.objects.land as GeometryCollection) as unknown as FeatureCollection | Feature;
  const features = "features" in land ? land.features : [land];
  const shapes: THREE.Shape[] = [];
  for (const f of features) {
    const g = f.geometry as Polygon | MultiPolygon;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      const [, clat] = geoCentroid({ type: "Polygon", coordinates: poly });
      if (clat < -56) continue; // skip Antarctica
      const outer = ringToPoints(poly[0]);
      const xs = outer.map((v) => v.x);
      if (Math.max(...xs) - Math.min(...xs) > MAP_W * 0.6) continue; // antimeridian artefacts
      if (outer.length < 4) continue;
      const shape = new THREE.Shape(outer);
      poly.slice(1).forEach((h) => shape.holes.push(new THREE.Path(ringToPoints(h))));
      shapes.push(shape);
    }
  }
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.16, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** Circular icon badge drawn on a canvas, used as a camera-facing sprite. */
function badgeTexture(icon: "bolt" | "leaf" | "ship" | "gear" | "warning" | "check", color: string, textures: THREE.Texture[]) {
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
  switch (icon) {
    case "bolt":
      ctx.beginPath();
      [[12, -62], [-38, 8], [-2, 8], [-14, 62], [38, -10], [2, -10], [12, -62]].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
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
      ctx.beginPath();
      ctx.moveTo(-58, 10);
      ctx.lineTo(58, 10);
      ctx.lineTo(40, 44);
      ctx.lineTo(-40, 44);
      ctx.closePath();
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
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(56, 44);
      ctx.lineTo(-56, 44);
      ctx.closePath();
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
  }
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textures.push(tex);
  return tex;
}

export function buildMarketLayer(root: THREE.Group, kit: MarketLayerKit) {
  const { mat, soft, gradient, textures } = kit;
  const deep = mat(G.deep);
  const forest = mat(G.forest);
  const bright = mat(G.bright, 0.25);
  const pale = mat(G.pale);
  const white = mat(G.white);
  const leaves = mat(G.tree);
  const trunk = mat(0x6b4f3a);

  const spinners: THREE.Object3D[] = [];
  const bobbers: { o: THREE.Object3D; base: number; k: number }[] = [];

  // --- Dotted background grid
  {
    const pts: number[] = [];
    for (let x = -4.6; x <= 4.6; x += 0.22) {
      for (let z = -4.6; z <= 4.6; z += 0.22) {
        const onMap = Math.abs(x) < MAP_W / 2 + 0.35 && Math.abs(z) < (MAP_W * 140) / 720 + 0.4;
        if (!onMap && (Math.round(x * 50) + Math.round(z * 30)) % 3 === 0) pts.push(x, 0.01, z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    root.add(new THREE.Points(g, new THREE.PointsMaterial({ color: G.forest, size: 2.2, transparent: true, opacity: 0.35, sizeAttenuation: false })));
  }

  // --- Ocean panel framing the map
  const mapH = (MAP_W * 140) / 360;
  addMesh(new RoundedBoxGeometry(MAP_W + 0.5, 0.05, mapH + 0.5, 3, 0.2), mat(0xe4f4eb), root, [0, 0.025, 0.05]);
  const frame = addMesh(new RoundedBoxGeometry(MAP_W + 0.6, 0.03, mapH + 0.6, 3, 0.24), mat(G.forest, 0.15), root, [0, 0.012, 0.05]);
  frame.receiveShadow = true;

  // --- Extruded world map (soft-green tops, forest-green sides)
  const land = new THREE.Mesh(landGeometry(), [mat(0x9fdcb9, 0.12), mat(G.forest, 0.1)]);
  land.position.y = 0.05;
  land.receiveShadow = true;
  land.castShadow = true;
  root.add(land);

  // --- Pins
  const pinPos = PINS.map(({ lat, lon }) => {
    const [x, z] = project(lon, lat);
    return new THREE.Vector3(x, 0.2, z);
  });
  PINS.forEach(({ tone }, i) => {
    const p = new THREE.Group();
    p.position.copy(pinPos[i]);
    p.scale.setScalar(1.35);
    root.add(p);
    const m = tone === "bright" ? bright : forest;
    addMesh(new THREE.SphereGeometry(0.09, 18, 14), m, p, [0, 0.32, 0]);
    const tip = addMesh(new THREE.ConeGeometry(0.075, 0.2, 14), m, p, [0, 0.19, 0]);
    tip.rotation.x = Math.PI;
    addMesh(new THREE.SphereGeometry(0.035, 10, 8), white, p, [0, 0.33, 0.07]);
    const ring = addMesh(new THREE.TorusGeometry(0.1, 0.012, 6, 24), mat(G.mint, 0.6), p, [0, 0.01, 0]);
    ring.rotation.x = Math.PI / 2;
    bobbers.push({ o: p, base: p.position.y, k: i });
  });

  // --- Arcs with travelling pulses
  const arcMat = mat(G.bright, 0.6, { transparent: true, opacity: 0.75 });
  const pulseMat = mat(G.mint, 1.0);
  const arcs = ARCS.map(([a, b], i) => {
    const A = pinPos[a];
    const B = pinPos[b];
    const mid = A.clone().add(B).multiplyScalar(0.5);
    mid.y += 0.25 + A.distanceTo(B) * 0.28;
    const curve = new THREE.QuadraticBezierCurve3(A.clone().setY(0.22), mid, B.clone().setY(0.22));
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.018, 6), arcMat));
    const pulse = addMesh(new THREE.SphereGeometry(0.045, 10, 8), pulseMat, root);
    return { curve, pulse, phase: i * 0.37 };
  });

  // --- Value-chain tiles
  const tileGeo = gradient(new RoundedBoxGeometry(2.3, 0.32, 2.3, 3, 0.12));
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
    addMesh(new THREE.CylinderGeometry(0.02 * s, 0.025 * s, 0.1 * s, 6), trunk, p, [x, 0.05 * s, z]);
    addMesh(new THREE.ConeGeometry(0.1 * s, 0.22 * s, 10), leaves, p, [x, 0.2 * s, z]);
    addMesh(new THREE.ConeGeometry(0.075 * s, 0.17 * s, 10), leaves, p, [x, 0.3 * s, z]);
  };
  const badge = (p: THREE.Object3D, icon: Parameters<typeof badgeTexture>[0], color: string, pos: [number, number, number]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture(icon, color, textures), depthWrite: false }));
    s.scale.set(0.5, 0.5, 1);
    s.position.set(...pos);
    p.add(s);
    bobbers.push({ o: s, base: pos[1], k: bobbers.length });
  };

  // 1 Renewable power — turbines, solar array, containers.
  {
    const t = tile(-3.4, -3.75);
    [[-0.55, -0.45], [-0.15, -0.75]].forEach(([x, z]) => {
      addMesh(new THREE.CylinderGeometry(0.025, 0.04, 1.3, 10), white, t, [x, 0.65, z]);
      const hub = new THREE.Group();
      hub.position.set(x + 0.06, 1.3, z);
      t.add(hub);
      addMesh(new RoundedBoxGeometry(0.16, 0.08, 0.08, 2, 0.02), white, hub, [-0.04, 0, 0]);
      const rotor = new THREE.Group();
      rotor.position.x = 0.04;
      hub.add(rotor);
      for (let b = 0; b < 3; b++) {
        const blade = addMesh(new RoundedBoxGeometry(0.025, 0.6, 0.06, 1, 0.01), pale, rotor);
        blade.geometry.translate(0, 0.3, 0);
        blade.rotation.x = (b * Math.PI * 2) / 3;
      }
      spinners.push(rotor);
    });
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const panel = addMesh(new RoundedBoxGeometry(0.36, 0.03, 0.26, 1, 0.01), deep, t, [0.1 + c * 0.38, 0.2, 0.05 + r * 0.32]);
        panel.rotation.z = 0.35;
        addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), white, t, [0.1 + c * 0.38, 0.08, 0.05 + r * 0.32]);
      }
    [[-0.5, 0.5], [-0.15, 0.62]].forEach(([x, z]) => addMesh(new RoundedBoxGeometry(0.3, 0.22, 0.42, 2, 0.03), white, t, [x, 0.11, z]));
    tree(t, -0.85, 0.85);
    tree(t, 0.85, -0.85, 0.9);
    badge(t, "bolt", "#16825f", [0.75, 1.0, -0.3]);
  }
  // 2 Hydrogen production plant — columns, H2 tank, pipes.
  {
    const t = tile(0, -3.75);
    [[-0.55, -0.4, 0.9], [-0.3, -0.6, 1.1], [-0.05, -0.75, 0.8]].forEach(([x, z, h]) => {
      addMesh(new THREE.CylinderGeometry(0.12, 0.12, h, 18), white, t, [x, h / 2, z]);
      const band = addMesh(new THREE.TorusGeometry(0.122, 0.015, 6, 24), mat(G.bright, 0.4), t, [x, h * 0.7, z]);
      band.rotation.x = Math.PI / 2;
    });
    const tank = addMesh(new THREE.CapsuleGeometry(0.28, 0.6, 8, 24), white, t, [0.3, 0.32, 0.25]);
    tank.rotation.z = Math.PI / 2;
    const tb = addMesh(new THREE.TorusGeometry(0.285, 0.02, 8, 28), mat(G.bright, 0.4), t, [0.3, 0.32, 0.25]);
    tb.rotation.y = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 18), pale, t, [0.65, 0.25, -0.45]);
    const pipe = addMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), forest, t, [0.05, 0.55, -0.15]);
    pipe.rotation.z = Math.PI / 2;
    tree(t, -0.85, 0.75);
    tree(t, 0.85, 0.8, 0.9);
    badge(t, "leaf", "#12b76a", [0.6, 1.25, -0.6]);
  }
  // 3 Export terminal — spherical tanks, jetty, ship on water.
  {
    const t = tile(3.4, -3.75);
    addMesh(new RoundedBoxGeometry(2.24, 0.03, 1.0, 2, 0.08), mat(G.water, 0.1), t, [0, 0.015, 0.62]);
    [[-0.6, -0.55], [-0.15, -0.6], [0.3, -0.62]].forEach(([x, z]) => {
      addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), white, t, [x, 0.09, z]);
      addMesh(new THREE.SphereGeometry(0.21, 24, 18), white, t, [x, 0.38, z]);
      const b = addMesh(new THREE.TorusGeometry(0.212, 0.014, 6, 28), mat(G.bright, 0.4), t, [x, 0.38, z]);
      b.rotation.x = Math.PI / 2;
    });
    addMesh(new THREE.BoxGeometry(1.6, 0.05, 0.12), white, t, [0, 0.12, 0.1]);
    const ship = new THREE.Group();
    ship.position.set(0.1, 0.06, 0.62);
    t.add(ship);
    addMesh(new RoundedBoxGeometry(1.3, 0.16, 0.34, 2, 0.06), forest, ship, [0, 0.08, 0]);
    addMesh(new RoundedBoxGeometry(1.2, 0.04, 0.28, 2, 0.02), white, ship, [0, 0.18, 0]);
    addMesh(new RoundedBoxGeometry(0.22, 0.2, 0.26, 2, 0.03), white, ship, [0.48, 0.3, 0]);
    [-0.35, -0.05, 0.25].forEach((x) => addMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), pale, ship, [x, 0.23, 0]));
    bobbers.push({ o: ship, base: ship.position.y, k: 3 });
    badge(t, "ship", "#16825f", [0.75, 0.95, -0.55]);
  }
  // 4 Suppliers & manufacturing — factory with chimneys.
  {
    const t = tile(-3.4, 3.75);
    addMesh(new RoundedBoxGeometry(1.0, 0.45, 0.8, 2, 0.04), white, t, [-0.2, 0.22, -0.2]);
    addMesh(new RoundedBoxGeometry(0.55, 0.3, 0.55, 2, 0.04), pale, t, [0.5, 0.15, -0.35]);
    [[-0.55, -0.45], [-0.35, -0.5]].forEach(([x, z]) => addMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 12), deep, t, [x, 0.65, z]));
    for (let k = 0; k < 3; k++) addMesh(new RoundedBoxGeometry(0.22, 0.22, 0.22, 2, 0.03), k === 1 ? forest : pale, t, [0.2 + k * 0.25, 0.11, 0.45]);
    tree(t, -0.85, 0.8);
    tree(t, 0.85, -0.85, 0.85);
    badge(t, "gear", "#16825f", [0.7, 0.9, 0.1]);
  }
  // 5 Storage & transport — tube tanks and an H2 truck.
  {
    const t = tile(0, 3.75);
    [-0.45, -0.1, 0.25].forEach((z) => {
      const tube = addMesh(new THREE.CapsuleGeometry(0.14, 0.8, 6, 20), white, t, [-0.25, 0.2, z]);
      tube.rotation.z = Math.PI / 2;
      const b = addMesh(new THREE.TorusGeometry(0.142, 0.012, 6, 20), mat(G.bright, 0.4), t, [-0.25, 0.2, z]);
      b.rotation.y = Math.PI / 2;
    });
    const truck = new THREE.Group();
    truck.position.set(0.15, 0, 0.7);
    t.add(truck);
    addMesh(new RoundedBoxGeometry(0.22, 0.22, 0.26, 2, 0.04), white, truck, [0.45, 0.15, 0]);
    const trailer = addMesh(new THREE.CapsuleGeometry(0.1, 0.5, 6, 16), pale, truck, [0.05, 0.17, 0]);
    trailer.rotation.z = Math.PI / 2;
    [-0.2, 0.15, 0.45].forEach((x) => {
      const w = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 12), deep, truck, [x, 0.05, 0]);
      w.rotation.x = Math.PI / 2;
    });
    tree(t, 0.85, -0.85);
    tree(t, 0.75, -0.55, 0.8);
    badge(t, "warning", "#e5533d", [0.55, 0.95, -0.4]);
  }
  // 6 Electrolyser park — grid of containers with fans.
  {
    const t = tile(3.4, 3.75);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const x = -0.55 + c * 0.42;
        const z = -0.35 + r * 0.55;
        addMesh(new RoundedBoxGeometry(0.34, 0.4 + ((r + c) % 2) * 0.15, 0.44, 2, 0.04), (r + c) % 3 === 0 ? pale : white, t, [x, 0.2 + ((r + c) % 2) * 0.075, z]);
        addMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 14), deep, t, [x, 0.42 + ((r + c) % 2) * 0.15, z]);
      }
    tree(t, -0.85, 0.85);
    tree(t, 0.8, 0.85, 0.9);
    badge(t, "check", "#12b76a", [0.6, 1.0, 0.2]);
  }

  return (t: number) => {
    spinners.forEach((r) => (r.rotation.x = t * 2));
    bobbers.forEach(({ o, base, k }) => (o.position.y = base + Math.sin(t * 1.8 + k) * 0.03));
    arcs.forEach(({ curve, pulse, phase }) => {
      const u = (t * 0.35 + phase) % 1;
      pulse.position.copy(curve.getPoint(u));
    });
  };
}
