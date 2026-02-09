"use client";

import { useState, useEffect, useRef, useMemo, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  Vector3,
  CatmullRomCurve3,
  Color,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  Fog,
  TextureLoader,
  type Texture,
  type Group,
  type MeshBasicMaterial,
  type Points as PointsType,
} from "three";
import useCSSVariables from "../AirplaneJourney/useCSSVariables";
import type { ThemeColors } from "../AirplaneJourney/useCSSVariables";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type PhotoData = {
  src: string;
  alt: string;
  caption: string;
  location: string;
};

type Props = {
  photos: PhotoData[];
  progressRef: RefObject<number>;
};

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const PHOTO_POSITIONS: [number, number, number][] = [
  [2.2, 0.3, -5],
  [-2, -0.4, -14],
  [1.8, 0.6, -23],
];

const PHOTO_ROTATIONS: [number, number, number][] = [
  [0, -0.15, 0.02],
  [0, 0.18, -0.03],
  [0, -0.12, 0.04],
];

const cameraCurve = new CatmullRomCurve3(
  [
    new Vector3(0, 0, 6),
    new Vector3(1.2, 0.15, -1),
    new Vector3(1.8, 0.25, -5),
    new Vector3(0, -0.05, -9.5),
    new Vector3(-1.5, -0.3, -14),
    new Vector3(0, 0.15, -18.5),
    new Vector3(1.3, 0.45, -23),
    new Vector3(0, 0, -27),
  ],
  false,
  "catmullrom",
  0.3,
);

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useOptionalTexture(url: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    new TextureLoader().load(
      url,
      (tex) => {
        if (!disposed) setTexture(tex);
        else tex.dispose();
      },
      undefined,
      () => {
        if (!disposed) setTexture(null);
      },
    );
    return () => {
      disposed = true;
    };
  }, [url]);

  return texture;
}

/* ------------------------------------------------------------------ */
/*  Camera rig                                                         */
/* ------------------------------------------------------------------ */

function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  const target = useMemo(() => new Vector3(), []);
  const scene = useThree((s) => s.scene);

  useFrame((state) => {
    const t = Math.max(0.001, Math.min(0.999, progressRef.current ?? 0));
    const pos = cameraCurve.getPointAt(t);
    const ahead = cameraCurve.getPointAt(Math.min(0.999, t + 0.025));

    state.camera.position.x += (pos.x - state.camera.position.x) * 0.05;
    state.camera.position.y += (pos.y - state.camera.position.y) * 0.05;
    state.camera.position.z += (pos.z - state.camera.position.z) * 0.05;

    target.copy(ahead);
    state.camera.lookAt(target);

    if (scene.fog instanceof Fog) {
      scene.fog.near = state.camera.position.z - 3;
      scene.fog.far = state.camera.position.z - 28;
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Photo frame                                                        */
/* ------------------------------------------------------------------ */

function PhotoFrame({
  photo,
  position,
  rotation,
  index,
  total,
  progressRef,
  colors,
}: {
  photo: PhotoData;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  total: number;
  progressRef: RefObject<number>;
  colors: ThemeColors;
}) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<MeshBasicMaterial>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const texture = useOptionalTexture(photo.src);

  const progressTarget = (index + 1) / (total + 1);

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const dist = Math.abs(p - progressTarget);
    const proximity = dist < 0.1 ? 1 - (dist / 0.1) ** 2 : 0;

    if (groupRef.current) {
      const s = 1 + proximity * 0.06;
      groupRef.current.scale.set(s, s, s);
    }

    if (glowRef.current) {
      glowRef.current.opacity = 0.04 + proximity * 0.25;
    }

    if (captionRef.current) {
      captionRef.current.style.opacity = String(proximity);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Outer glow */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.9, 2.6]} />
        <meshBasicMaterial
          ref={glowRef}
          color={colors.gradientFrom}
          transparent
          opacity={0.04}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* Photo or placeholder */}
      <mesh>
        <planeGeometry args={[3.5, 2.2]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent />
        ) : (
          <meshBasicMaterial color={colors.primary} transparent opacity={0.15} />
        )}
      </mesh>

      {/* Wireframe border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.6, 2.3]} />
        <meshBasicMaterial
          color={colors.gradientVia}
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>

      {/* Caption (DOM via Html portal) */}
      <Html
        position={[0, -1.6, 0.1]}
        center
        style={{ width: "280px", pointerEvents: "none" }}
      >
        <div
          ref={captionRef}
          style={{ textAlign: "center", opacity: 0, transition: "none" }}
        >
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              margin: 0,
              color: colors.foreground,
              textShadow: `0 0 20px ${colors.background}`,
            }}
          >
            {photo.caption}
          </p>
          <p
            style={{
              fontSize: "12px",
              margin: "4px 0 0",
              color: colors.foreground,
              opacity: 0.6,
              textShadow: `0 0 20px ${colors.background}`,
            }}
          >
            {photo.location}
          </p>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Constellation lines + waypoint dots                                */
/* ------------------------------------------------------------------ */

