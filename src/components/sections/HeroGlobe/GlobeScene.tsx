"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import {
  Vector3,
  QuadraticBezierCurve3,
  AdditiveBlending,
  BackSide,
  DoubleSide,
  type Group,
  type Mesh,
  type Points as PointsType,
} from "three";
import useCSSVariables from "@/components/sections/AirplaneJourney/useCSSVariables";

// --- Constants ---

const DEG2RAD = Math.PI / 180;
const GLOBE_RADIUS = 1.8;

function latLngToVec3(lat: number, lng: number, radius = GLOBE_RADIUS): Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const LOCATIONS = [
  { name: "Brazil", label: "São Paulo, BR", lat: -23.5, lng: -46.6 },
  { name: "Dubai", label: "Dubai, UAE", lat: 25.2, lng: 55.3 },
  { name: "Europe", label: "Lisbon, PT", lat: 38.7, lng: -9.1 },
] as const;

const ARC_PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
];

function buildArcCurve(from: Vector3, to: Vector3): QuadraticBezierCurve3 {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(GLOBE_RADIUS + 0.5 + from.distanceTo(to) * 0.35);
  return new QuadraticBezierCurve3(from, mid, to);
}

// --- Globe wireframe ---

function GlobeWireframe({ color, isDark }: { color: string; isDark: boolean }) {
  return (
    <mesh>
      <icosahedronGeometry args={[GLOBE_RADIUS, 3]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={isDark ? 0.12 : 0.08}
      />
    </mesh>
  );
}

// --- Breathing atmosphere ---

function Atmosphere({ color, secondaryColor }: { color: string; secondaryColor: string }) {
  const inner = useRef<Mesh>(null);
  const outer = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Breathing pulse
    const breathe = 1 + Math.sin(t * 0.8) * 0.03;
    if (inner.current) {
      inner.current.scale.setScalar(1.12 * breathe);
      (inner.current.material as { opacity: number }).opacity =
        0.05 + Math.sin(t * 0.8) * 0.02;
    }
    if (outer.current) {
      outer.current.scale.setScalar(1.25 * breathe);
      (outer.current.material as { opacity: number }).opacity =
        0.03 + Math.sin(t * 0.8 + 0.5) * 0.015;
    }
  });

  return (
    <>
      <mesh ref={inner}>
        <icosahedronGeometry args={[GLOBE_RADIUS, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={BackSide} />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[GLOBE_RADIUS, 2]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.03} side={BackSide} />
      </mesh>
    </>
  );
}

// --- Orbital rings ---

