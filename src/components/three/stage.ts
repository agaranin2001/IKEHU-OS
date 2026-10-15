import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Ported from the NordicAI v2 lab scenes.
 *
 * Shared scaffolding for the isometric lab scenes: a transparent renderer (the
 * page supplies the background), an orthographic camera down the (1, 1, 1)
 * diagonal — world -x reads upper-left, -z upper-right, +z lower-left — a
 * room environment for glossy reflections, a shadow-casting key light and a
 * ground that only catches shadows. The camera frustum refits to whatever box
 * the scene is mounted in so `view` always fits.
 */
export function createStage(
  mount: HTMLElement,
  options: {
    view: [number, number]
    target: THREE.Vector3Tuple
    groundY: number
    shadowOpacity?: number
    /** Camera direction from the target; the isometric (1, 1, 1) by default. */
    direction?: THREE.Vector3Tuple
    /** Vertical field of view in degrees for a perspective camera; orthographic when omitted. */
    fov?: number
    /** Cap on device pixel ratio (large canvases); 2 by default. */
    maxPixelRatio?: number
  },
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.maxPixelRatio ?? 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envTarget.texture
  scene.environmentIntensity = 0.7

  const target = new THREE.Vector3(...options.target)
  const { fov } = options
  const camera = fov
    ? new THREE.PerspectiveCamera(fov, 1, 0.1, 200)
    : new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  const viewDir = new THREE.Vector3(...(options.direction ?? [1, 1, 1])).normalize()
  camera.position.copy(target).addScaledVector(viewDir, 12 * Math.sqrt(3))
  camera.lookAt(target)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: options.shadowOpacity ?? 0.16 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = options.groundY
  ground.receiveShadow = true
  scene.add(ground)

  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(-6, 14, 3)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 5
  key.shadow.bias = -0.0004
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 })
  scene.add(key)
  scene.add(new THREE.AmbientLight(0xf1fff6, 0.4))

  const [viewW, viewH] = options.view
  function resize() {
    const { clientWidth: w, clientHeight: h } = mount
    if (!w || !h) return
    renderer.setSize(w, h)
    const aspect = w / h
    const halfH = aspect > viewW / viewH ? viewH / 2 : viewW / 2 / aspect
    if (camera instanceof THREE.PerspectiveCamera) {
      // Back off until `view` fits at the target's depth.
      camera.aspect = aspect
      camera.position.copy(target).addScaledVector(viewDir, halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
    } else {
      const halfW = halfH * aspect
      Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH })
    }
    camera.updateProjectionMatrix()
    // A still (reduced-motion) scene has no loop to pick the new size up.
    redrawStill?.()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(mount)

  let redrawStill: (() => void) | null = null
  let visibility: IntersectionObserver | null = null

  /**
   * Runs `frame(seconds)` every frame while the scene is on screen, pausing
   * when it scrolls out of view so several scenes on one page cost nothing
   * off-screen. `seconds` counts from when the scene was first seen. Under
   * reduced motion it draws the single moment `stillAt`.
   */
  function start(frame: (seconds: number) => void, stillAt = 0) {
    const draw = (seconds: number) => {
      frame(seconds)
      renderer.render(scene, camera)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      redrawStill = () => draw(stillAt)
      resize()
      return
    }
    resize()
    // The clock starts the first time the scene is seen, so an entrance
    // sequence at seconds 0… plays when someone is actually looking.
    let origin: number | null = null
    visibility = new IntersectionObserver(([entry]) => {
      renderer.setAnimationLoop(
        entry.isIntersecting
          ? (ms) => {
              origin ??= ms
              draw((ms - origin) / 1000)
            }
          : null,
      )
    })
    visibility.observe(mount)
  }

  function dispose() {
    renderer.setAnimationLoop(null)
    observer.disconnect()
    visibility?.disconnect()
    scene.traverse((object) => {
      if (!('geometry' in object)) return
      ;(object.geometry as THREE.BufferGeometry).dispose()
      const material = (object as THREE.Mesh).material
      for (const m of Array.isArray(material) ? material : [material]) {
        ;(m as THREE.SpriteMaterial).map?.dispose()
        m.dispose()
      }
    })
    envTarget.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { scene, camera, target, viewDir, key, start, dispose }
}

/** Adds a mesh that casts and receives shadows. */
export function addMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  parent: THREE.Object3D,
  position?: THREE.Vector3Tuple,
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (position) mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}

/**
 * Returns `outlined(mesh, creases?)`, which gives a mesh the illustration look:
 * a back-face shell `width` thick for the silhouette, plus crease lines on
 * sharp edges (skip them for rounded geometry, where every facet would show).
 */
export function createOutliner(color: THREE.ColorRepresentation, width: number) {
  const shellMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
  const lineMaterial = new THREE.LineBasicMaterial({ color })
  return function outlined<T extends THREE.Mesh>(mesh: T, creases = true) {
    mesh.geometry.computeBoundingBox()
    const size = mesh.geometry.boundingBox!.getSize(new THREE.Vector3())
    const shell = new THREE.Mesh(mesh.geometry, shellMaterial)
    shell.scale.set(
      1 + (2 * width) / Math.max(size.x, 0.01),
      1 + (2 * width) / Math.max(size.y, 0.01),
      1 + (2 * width) / Math.max(size.z, 0.01),
    )
    mesh.add(shell)
    if (creases) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 35), lineMaterial))
    return mesh
  }
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** 0 → 1 across [a, b] with smoothstep easing. */
export function span(t: number, a: number, b: number) {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}

/** 0 → 1 across [a, b] with a small overshoot, for things popping in. */
export function pop(t: number, a: number, b: number) {
  const x = clamp01((t - a) / (b - a))
  const c = 1.9
  return x === 0 ? 0 : 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
}
