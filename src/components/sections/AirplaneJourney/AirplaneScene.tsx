"use client";

import { useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import FlightPath, { useFlightCurve } from "./FlightPath";
import AirplaneModel from "./AirplaneModel";
import SkyEnvironment from "./SkyEnvironment";
import MilestoneMarker from "./MilestoneMarker";
import useCSSVariables from "./useCSSVariables";
import type { Milestone } from "./index";

/** Camera follows the airplane so every milestone has the same zoom. */
function CameraRig({ progress }: { progress: RefObject<number> }) {
  const { curve } = useFlightCurve();
  const _target = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const t = Math.max(0.001, Math.min(0.999, progress.current ?? 0));
    const pos = curve.getPointAt(t);

    // Keep a fixed offset behind/above the airplane
    const camY = pos.y + 2;
    const camZ = pos.z + 12;

    state.camera.position.y += (camY - state.camera.position.y) * 0.04;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.04;

    // Look at the airplane position
    _target.set(0, pos.y, pos.z);
    state.camera.lookAt(_target);
  });

  return null;
}

type Props = {
  milestones: Milestone[];
  progressRef: RefObject<number>;
};

export default function AirplaneScene({ milestones, progressRef }: Props) {
  const colors = useCSSVariables();

  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <CameraRig progress={progressRef} />
      <SkyEnvironment colors={colors} progress={progressRef} />

      <FlightPath progress={progressRef} color={colors.gradientFrom} />

      <AirplaneModel
        progress={progressRef}
        primaryColor={colors.primary}
        glowColor={colors.gradientFrom}
      />

      {milestones.map((milestone, i) => (
        <MilestoneMarker
          key={milestone.key}
          index={i}
          total={milestones.length}
          progress={progressRef}
          milestone={milestone}
        />
      ))}
    </Canvas>
  );
}
