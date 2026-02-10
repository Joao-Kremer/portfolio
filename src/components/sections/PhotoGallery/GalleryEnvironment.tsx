import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Line } from "@react-three/drei";
import {
  Color,
  Fog,
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type Points as PointsType,
} from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";
import { PHOTO_POSITIONS } from "./GalleryScene";

type Props = {
  colors: ThemeColors;
};

export default function GalleryEnvironment({ colors }: Props) {
  const fogColor = useMemo(
    () => new Color(colors.background),
    [colors.background]
  );
  const scene = useThree((s) => s.scene);
  const particlesRef = useRef<PointsType>(null);
  const bokehRef = useRef<PointsType>(null);

  // Fine dust particles
  const particleGeo = useMemo(() => {
    const count = colors.isDark ? 400 : 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 10;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = -Math.random() * 75;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [colors.isDark]);

  // Large bokeh / floating light orbs
  const bokehGeo = useMemo(() => {
    const count = colors.isDark ? 60 : 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 7;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = -Math.random() * 70;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [colors.isDark]);

  const connectionPoints = useMemo(
    () => PHOTO_POSITIONS.map((p) => p.pos as [number, number, number]),
    []
  );

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.005;
    }
    if (bokehRef.current) {
      bokehRef.current.rotation.y -= delta * 0.003;
      // Gentle vertical float
      bokehRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
    if (scene.fog && scene.fog instanceof Fog) {
      const camZ = state.camera.position.z;
      scene.fog.near = camZ - 4;
      scene.fog.far = camZ - 25;
    }
  });

  return (
    <>
      <fog attach="fog" args={[fogColor, 8, 35]} />

      {/* Cinematic lighting */}
      <ambientLight intensity={colors.isDark ? 0.4 : 0.7} />
      <directionalLight
        position={[5, 12, 8]}
        intensity={colors.isDark ? 0.7 : 1.1}
        color={colors.isDark ? "#8888cc" : "#ffffff"}
      />
      <directionalLight
        position={[-4, 6, -5]}
        intensity={0.2}
        color={colors.gradientVia}
      />
      {/* Accent rim light */}
      <pointLight
        position={[3, 2, 0]}
        intensity={colors.isDark ? 0.4 : 0.2}
        color={colors.gradientFrom}
        distance={20}
        decay={2}
      />

      {/* Subtle connecting thread */}
      <Line
        points={connectionPoints}
        color={colors.gradientFrom}
        lineWidth={0.8}
        opacity={0.08}
        transparent
        dashed
        dashSize={0.4}
        gapSize={0.3}
      />

      {/* Fine dust particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.02}
          color={colors.gradientTo}
          transparent
          opacity={colors.isDark ? 0.45 : 0.2}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Large bokeh orbs */}
      <points ref={bokehRef} geometry={bokehGeo}>
        <pointsMaterial
          size={0.12}
          color={colors.gradientFrom}
          transparent
          opacity={colors.isDark ? 0.15 : 0.08}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Deep starfield */}
      <Stars
        radius={30}
        depth={50}
        count={colors.isDark ? 250 : 80}
        factor={1.2}
        saturation={0.3}
        fade
        speed={0.2}
      />
    </>
  );
}