function OrbitalRing({
  color,
  radius,
  rotationX,
  rotationY,
  speed,
  opacity,
}: {
  color: string;
  radius: number;
  rotationX: number;
  rotationY: number;
  speed: number;
  opacity: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });

  return (
    <mesh ref={ref} rotation={[rotationX, rotationY, 0]}>
      <torusGeometry args={[radius, 0.003, 8, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- Location dot with label + ping rings + connector line ---

function LocationDot({
  lat,
  lng,
  color,
  label,
  order,
}: {
  lat: number;
  lng: number;
  color: string;
  label: string;
  order: number;
}) {
  const pos = useMemo(() => latLngToVec3(lat, lng), [lat, lng]);
  const dotRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const [visible, setVisible] = useState(true);
  const camera = useThree((s) => s.camera);
  const prevVisible = useRef(true);

  useFrame(({ clock }) => {
    if (!dotRef.current) return;

    const t = clock.elapsedTime;
    const s = 1 + Math.sin(t * 2 + order) * 0.25;
    dotRef.current.scale.setScalar(s);

    // Ping rings
    if (ring1Ref.current) {
      const r1 = (t * 0.5 + order * 0.3) % 1;
      ring1Ref.current.scale.setScalar(1 + r1 * 4);
      (ring1Ref.current.material as { opacity: number }).opacity = (1 - r1) * 0.5;
    }
    if (ring2Ref.current) {
      const r2 = (t * 0.5 + order * 0.3 + 0.5) % 1;
      ring2Ref.current.scale.setScalar(1 + r2 * 4);
      (ring2Ref.current.material as { opacity: number }).opacity = (1 - r2) * 0.35;
    }

    // Face check for label
    const worldPos = dotRef.current.getWorldPosition(new Vector3());
    const camDir = camera.position.clone().sub(worldPos).normalize();
    const normal = worldPos.clone().normalize();
    const facing = camDir.dot(normal) > 0.15;
    if (facing !== prevVisible.current) {
      prevVisible.current = facing;
      setVisible(facing);
    }
  });

  const lookDir = useMemo(() => pos.clone().normalize(), [pos]);
  const labelOffset: [number, number, number] = [
    lookDir.x * 0.45,
    lookDir.y * 0.45,
    lookDir.z * 0.45,
  ];

  return (
    <group position={pos}>
      {/* Core dot */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Glow layers */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Ping ring 1 */}
      <mesh ref={ring1Ref} lookAt={new Vector3(0, 0, 0)}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Ping ring 2 */}
      <mesh ref={ring2Ref} lookAt={new Vector3(0, 0, 0)}>
        <ringGeometry args={[0.05, 0.065, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Connector line to label */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, ...labelOffset]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={visible ? 0.3 : 0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* HTML label */}
      <Html
        center
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
        position={labelOffset}
      >
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: color, boxShadow: `0 0 8px 2px ${color}` }}
            />
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{
                color,
                textShadow: `0 0 16px ${color}, 0 0 32px ${color}40, 0 1px 4px rgba(0,0,0,0.9)`,
              }}
            >
              {label}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// --- Arc with multiple traveling lights ---

function ArcLine({
  from,
  to,
  color,
  glowColor,
  index,
}: {
  from: Vector3;
  to: Vector3;
  color: string;
  glowColor: string;
  index: number;
}) {
  const curve = useMemo(() => buildArcCurve(from, to), [from, to]);
  const points = useMemo(() => curve.getPoints(64), [curve]);

  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [points]);

  // 3 traveling lights per arc
  const light1 = useRef<Mesh>(null);
  const glow1 = useRef<Mesh>(null);
  const light2 = useRef<Mesh>(null);
  const glow2 = useRef<Mesh>(null);
  const light3 = useRef<Mesh>(null);
  const glow3 = useRef<Mesh>(null);

  // Burst particles at arrival
  const burstRef = useRef<PointsType>(null);
  const burstPositions = useMemo(() => new Float32Array(30 * 3), []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const baseOffset = index * 0.5;

    // Light 1 — fast
    const t1 = (time * 0.2 + baseOffset) % 1;
    if (light1.current) {
      const p = curve.getPointAt(t1);
      light1.current.position.copy(p);
      if (glow1.current) glow1.current.position.copy(p);
    }

    // Light 2 — medium, offset
    const t2 = (time * 0.15 + baseOffset + 0.33) % 1;
    if (light2.current) {
      const p = curve.getPointAt(t2);
      light2.current.position.copy(p);
      if (glow2.current) glow2.current.position.copy(p);
    }

    // Light 3 — slow, offset
    const t3 = (time * 0.12 + baseOffset + 0.66) % 1;
    if (light3.current) {
      const p = curve.getPointAt(t3);
      light3.current.position.copy(p);
      if (glow3.current) glow3.current.position.copy(p);
    }

    // Burst particles at arrival end
    if (burstRef.current) {
      // Use light1 arrival for burst trigger
      const arrivalPhase = t1;
      const burstActive = arrivalPhase > 0.92;
      const burstIntensity = burstActive ? (arrivalPhase - 0.92) / 0.08 : 0;
      const arr = burstRef.current.geometry.attributes.position
        .array as Float32Array;
      const dest = curve.getPointAt(0.99);

      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const spread = burstIntensity * 0.25;
        arr[i * 3] = dest.x + Math.cos(angle) * spread * (0.5 + Math.sin(time * 3 + i) * 0.5);
        arr[i * 3 + 1] = dest.y + Math.sin(angle) * spread * (0.5 + Math.cos(time * 4 + i) * 0.5);
        arr[i * 3 + 2] = dest.z + Math.sin(angle + time) * spread * 0.3;
      }
      burstRef.current.geometry.attributes.position.needsUpdate = true;
      (burstRef.current.material as { opacity: number }).opacity = burstIntensity * 0.6;
    }
  });

  const lightSphere = (ref: React.Ref<Mesh>, size: number, opacity: number) => (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        color={glowColor}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );

  return (
    <group>
      {/* Arc line */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {/* Light 1 — brightest */}
      {lightSphere(light1, 0.04, 0.9)}
      {lightSphere(glow1, 0.1, 0.25)}

      {/* Light 2 — medium */}
      {lightSphere(light2, 0.03, 0.7)}
      {lightSphere(glow2, 0.07, 0.2)}

      {/* Light 3 — faint */}
      {lightSphere(light3, 0.025, 0.5)}
      {lightSphere(glow3, 0.06, 0.15)}

      {/* Burst particles at destination */}
      <points ref={burstRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burstPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={glowColor}
          size={0.02}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// --- Floating particles ---

function FloatingParticles({ color, count }: { color: string; count: number }) {
  const ref = useRef<Group>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = GLOBE_RADIUS + 0.3 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.018}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// --- Globe group (auto-rotating) ---

function GlobeGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.07;
  });

  return <group ref={ref}>{children}</group>;
}

