import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Points, BufferGeometry, Float32BufferAttribute, AdditiveBlending, PointsMaterial } from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";

type Props = {
  colors: ThemeColors;
  progressRef: React.RefObject<number>;
};

export default function OrbitalEnvironment({ colors, progressRef }: Props) {
  const particlesRef = useRef<Points>(null);
  const fogRef = useRef<{ color: { set: (c: string) => void }; near: number; far: number }>(null);

  // Floating particles scattered in a sphere
  const particleGeometry = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ camera, clock }) => {
    // Rotate particles slowly
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.005;
      particlesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.003) * 0.1;
    }

    // Dynamic fog follows camera
    if (fogRef.current) {
      fogRef.current.color.set(colors.background);
      const camZ = camera.position.z;
      fogRef.current.near = camZ - 5;
      fogRef.current.far = camZ + 35;
    }
  });

  return (
    <>
      {/* Fog */}
      <fog ref={fogRef} attach="fog" args={[colors.background, 15, 45]} />

      {/* Ambient light */}
      <ambientLight intensity={colors.isDark ? 0.4 : 0.7} />

      {/* Main directional */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={colors.isDark ? 0.6 : 1.0}
        color={colors.isDark ? "#8888cc" : "#ffffff"}
      />

      {/* Fill light with gradient tint */}
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.3}
        color={colors.gradientVia}
      />

      {/* Stars background */}
      <Stars
        radius={30}
        depth={40}
        count={colors.isDark ? 250 : 80}
        factor={2.5}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Floating particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.08}
          color={colors.gradientTo}
          transparent
          opacity={colors.isDark ? 0.4 : 0.2}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
