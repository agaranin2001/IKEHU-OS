"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { createStage } from "./stage";

type Stage = ReturnType<typeof createStage>;

const ZOOM_OUT = 1.18;

/**
 * Mounts a stage into the returned ref and runs `build`, which adds meshes
 * and returns the per-frame function. Disposes everything on unmount.
 */
export function useScene(
  options: Parameters<typeof createStage>[1],
  build: (stage: Stage) => (seconds: number) => void,
  stillAt = 6,
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    // Frame a little wider than each scene's nominal view so models sit inside the card corner.
    const [w, h] = options.view;
    const stage = createStage(mount, { ...options, view: [w * ZOOM_OUT, h * ZOOM_OUT] });
    const frame = build(stage);
    stage.start(frame, stillAt);
    return stage.dispose;
    // Scenes are built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

export type { THREE };
