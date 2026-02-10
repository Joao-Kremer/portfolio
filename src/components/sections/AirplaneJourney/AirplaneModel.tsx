import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Quaternion,
  Matrix4,
  type Mesh,
} from "three";
import { useFlightCurve } from "./FlightPath";

function createPaperAirplaneGeometry(): BufferGeometry {
  const geo = new BufferGeometry();

  // Paper airplane vertices
  const vertices = new Float32Array([
    // Nose tip
    0, 0, -1.0,
    // Left wing outer
    -1.0, 0, 0.4,
    // Left wing inner (fold)
    -0.12, 0.12, 0.3,
    // Right wing inner (fold)
    0.12, 0.12, 0.3,
    // Right wing outer
    1.0, 0, 0.4,
    // Tail top
    0, 0.2, 0.7,
    // Tail bottom
    0, -0.05, 0.7,
  ]);

  const indices = [
    // Left wing (top face)
    0, 1, 2,
    // Right wing (top face)
    0, 4, 3,
    // Left body (top)
    0, 2, 5,
    // Right body (top)
    0, 5, 3,
    // Left wing (bottom face)
    0, 2, 1,
    // Right wing (bottom face)
    0, 3, 4,
    // Left body (bottom)
    0, 6, 2,
    // Right body (bottom)
    0, 3, 6,
    // Tail
    2, 5, 3,
    2, 3, 6,
  ];

  geo.setIndex(indices);
  geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();

  return geo;
}

type Props = {
  progress: React.RefObject<number>;
  primaryColor: string;
  glowColor: string;
};

export default function AirplaneModel({
  progress,
  primaryColor,
  glowColor,
}: Props) {
  const meshRef = useRef<Mesh>(null);
  const smoothProgress = useRef(progress.current ?? 0);
  const prevT = useRef(smoothProgress.current);
  const direction = useRef(1);
  const isFirstFrame = useRef(true);
  const { curve } = useFlightCurve();
  const geometry = useMemo(() => createPaperAirplaneGeometry(), []);

  const _up = useMemo(() => new Vector3(0, 1, 0), []);
  const _lookAt = useMemo(() => new Matrix4(), []);
  const _quat = useMemo(() => new Quaternion(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    const target = progress.current ?? 0;

    // Snap to correct position on first frame (avoids Trail artifact from [0,0,0]
    // and prevents slow lerp catch-up when Canvas mounts after user has scrolled)
    if (isFirstFrame.current) {
      smoothProgress.current = target;
      isFirstFrame.current = false;
    } else {
      // Smooth lerp for buttery movement
      smoothProgress.current += (target - smoothProgress.current) * 0.06;
    }
    const t = Math.max(0.001, Math.min(0.999, smoothProgress.current));

    // Track scroll direction
    const delta = t - prevT.current;
    if (Math.abs(delta) > 0.0001) {
      direction.current += ((delta < 0 ? -1 : 1) - direction.current) * 0.08;
    }
    prevT.current = t;

    // Position on curve
    const pos = curve.getPointAt(t);
    meshRef.current.position.copy(pos);

    // Tangent for orientation — flip when scrolling backwards
    const tangent = curve.getTangentAt(t);
    if (direction.current < 0) tangent.negate();

    // Look along tangent
    const lookTarget = pos.clone().add(tangent);
    _lookAt.lookAt(pos, lookTarget, _up);
    _quat.setFromRotationMatrix(_lookAt);
    meshRef.current.quaternion.copy(_quat);

    // Banking: compute lateral derivative for roll
    const dt = 0.005;
    const tPrev = Math.max(0, t - dt);
    const tNext = Math.min(1, t + dt);
    const tangPrev = curve.getTangentAt(tPrev);
    const tangNext = curve.getTangentAt(tNext);
    const lateralChange = tangNext.x - tangPrev.x;
    const bankAngle = -lateralChange * 1.5;
    meshRef.current.rotateZ(bankAngle);
  });

  return (
    <Trail
      width={1.2}
      length={6}
      color={glowColor}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} geometry={geometry} scale={0.5}>
        <meshStandardMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={0.4}
          metalness={0.15}
          roughness={0.35}
          side={2}
        />
      </mesh>
    </Trail>
  );
}
