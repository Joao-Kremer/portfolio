import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color, Vector3 } from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";
import {
  RING_CONFIGS,
  TOTAL_SKILLS,
  getNodePosition,
  getSkillAngle,
  getCategoryFocus,
  getCategoryColor,
} from "./orbitalMath";

type Props = {
  colors: ThemeColors;
  progressRef: React.RefObject<number>;
};

type SkillMapping = {
  ringIndex: number;
  angleIndex: number;
  totalInRing: number;
  radius: number;
  tiltRad: number;
  rotSpeed: number;
};

export default function SkillNodes({ colors, progressRef }: Props) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const tempPos = useMemo(() => new Vector3(), []);

  // Pre-compute mapping: which skill goes to which ring
  const skillMap = useMemo<SkillMapping[]>(() => {
    const map: SkillMapping[] = [];
    for (const ring of RING_CONFIGS) {
      for (let i = 0; i < ring.skillCount; i++) {
        map.push({
          ringIndex: RING_CONFIGS.indexOf(ring),
          angleIndex: i,
          totalInRing: ring.skillCount,
          radius: ring.radius,
          tiltRad: ring.tiltRad,
          rotSpeed: ring.rotSpeed,
        });
      }
    }
    return map;
  }, []);

  // Pre-allocate colors array
  const colorCache = useMemo(() => {
    return RING_CONFIGS.map((_, i) => getCategoryColor(i, colors));
  }, [colors]);

  const tempColor = useMemo(() => new Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const elapsed = clock.elapsedTime;
    const progress = progressRef.current ?? 0;

    for (let i = 0; i < TOTAL_SKILLS; i++) {
      const { ringIndex, angleIndex, totalInRing, radius, tiltRad, rotSpeed } = skillMap[i];

      // Orbital rotation
      const angle = getSkillAngle(angleIndex, totalInRing, elapsed * rotSpeed);
      getNodePosition(radius, tiltRad, angle, tempPos);

      // Scale: bigger when in focus
      const focus = getCategoryFocus(progress, ringIndex);
      const baseSize = 0.18;
      const focusScale = 1 + focus * 0.8;

      dummy.position.copy(tempPos);
      dummy.scale.setScalar(baseSize * focusScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color with brightness boost on focus
      tempColor.copy(colorCache[ringIndex]);
      if (focus > 0) {
        tempColor.lerp(new Color("#ffffff"), focus * 0.3);
      }
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL_SKILLS]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        emissive={colors.gradientFrom}
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
        metalness={0.1}
        roughness={0.5}
      />
    </instancedMesh>
  );
}
