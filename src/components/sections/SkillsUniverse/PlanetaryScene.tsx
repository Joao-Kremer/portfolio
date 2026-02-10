"use client";

import { useRef, useMemo, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import useCSSVariables from "@/components/sections/AirplaneJourney/useCSSVariables";
import { RING_CONFIGS, cameraCurve, getActiveCategoryIndex } from "./orbitalMath";
import CentralCore from "./CentralCore";
import OrbitalRing from "./OrbitalRing";
import SkillNodes from "./SkillNodes";
import OrbitalEnvironment from "./OrbitalEnvironment";

/* ───── Camera Rig ───── */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const target = useMemo(() => new Vector3(), []);
  const smoothTarget = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = Math.max(0.001, Math.min(0.999, progressRef.current ?? 0));
    const camPos = cameraCurve.getPointAt(t);

    // Smooth camera position
    state.camera.position.x += (camPos.x - state.camera.position.x) * 0.06;
    state.camera.position.y += (camPos.y - state.camera.position.y) * 0.06;
    state.camera.position.z += (camPos.z - state.camera.position.z) * 0.06;

    // LookAt: always look at the center of the system
    target.set(0, 0, 0);
    smoothTarget.lerp(target, 0.05);
    state.camera.lookAt(smoothTarget);
  });

  return null;
}

/* ───── Scene ───── */
type SceneProps = {
  progressRef: RefObject<number>;
};

export default function PlanetaryScene({ progressRef }: SceneProps) {
  const colors = useCSSVariables();

  return (
    <Canvas
      camera={{ position: [0, 12, 25], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <CameraRig progressRef={progressRef} />
      <OrbitalEnvironment colors={colors} progressRef={progressRef} />
      <CentralCore colors={colors} />
      {RING_CONFIGS.map((config, i) => (
        <OrbitalRing
          key={config.key}
          config={config}
          ringIndex={i}
          colors={colors}
          progressRef={progressRef}
        />
      ))}
      <SkillNodes colors={colors} progressRef={progressRef} />
    </Canvas>
  );
}
