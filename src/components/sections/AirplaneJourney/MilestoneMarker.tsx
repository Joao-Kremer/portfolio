import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, Group } from "three";
import { useFlightCurve, WAYPOINTS } from "./FlightPath";
import type { Milestone } from "./index";

type Props = {
  index: number;
  total: number;
  progress: React.RefObject<number>;
  milestone: Milestone;
  compact?: boolean;
};

export default function MilestoneMarker({
  index,
  total,
  progress,
  milestone,
  compact = false,
}: Props) {
  const { curve } = useFlightCurve();
  const groupRef = useRef<Group>(null);
  const [opacity, setOpacity] = useState(0);
  const prevOpacity = useRef(0);

  const isLeft = index % 2 === 0;

  // Position: at the waypoint, offset laterally (less on mobile)
  const position = useMemo(() => {
    const basePos = WAYPOINTS[index].clone();
    const offset = isLeft ? (compact ? -1.5 : -3) : (compact ? 1.5 : 3);
    return new Vector3(basePos.x + offset, basePos.y + 0.5, basePos.z);
  }, [index, isLeft, compact]);

  // The progress value when the airplane reaches this milestone
  const milestoneT = useMemo(() => {
    const target = WAYPOINTS[index];
    let bestT = index / (total - 1);
    let bestDist = Infinity;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const p = curve.getPointAt(t);
      const d = p.distanceTo(target);
      if (d < bestDist) {
        bestDist = d;
        bestT = t;
      }
    }
    return bestT;
  }, [index, total, curve]);

  // useFrame runs inside R3F context — update opacity state here
  useFrame(() => {
    const p = progress.current ?? 0;
    const dist = p - milestoneT;
    let targetOpacity = 0;

    if (dist > -0.06 && dist < 0.12) {
      // Fade in quickly
      targetOpacity = Math.min(1, (dist + 0.06) / 0.05);
    } else if (dist >= 0.12) {
      // Fade out quickly so only one card is visible at a time
      targetOpacity = Math.max(0, 1 - (dist - 0.12) / 0.06);
    }

    const smoothed =
      prevOpacity.current + (targetOpacity - prevOpacity.current) * 0.08;
    prevOpacity.current = smoothed;

    // Only trigger React re-render when opacity changes meaningfully
    const rounded = Math.round(smoothed * 100) / 100;
    if (Math.abs(rounded - opacity) > 0.01) {
      setOpacity(rounded);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        style={{
          width: compact ? "min(240px, 70vw)" : "340px",
          pointerEvents: "none",
          opacity,
          transform: `translateY(${(1 - opacity) * 20}px)`,
          transition: "none",
        }}
        as="div"
      >
        <div
          className={`rounded-2xl border border-border/50 bg-card/95 shadow-lg shadow-primary/10 backdrop-blur-md ${
            compact ? "p-3" : "p-5"
          } ${isLeft ? "text-right" : "text-left"}`}
        >
          <span className={`inline-block rounded-full bg-primary/10 font-semibold text-primary ${
            compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
          }`}>
            {milestone.time}
          </span>
          <h4 className={`font-bold text-foreground ${compact ? "mt-1 text-sm" : "mt-2 text-base"}`}>
            {milestone.title}
          </h4>
          <p className={`leading-relaxed text-muted-foreground ${
            compact ? "mt-0.5 text-[11px] line-clamp-3" : "mt-1 text-sm"
          }`}>
            {milestone.description}
          </p>
        </div>
      </Html>
    </group>
  );
}
