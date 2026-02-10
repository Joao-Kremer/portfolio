import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";
import { type RingConfig, getRingPoints, getCategoryFocus, getCategoryColor, getActiveCategoryIndex } from "./orbitalMath";

type Props = {
  config: RingConfig;
  ringIndex: number;
  colors: ThemeColors;
  progressRef: React.RefObject<number>;
};

export default function OrbitalRing({ config, ringIndex, colors, progressRef }: Props) {
  const opacityRef = useRef(0.12);
  const widthRef = useRef(1.2);
  const lineRef = useRef<{ material: { opacity: number; linewidth?: number } }>(null);
  const connRef = useRef<{ material: { opacity: number } }>(null);

  const ringPoints = useMemo(
    () => getRingPoints(config.radius, config.tiltRad, 120),
    [config.radius, config.tiltRad]
  );

  const connectionPoints = useMemo(() => {
    const ringPoint = new Vector3(config.radius, 0, 0);
    return [new Vector3(0, 0, 0), ringPoint];
  }, [config.radius]);

  const ringColor = useMemo(
    () => "#" + getCategoryColor(ringIndex, colors).getHexString(),
    [ringIndex, colors]
  );

  useFrame(() => {
    const progress = progressRef.current ?? 0;
    const focus = getCategoryFocus(progress, ringIndex);
    const anyActive = getActiveCategoryIndex(progress) >= 0;
    const dimmed = anyActive && focus === 0;

    // Active ring: bright. Dimmed: very faint. Default: subtle
    const targetOpacity = dimmed ? 0.04 : 0.1 + focus * 0.6;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.08;

    if (lineRef.current) {
      lineRef.current.material.opacity = opacityRef.current;
    }
    if (connRef.current) {
      connRef.current.material.opacity = dimmed ? 0.01 : opacityRef.current * 0.4;
    }
  });

  return (
    <group>
      {/* Orbital path */}
      <Line
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={lineRef as any}
        points={ringPoints}
        color={ringColor}
        lineWidth={1.2}
        transparent
        opacity={0.12}
      />

      {/* Connection to center */}
      <Line
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={connRef as any}
        points={connectionPoints}
        color={ringColor}
        lineWidth={0.8}
        transparent
        opacity={0.05}
      />
    </group>
  );
}
