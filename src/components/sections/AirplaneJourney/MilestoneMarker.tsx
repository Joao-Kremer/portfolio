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

  // Card on the opposite side of the waypoint
  const isWaypointLeft = WAYPOINTS[index].x <= 0;
  const cardOnRight = isWaypointLeft;

  const position = useMemo(() => {
    const basePos = WAYPOINTS[index].clone();
    if (compact) {
      return new Vector3(0, basePos.y + 0.5, basePos.z);
    }
    const cardX = cardOnRight ? 1.5 : -1.5;
    return new Vector3(cardX, basePos.y + 0.5, basePos.z);
  }, [index, cardOnRight, compact]);

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

  useFrame(() => {
    const p = progress.current ?? 0;
    const dist = p - milestoneT;
    let targetOpacity = 0;

    if (dist > -0.06 && dist < 0.12) {
      targetOpacity = Math.min(1, (dist + 0.06) / 0.05);
    } else if (dist >= 0.12) {
      targetOpacity = Math.max(0, 1 - (dist - 0.12) / 0.06);
    }

    const smoothed =
      prevOpacity.current + (targetOpacity - prevOpacity.current) * 0.08;
    prevOpacity.current = smoothed;

    const rounded = Math.round(smoothed * 100) / 100;
    if (Math.abs(rounded - opacity) > 0.01) {
      setOpacity(rounded);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        center={!compact}
        style={
          compact
            ? {
                position: "fixed",
                left: "50%",
                bottom: "20%",
                transform: `translateX(-50%) translateY(${(1 - opacity) * 20}px)`,
                width: "min(280px, 80vw)",
                pointerEvents: "none" as const,
                opacity,
                transition: "none",
              }
            : {
                width: "340px",
                pointerEvents: "none" as const,
                opacity,
                transform: `translateY(${(1 - opacity) * 20}px)`,
                transition: "none",
              }
        }
        as="div"
      >
        <div
          className={`rounded-2xl border border-border/50 bg-card/95 shadow-lg shadow-primary/10 backdrop-blur-md ${
            compact ? "p-3 text-center" : `p-5 ${cardOnRight ? "text-left" : "text-right"}`
          }`}
        >
          <span
            className={`inline-block rounded-full bg-primary/10 font-semibold text-primary ${
              compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
            }`}
          >
            {milestone.time}
          </span>
          <h4
            className={`font-bold text-foreground ${
              compact ? "mt-1 text-sm" : "mt-2 text-base"
            }`}
          >
            {milestone.title}
          </h4>
          <p
            className={`leading-relaxed text-muted-foreground ${
              compact ? "mt-0.5 text-xs" : "mt-1 text-sm"
            }`}
          >
            {milestone.description}
          </p>
        </div>
      </Html>
    </group>
  );
}
