import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

// 6 milestone waypoints — ascending serpentine path (compressed Z for readability)
const WAYPOINTS = [
  new Vector3(-4, -2, 0),
  new Vector3(-1, 0, -2),
  new Vector3(3, 1.5, -5),
  new Vector3(0, 3, -8),
  new Vector3(-3, 5, -11),
  new Vector3(1.5, 7, -14),
];

const CURVE_SEGMENTS = 200;

export function useFlightCurve() {
  return useMemo(() => {
    const curve = new CatmullRomCurve3(WAYPOINTS, false, "catmullrom", 0.5);
    const points = curve.getPoints(CURVE_SEGMENTS);
    return { curve, points };
  }, []);
}

export { WAYPOINTS };

type Props = {
  progress: React.RefObject<number>;
  color: string;
};

export default function FlightPath({ progress, color }: Props) {
  const { points } = useFlightCurve();
  const lineRef = useRef<{ dashOffset: number }>(null);

  // Total curve length for dash animation
  const totalLength = useMemo(() => {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += points[i].distanceTo(points[i - 1]);
    }
    return len;
  }, [points]);

  useFrame(() => {
    if (lineRef.current) {
      // Animate the dash to "draw" the line as the user scrolls
      lineRef.current.dashOffset = -(progress.current ?? 0) * totalLength;
    }
  });

  const linePoints = points.map(
    (p) => [p.x, p.y, p.z] as [number, number, number]
  );

  return (
    <Line
      ref={lineRef as never}
      points={linePoints}
      color={color}
      lineWidth={1.5}
      dashed
      dashSize={0.4}
      gapSize={0.2}
      opacity={0.35}
      transparent
    />
  );
}
