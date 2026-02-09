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
  SRGBColorSpace,
  DoubleSide,
  LinearFilter,
  type Texture,
  type Group,
  type MeshBasicMaterial,
  type Points as PointsType,
} from "three";
import useCSSVariables from "../AirplaneJourney/useCSSVariables";
import type { ThemeColors } from "../AirplaneJourney/useCSSVariables";
import type { GalleryItemData } from "./index";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  items: GalleryItemData[];
  progressRef: RefObject<number>;
};

/* ------------------------------------------------------------------ */
/*  Layout constants — 6 items                                         */
/* ------------------------------------------------------------------ */

const PHOTO_POSITIONS: [number, number, number][] = [
  [2.2, 0.3, -5],
  [-2, -0.4, -14],
  [1.8, 0.6, -23],
  [-1.5, -0.2, -32],
  [2, 0.4, -41],
  [-1.8, -0.3, -50],
];

const PHOTO_ROTATIONS: [number, number, number][] = [
  [0, -0.15, 0.02],
  [0, 0.18, -0.03],
  [0, -0.12, 0.04],
  [0, 0.14, -0.02],
  [0, -0.16, 0.03],
  [0, 0.13, -0.02],
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
    new Vector3(0, 0.05, -27.5),
    new Vector3(-1, -0.1, -32),
    new Vector3(0, 0.15, -36.5),
    new Vector3(1.5, 0.3, -41),
    new Vector3(0, 0, -45.5),
    new Vector3(-1.2, -0.2, -50),
    new Vector3(0, 0, -54),
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
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    let disposed = false;
    new TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.minFilter = LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = gl.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true;
        if (!disposed) setTexture(tex);
        else tex.dispose();
      },
      undefined,
      (err) => {
        console.warn("Failed to load gallery texture:", url, err);
        if (!disposed) setTexture(null);
      },
    );
    return () => {
      disposed = true;
    };
  }, [url, gl]);

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
/*  Video frame — renders video in Html portal                         */
/* ------------------------------------------------------------------ */

function VideoFrame({
  item,
  position,
  rotation,
  index,
  total,
  progressRef,
  colors,
}: {
  item: GalleryItemData;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  total: number;
  progressRef: RefObject<number>;
  colors: ThemeColors;
}) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<MeshBasicMaterial>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasPlaying = useRef(false);

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

    if (contentRef.current) {
      contentRef.current.style.opacity = String(Math.max(proximity, 0.3));
    }

    // Auto-play/pause video based on proximity
    if (videoRef.current) {
      if (proximity > 0.3 && !wasPlaying.current) {
        videoRef.current.play().catch(() => {});
        wasPlaying.current = true;
      } else if (proximity <= 0.1 && wasPlaying.current) {
        videoRef.current.pause();
        wasPlaying.current = false;
      }
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

      {/* Video via Html */}
      <Html
        center
        transform
        scale={0.22}
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={contentRef}
          style={{ opacity: 0.3, transition: "none" }}
        >
          <video
            ref={videoRef}
            src={item.src}
            muted
            loop
            playsInline
            style={{
              width: "560px",
              height: "350px",
              objectFit: "cover",
              borderRadius: "4px",
              display: "block",
            }}
          />
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                margin: 0,
                color: colors.foreground,
                textShadow: `0 0 20px ${colors.background}`,
              }}
            >
              {item.caption}
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
              {item.location}
            </p>
          </div>
        </div>
      </Html>

      {/* Wireframe border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.6, 2.3]} />
        <meshBasicMaterial
          color={colors.isDark ? colors.gradientVia : colors.primary}
          transparent
          opacity={colors.isDark ? 0.12 : 0.2}
          wireframe
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Photo frame                                                        */
/* ------------------------------------------------------------------ */

function PhotoFrame({
  item,
  position,
  rotation,
  index,
  total,
  progressRef,
  colors,
}: {
  item: GalleryItemData;
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
  const texture = useOptionalTexture(item.src);

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
        <meshBasicMaterial
          map={texture}
          color={texture ? "#ffffff" : colors.primary}
          transparent
          opacity={texture ? 1 : 0.15}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Wireframe border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.6, 2.3]} />
        <meshBasicMaterial
          color={colors.isDark ? colors.gradientVia : colors.primary}
          transparent
          opacity={colors.isDark ? 0.12 : 0.2}
          wireframe
        />
      </mesh>

      {/* Caption */}
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
            {item.caption}
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
            {item.location}
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
          color={colors.isDark ? colors.gradientVia : colors.primary}
          transparent
          opacity={colors.isDark ? 0.2 : 0.15}
        />
      </lineSegments>

      {dots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial
            color={colors.isDark ? colors.gradientVia : colors.primary}
            transparent
            opacity={colors.isDark ? 0.4 : 0.3}
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
              opacity={colors.isDark ? 0.3 : 0.15}
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
              opacity={colors.isDark ? 0.8 : 0.5}
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
  const count = colors.isDark ? 500 : 150;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = Math.random() * -60 + 10;
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
        color={colors.isDark ? colors.gradientVia : colors.primary}
        size={colors.isDark ? 0.05 : 0.035}
        transparent
        opacity={colors.isDark ? 0.6 : 0.2}
        sizeAttenuation
        blending={AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Environment (fog + lights + opaque background)                     */
/* ------------------------------------------------------------------ */

function GalleryEnvironment({ colors }: { colors: ThemeColors }) {
  const fogColor = useMemo(
    () => new Color(colors.background),
    [colors.background],
  );

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 10, 35]} />
      <ambientLight intensity={colors.isDark ? 0.3 : 0.7} />
      <directionalLight position={[5, 10, 5]} intensity={colors.isDark ? 0.5 : 0.9} />
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

export default function GalleryScene({ items, progressRef }: Props) {
  const colors = useCSSVariables();

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ background: colors.background }}
    >
      <CameraRig progressRef={progressRef} />
      <GalleryEnvironment colors={colors} />
      <ConstellationLines colors={colors} />
      <StarField colors={colors} />

      {items.map((item, i) => {
        const position = PHOTO_POSITIONS[i] ?? PHOTO_POSITIONS[i % PHOTO_POSITIONS.length];
        const rotation = PHOTO_ROTATIONS[i] ?? PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length];

        return item.type === "video" ? (
          <VideoFrame
            key={item.src}
            item={item}
            position={position}
            rotation={rotation}
            index={i}
            total={items.length}
            progressRef={progressRef}
            colors={colors}
          />
        ) : (
          <PhotoFrame
            key={item.src}
            item={item}
            position={position}
            rotation={rotation}
            index={i}
            total={items.length}
            progressRef={progressRef}
            colors={colors}
          />
        );
      })}
    </Canvas>
  );
}