// --- Lighting ---

function SceneLighting({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <directionalLight position={[5, 3, 5]} intensity={isDark ? 0.4 : 0.6} />
      <pointLight position={[0, 0, 3]} intensity={0.2} color="#ffffff" />
    </>
  );
}

// --- Main scene ---

function Scene({ isMobile }: { isMobile: boolean }) {
  const colors = useCSSVariables();

  const locationVecs = useMemo(
    () => LOCATIONS.map((l) => latLngToVec3(l.lat, l.lng)),
    []
  );

  return (
    <>
      {!isMobile && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />
      )}
      <SceneLighting isDark={colors.isDark} />

      <GlobeGroup>
        <GlobeWireframe color={colors.primary} isDark={colors.isDark} />
        <Atmosphere color={colors.gradientVia} secondaryColor={colors.gradientFrom} />

        {/* Orbital rings */}
        <OrbitalRing
          color={colors.gradientFrom}
          radius={GLOBE_RADIUS + 0.4}
          rotationX={1.2}
          rotationY={0.3}
          speed={0.06}
          opacity={0.15}
        />
        <OrbitalRing
          color={colors.gradientVia}
          radius={GLOBE_RADIUS + 0.65}
          rotationX={-0.8}
          rotationY={1.0}
          speed={-0.04}
          opacity={0.1}
        />
        <OrbitalRing
          color={colors.gradientTo}
          radius={GLOBE_RADIUS + 0.9}
          rotationX={0.4}
          rotationY={-0.6}
          speed={0.03}
          opacity={0.08}
        />

        {/* Location dots with labels */}
        {LOCATIONS.map((loc, i) => (
          <LocationDot
            key={loc.name}
            lat={loc.lat}
            lng={loc.lng}
            color={colors.gradientFrom}
            label={loc.label}
            order={i}
          />
        ))}

        {/* Connection arcs with traveling lights */}
        {ARC_PAIRS.map(([a, b], i) => (
          <ArcLine
            key={`${a}-${b}`}
            from={locationVecs[a]}
            to={locationVecs[b]}
            color={colors.gradientVia}
            glowColor={colors.gradientFrom}
            index={i}
          />
        ))}

        <FloatingParticles
          color={colors.gradientTo}
          count={colors.isDark ? 150 : 80}
        />
      </GlobeGroup>
    </>
  );
}

export default function GlobeScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 4.8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{
        background: "transparent",
        pointerEvents: isMobile ? "none" : "auto",
      }}
    >
      <Scene isMobile={isMobile} />
    </Canvas>
  );
}
