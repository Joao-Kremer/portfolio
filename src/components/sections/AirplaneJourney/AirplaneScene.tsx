"use client";

import { useMemo, useState, useEffect, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import FlightPath, { useFlightCurve } from "./FlightPath";
import AirplaneModel from "./AirplaneModel";
import SkyEnvironment from "./SkyEnvironment";
import MilestoneMarker from "./MilestoneMarker";
import useCSSVariables from "./useCSSVariables";
import type { Milestone } from "./index";

/** Camera follows the airplane — adapts offset/FOV to screen width. */
function CameraRig({ progress }: { progress: RefObject<number> }) {
  const { curve } = useFlightCurve();
  const _target = useMemo(() => new Vector3(), []);
  const { size, camera } = useThree();

  // Wider FOV + further camera on narrow screens
  const isNarrow = size.width < 768;

  useFrame((state) => {
    const t = Math.max(0.001, Math.min(0.999, progress.current ?? 0));
    const pos = curve.getPointAt(t);

    const camY = pos.y + (isNarrow ? 3 : 2);
    const camZ = pos.z + (isNarrow ? 16 : 12);

    state.camera.position.y += (camY - state.camera.position.y) * 0.04;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.04;

    // Smoothly adjust FOV on mobile
    const targetFov = isNarrow ? 65 : 55;
    const cam = camera as { fov: number; updateProjectionMatrix: () => void };
    cam.fov += (targetFov - cam.fov) * 0.05;
    cam.updateProjectionMatrix();

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
          compact={isMobile}
        />
      ))}
    </Canvas>
  );
}