function ConstellationLines({ colors }: { colors: ThemeColors }) {
  const { lineGeo, dots } = useMemo(() => {
    const positions: number[] = [];
    const dots: [number, number, number][] = [];

    for (let i = 0; i < PHOTO_POSITIONS.length - 1; i++) {
      const from = PHOTO_POSITIONS[i];
      const to = PHOTO_POSITIONS[i + 1];
      positions.push(...from, ...to);

      for (let t = 0.25; t <= 0.75; t += 0.25) {
        dots.push([
          from[0] + (to[0] - from[0]) * t,
          from[1] + (to[1] - from[1]) * t,
          from[2] + (to[2] - from[2]) * t,
        ]);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return { lineGeo: geo, dots };
  }, []);

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color={colors.gradientVia}
          transparent
          opacity={0.2}
        />
      </lineSegments>

      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial
            color={colors.gradientVia}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Constellation endpoint dots                                        */
/* ------------------------------------------------------------------ */

function ConstellationDots({ colors }: { colors: ThemeColors }) {
  return (
    <group>
      {PHOTO_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={colors.gradientFrom} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshBasicMaterial
              color={colors.gradientFrom}
              transparent
              opacity={0.3}
              blending={AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Traveling lights along constellation lines                         */
/* ------------------------------------------------------------------ */

function TravelingLights({ colors }: { colors: ThemeColors }) {
  const groupRef = useRef<Group>(null);

  const segments = useMemo(
    () =>
      PHOTO_POSITIONS.slice(0, -1).map((from, i) => ({
        from: new Vector3(...from),
        to: new Vector3(...PHOTO_POSITIONS[i + 1]),
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const seg = segments[i % segments.length];
      const speed = 0.12 + (i % 3) * 0.04;
      const offset = (i / groupRef.current!.children.length) * Math.PI * 2;
      const t = (((time * speed + offset) % 1) + 1) % 1;
      child.position.lerpVectors(seg.from, seg.to, t);
    });
  });

  return (
    <group ref={groupRef}>
      {segments.flatMap((_, si) =>
        [0, 1].map((li) => (
          <mesh key={`${si}-${li}`}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial
              color={colors.gradientFrom}
              transparent
              opacity={0.8}
              blending={AdditiveBlending}
            />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Star field                                                         */
/* ------------------------------------------------------------------ */

function StarField({ colors }: { colors: ThemeColors }) {
  const ref = useRef<PointsType>(null);
  const count = colors.isDark ? 400 : 200;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = Math.random() * -45 + 10;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.005;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={colors.gradientVia}
        size={0.05}
        transparent
        opacity={colors.isDark ? 0.6 : 0.3}
        sizeAttenuation
        blending={AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Nebulae (soft background glows)                                    */
/* ------------------------------------------------------------------ */

function Nebulae({ colors }: { colors: ThemeColors }) {
  const configs = useMemo(
    () => [
      { pos: [5, 3, -10] as const, scale: 4, color: colors.gradientFrom },
      { pos: [-6, -2, -20] as const, scale: 5, color: colors.gradientVia },
      { pos: [3, -4, -30] as const, scale: 3.5, color: colors.gradientTo },
    ],
    [colors.gradientFrom, colors.gradientVia, colors.gradientTo],
  );

  return (
    <group>
      {configs.map((cfg, i) => (
        <mesh key={i} position={cfg.pos} scale={cfg.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={cfg.color}
            transparent
            opacity={0.03}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Environment (fog + lights)                                         */
/* ------------------------------------------------------------------ */

function GalleryEnvironment({ colors }: { colors: ThemeColors }) {
  const fogColor = useMemo(
    () => new Color(colors.background),
    [colors.background],
  );

  return (
    <>
      <fog attach="fog" args={[fogColor, 10, 35]} />
      <ambientLight intensity={colors.isDark ? 0.3 : 0.6} />
      <directionalLight position={[5, 10, 5]} intensity={colors.isDark ? 0.5 : 0.8} />
      <directionalLight
        position={[-5, 5, -10]}
        intensity={0.2}
        color={colors.gradientVia}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main scene                                                         */
/* ------------------------------------------------------------------ */

export default function GalleryScene({ photos, progressRef }: Props) {
  const colors = useCSSVariables();

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <CameraRig progressRef={progressRef} />
      <GalleryEnvironment colors={colors} />
      <ConstellationLines colors={colors} />
      <ConstellationDots colors={colors} />
      <TravelingLights colors={colors} />
      <StarField colors={colors} />
      <Nebulae colors={colors} />

      {photos.map((photo, i) => (
        <PhotoFrame
          key={photo.src}
          photo={photo}
          position={PHOTO_POSITIONS[i] ?? PHOTO_POSITIONS[i % PHOTO_POSITIONS.length]}
          rotation={PHOTO_ROTATIONS[i] ?? PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length]}
          index={i}
          total={photos.length}
          progressRef={progressRef}
          colors={colors}
        />
      ))}
    </Canvas>
  );
}
