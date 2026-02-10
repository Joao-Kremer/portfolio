"use client";

import { useMemo, Suspense, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";
import PhotoCard from "./PhotoCard";
import GalleryEnvironment from "./GalleryEnvironment";
import useCSSVariables from "@/components/sections/AirplaneJourney/useCSSVariables";
import type { GalleryItemWithI18n } from "./useGalleryData";

export const PHOTO_POSITIONS: {
  pos: [number, number, number];
  rot: [number, number, number];
}[] = [
  { pos: [0, 0, 0], rot: [0, 0.04, 0.01] },
  { pos: [0.3, 0.1, -8], rot: [0, -0.03, -0.01] },
  { pos: [-0.2, -0.05, -16], rot: [0, 0.03, 0.01] },
  { pos: [0.15, 0.08, -24], rot: [0, -0.04, -0.008] },
  { pos: [-0.1, 0, -32], rot: [0, 0.03, 0.01] },
  { pos: [0.2, -0.06, -40], rot: [0, -0.03, -0.01] },
  { pos: [-0.15, 0.1, -48], rot: [0, 0.04, 0.008] },
  { pos: [0.1, 0, -56], rot: [0, -0.03, -0.01] },
  { pos: [0, 0.05, -64], rot: [0, 0.02, 0.005] },
];

const CAMERA_WAYPOINTS = [
  new Vector3(0, 0, 8),
  new Vector3(0, 0.1, 2),
  new Vector3(0, 0, -6),
  new Vector3(0, 0.1, -14),
  new Vector3(0, 0, -22),
  new Vector3(0, 0.1, -30),
  new Vector3(0, 0, -38),
  new Vector3(0, 0.1, -46),
  new Vector3(0, 0, -54),
  new Vector3(0, 0.1, -62),
  new Vector3(0, 0, -70),
];

function useGalleryCurve() {
  return useMemo(() => {
    const curve = new CatmullRomCurve3(
      CAMERA_WAYPOINTS,
      false,
      "catmullrom",
      0.3
    );
    return { curve };
  }, []);
}

function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const { curve } = useGalleryCurve();
  const _lookTarget = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = Math.max(0.001, Math.min(0.999, progressRef.current ?? 0));
    const camPos = curve.getPointAt(t);

    // Subtle cinematic horizontal sway
    const elapsed = state.clock.elapsedTime;
    const swayX = Math.sin(elapsed * 0.15) * 0.12;
    const swayY = Math.cos(elapsed * 0.1) * 0.06;

    state.camera.position.x +=
      (camPos.x + swayX - state.camera.position.x) * 0.05;
    state.camera.position.y +=
      (camPos.y + swayY - state.camera.position.y) * 0.05;
    state.camera.position.z += (camPos.z - state.camera.position.z) * 0.05;

    _lookTarget.set(
      state.camera.position.x * 0.3,
      state.camera.position.y * 0.3,
      state.camera.position.z - 10
    );
    state.camera.lookAt(_lookTarget);
  });

  return null;
}

type Props = {
  items: GalleryItemWithI18n[];
  progressRef: RefObject<number>;
};

export default function GalleryScene({ items, progressRef }: Props) {
  const colors = useCSSVariables();

  const milestoneTs = useMemo(
    () => PHOTO_POSITIONS.map((_, i) => (i + 0.5) / PHOTO_POSITIONS.length),
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <CameraRig progressRef={progressRef} />
      <GalleryEnvironment colors={colors} />

      <Suspense fallback={null}>
        {items.map((item, i) => {
          const layout = PHOTO_POSITIONS[i];
          if (!layout) return null;
          return (
            <PhotoCard
              key={item.id}
              item={item}
              index={i}
              position={layout.pos}
              rotation={layout.rot}
              progressRef={progressRef}
              milestoneT={milestoneTs[i]}
              colors={colors}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}
