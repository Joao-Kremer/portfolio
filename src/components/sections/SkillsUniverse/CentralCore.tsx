import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Mesh } from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";

type Props = {
  colors: ThemeColors;
};

export default function CentralCore({ colors }: Props) {
  const innerRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const breathe = 1 + Math.sin(t * 0.8) * 0.04;

    if (innerRef.current) {
      innerRef.current.scale.setScalar(breathe);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.4 + Math.sin(t * 0.6) * 0.08);
      const mat = glowRef.current.material as { opacity: number };
      mat.opacity = 0.12 + Math.sin(t * 1.2) * 0.04;
    }
  });

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color={colors.gradientFrom}
          emissive={colors.gradientFrom}
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color={colors.gradientVia}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light at center */}
      <pointLight
        color={colors.gradientFrom}
        intensity={colors.isDark ? 2.0 : 1.2}
        distance={30}
        decay={2}
      />
    </group>
  );
}
