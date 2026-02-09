import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Clouds, Cloud, Stars } from "@react-three/drei";
import { Color, Fog, type Points as PointsType } from "three";
import type { ThemeColors } from "./useCSSVariables";

type Props = {
  colors: ThemeColors;
  progress?: RefObject<number>;
};

const cloudConfigs = [
  { position: [-8, 1, -3] as const, bounds: [6, 2, 2] as const, segments: 12, seed: 1 },
  { position: [6, 3, -6] as const, bounds: [5, 1.5, 2] as const, segments: 10, seed: 2 },
  { position: [-3, 5, -9] as const, bounds: [7, 2, 2] as const, segments: 14, seed: 3 },
  { position: [5, 7, -12] as const, bounds: [4, 1.5, 2] as const, segments: 8, seed: 4 },
  { position: [-6, 8, -16] as const, bounds: [5, 2, 2] as const, segments: 10, seed: 5 },
];

export default function SkyEnvironment({ colors, progress }: Props) {
  const fogColor = useMemo(
    () => new Color(colors.background),
    [colors.background]
  );
  const particlesRef = useRef<PointsType>(null);
  const scene = useThree((s) => s.scene);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.01;
    }
    // Move fog with the camera so distant objects stay consistently visible
    if (scene.fog && scene.fog instanceof Fog) {
      const camZ = state.camera.position.z;
      scene.fog.near = camZ - 3;
      scene.fog.far = camZ - 28;
    }
  });

  const cloudOpacity = colors.isDark ? 0.15 : 0.4;

  return (
    <>
      {/* Fog for depth */}
      <fog attach="fog" args={[fogColor, 15, 38]} />

      {/* Lighting */}
      <ambientLight intensity={colors.isDark ? 0.4 : 0.7} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={colors.isDark ? 0.6 : 1.0}
        color={colors.isDark ? "#8888cc" : "#ffffff"}
      />
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.3}
        color={colors.gradientVia}
      />

      {/* Clouds scattered around the flight path */}
      <Clouds limit={100}>
        {cloudConfigs.map((cfg) => (
          <Cloud
            key={cfg.seed}
            seed={cfg.seed}
            position={cfg.position}
            bounds={cfg.bounds}
            segments={cfg.segments}
            volume={4}
            opacity={cloudOpacity}
            speed={0.2}
            growth={2}
            color={colors.isDark ? "#444466" : "#ffffff"}
          />
        ))}
      </Clouds>

      {/* Ambient particles / stars */}
      <Stars
        ref={particlesRef}
        radius={30}
        depth={40}
        count={colors.isDark ? 300 : 100}
        factor={2}
        saturation={0.5}
        fade
        speed={0.5}
      />
    </>
  );
}
