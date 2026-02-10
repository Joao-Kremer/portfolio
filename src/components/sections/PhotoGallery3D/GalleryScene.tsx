"use client";

import { useState, useEffect, useRef, useMemo, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  Vector3,
  Color,
  BufferGeometry,
  Float32BufferAttribute,
  Fog,
  TextureLoader,
  SRGBColorSpace,
  DoubleSide,
  LinearFilter,
  type Texture,
  type Group,
  type Mesh,
  type PointLight,
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
  pointerXRef: RefObject<number>;
  finishSign: string;
};

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const SPACING = 11;
const ITEM_COUNT = 10;
const SIDE_OFFSET = 5;
const STEER_RANGE = 6;

const ITEM_POSITIONS: [number, number, number][] = [];
const ITEM_ROTATIONS: [number, number, number][] = [];

for (let i = 0; i < ITEM_COUNT; i++) {
  const side = i % 2 === 0 ? 1 : -1;
  const z = -(i * SPACING + 12);
  ITEM_POSITIONS.push([side * SIDE_OFFSET, 1.2, z]);
  ITEM_ROTATIONS.push([0, -side * 0.35, 0]);
}

const Z_START = 8;
const Z_END = -(ITEM_COUNT * SPACING + 18);
const TOTAL_LENGTH = Math.abs(Z_END - Z_START);

/* ------------------------------------------------------------------ */
/*  Texture hook                                                       */
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
      () => {
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
/*  Torch — flickering fire held by the rider                          */
/* ------------------------------------------------------------------ */

function Torch({ isDark }: { isDark: boolean }) {
  const lightRef = useRef<PointLight>(null);
  const flameRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker =
      (isDark ? 12 : 2) +
      Math.sin(t * 8) * 1.2 +
      Math.sin(t * 13) * 0.8 +
      Math.sin(t * 21) * 0.4;
    if (lightRef.current) lightRef.current.intensity = flicker;
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 10) * 0.25;
      flameRef.current.scale.x = 1 + Math.sin(t * 14) * 0.15;
    }
  });

  return (
    <group position={[0, -0.22, 0]} rotation={[-0.3, 0, 0.15]}>
      {/* Stick */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.03, 0.55, 6]} />
        <meshStandardMaterial color="#5A3A1A" roughness={0.9} />
      </mesh>
      {/* Wrap at top */}
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 6]} />
        <meshStandardMaterial color="#3A2510" />
      </mesh>
      {/* Flame base */}
      <mesh ref={flameRef} position={[0, 0.36, 0]}>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial
          color="#FF6600"
          emissive="#FF4400"
          emissiveIntensity={3}
        />
      </mesh>
      {/* Flame tip */}
      <mesh position={[0, 0.48, 0]}>
        <coneGeometry args={[0.04, 0.15, 6]} />
        <meshStandardMaterial
          color="#FFCC00"
          emissive="#FFAA00"
          emissiveIntensity={4}
        />
      </mesh>
      {/* Fire light — big warm glow */}
      <pointLight
        ref={lightRef}
        position={[0, 0.4, 0]}
        intensity={isDark ? 12 : 2}
        distance={isDark ? 30 : 10}
        color="#FF8833"
        decay={1.5}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Rider — low-poly person with red shirt + torch                     */
/* ------------------------------------------------------------------ */

function Rider({ isDark }: { isDark: boolean }) {
  const skin = "#E8B88A";
  const shirt = "#CC2222";
  const hair = "#1A0E05";
  const jeans = "#2B3A5C";
  const shoe = "#3A2A1A";

  return (
    <group position={[0, 1.72, 0.12]}>
      {/* Torso (red shirt) */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.38, 0.42, 0.22]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.68, 0.02]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 0.74, -0.04]}>
        <sphereGeometry args={[0.135, 8, 6]} />
        <meshStandardMaterial color={hair} />
      </mesh>

      {/* Left arm — holding reins */}
      <group position={[-0.26, 0.28, 0.04]} rotation={[0.4, 0, 0.25]}>
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* Right arm — raised holding torch */}
      <group position={[0.26, 0.38, 0.04]} rotation={[-0.6, 0, -0.3]}>
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {/* Torch in right hand */}
        <Torch isDark={isDark} />
      </group>

      {/* Left leg — straddling */}
      <mesh position={[-0.2, -0.02, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.13, 0.42, 0.14]} />
        <meshStandardMaterial color={jeans} />
      </mesh>
      <mesh position={[-0.32, -0.22, 0.04]}>
        <boxGeometry args={[0.11, 0.1, 0.16]} />
        <meshStandardMaterial color={shoe} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.2, -0.02, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.13, 0.42, 0.14]} />
        <meshStandardMaterial color={jeans} />
      </mesh>
      <mesh position={[0.32, -0.22, 0.04]}>
        <boxGeometry args={[0.11, 0.1, 0.16]} />
        <meshStandardMaterial color={shoe} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camel — low-poly geometric camel with rider                        */
/* ------------------------------------------------------------------ */

function Camel({
  progressRef,
  pointerXRef,
  camelXRef,
  isDark,
  items,
  colors,
}: {
  progressRef: RefObject<number>;
  pointerXRef: RefObject<number>;
  camelXRef: React.MutableRefObject<number>;
  isDark: boolean;
  items: GalleryItemData[];
  colors: ThemeColors;
}) {
  const groupRef = useRef<Group>(null);
  const legFL = useRef<Group>(null);
  const legFR = useRef<Group>(null);
  const legBL = useRef<Group>(null);
  const legBR = useRef<Group>(null);
  const neckRef = useRef<Group>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastActiveIdx = useRef(-1);
  const selectedComment = useRef("");

  useFrame(() => {
    if (!groupRef.current) return;
    const p = Math.max(0.001, Math.min(0.999, progressRef.current ?? 0));
    const camelZ = Z_START - p * TOTAL_LENGTH;

    /* Steering from pointer X */
    const targetX = (pointerXRef.current ?? 0) * STEER_RANGE;
    const currentX = groupRef.current.position.x;
    const newX = currentX + (targetX - currentX) * 0.04;
    groupRef.current.position.x = newX;
    camelXRef.current = newX;

    /* Slight rotation toward movement direction */
    const dx = targetX - currentX;
    groupRef.current.rotation.y = -dx * 0.08;

    groupRef.current.position.z = camelZ;
    groupRef.current.position.y = Math.sin(camelZ * 1.5) * 0.04;

    /* Walk animation */
    const walkCycle = camelZ * 2;
    const swing = 0.35;

    if (legFL.current) legFL.current.rotation.x = Math.sin(walkCycle) * swing;
    if (legBR.current) legBR.current.rotation.x = Math.sin(walkCycle) * swing;
    if (legFR.current)
      legFR.current.rotation.x = Math.sin(walkCycle + Math.PI) * swing;
    if (legBL.current)
      legBL.current.rotation.x = Math.sin(walkCycle + Math.PI) * swing;

    if (neckRef.current) {
      neckRef.current.rotation.x = 0.5 + Math.sin(camelZ * 1.5) * 0.06;
    }

    /* Speech bubble — find closest photo */
    let activeIdx = -1;
    let minDist = Infinity;
    for (let i = 0; i < items.length; i++) {
      const pz = ITEM_POSITIONS[i]?.[2] ?? 0;
      const dist = Math.abs(camelZ - pz);
      if (dist < minDist) {
        minDist = dist;
        activeIdx = i;
      }
    }

    if (minDist < 8 && activeIdx >= 0) {
      if (activeIdx !== lastActiveIdx.current) {
        lastActiveIdx.current = activeIdx;
        const comments = items[activeIdx].comments;
        if (comments && comments.length > 0) {
          selectedComment.current =
            comments[Math.floor(Math.random() * comments.length)];
        }
      }
      if (bubbleRef.current) {
        bubbleRef.current.textContent = selectedComment.current;
        const fade = Math.max(0, 1 - minDist / 8);
        bubbleRef.current.style.opacity = String(fade);
        bubbleRef.current.style.transform = `scale(${0.8 + fade * 0.2})`;
      }
    } else {
      lastActiveIdx.current = -1;
      if (bubbleRef.current) {
        bubbleRef.current.style.opacity = "0";
        bubbleRef.current.style.transform = "scale(0.8)";
      }
    }
  });

  const body = "#C4956A";
  const dark = "#A07850";
  const blanket = "#8B2252";

  return (
    <group ref={groupRef} position={[0, 0, Z_START]}>
      {/* Inner group faces -Z (travel direction) */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Shadow blob */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 12]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.7, 0.65, 1.6]} />
          <meshStandardMaterial color={body} />
        </mesh>

        {/* Hump */}
        <mesh position={[0, 1.88, -0.1]}>
          <sphereGeometry args={[0.33, 8, 6]} />
          <meshStandardMaterial color={body} />
        </mesh>

        {/* Saddle blanket */}
        <mesh position={[0, 1.68, 0.2]}>
          <boxGeometry args={[0.78, 0.06, 0.6]} />
          <meshStandardMaterial color={blanket} />
        </mesh>

        {/* Rider on top */}
        <Rider isDark={isDark} />

        {/* Neck + Head */}
        <group
          ref={neckRef}
          position={[0, 1.6, 0.7]}
          rotation={[0.5, 0, 0]}
        >
          <mesh>
            <boxGeometry args={[0.25, 0.7, 0.25]} />
            <meshStandardMaterial color={body} />
          </mesh>
          <mesh position={[0, 0.45, 0.1]}>
            <boxGeometry args={[0.22, 0.22, 0.38]} />
            <meshStandardMaterial color={body} />
          </mesh>
          <mesh position={[0, 0.4, 0.32]}>
            <boxGeometry args={[0.17, 0.14, 0.14]} />
            <meshStandardMaterial color={dark} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.12, 0.56, 0.05]}>
            <boxGeometry args={[0.05, 0.1, 0.05]} />
            <meshStandardMaterial color={dark} />
          </mesh>
          <mesh position={[0.12, 0.56, 0.05]}>
            <boxGeometry args={[0.05, 0.1, 0.05]} />
            <meshStandardMaterial color={dark} />
          </mesh>
        </group>

        {/* Legs — each outer group at the hip; inner group rotates for walk */}
        <group position={[-0.22, 0.97, 0.5]}>
          <group ref={legFL}>
            <mesh position={[0, -0.38, 0]}>
              <boxGeometry args={[0.14, 0.76, 0.14]} />
              <meshStandardMaterial color={dark} />
            </mesh>
          </group>
        </group>
        <group position={[0.22, 0.97, 0.5]}>
          <group ref={legFR}>
            <mesh position={[0, -0.38, 0]}>
              <boxGeometry args={[0.14, 0.76, 0.14]} />
              <meshStandardMaterial color={dark} />
            </mesh>
          </group>
        </group>
        <group position={[-0.22, 0.97, -0.5]}>
          <group ref={legBL}>
            <mesh position={[0, -0.38, 0]}>
              <boxGeometry args={[0.14, 0.76, 0.14]} />
              <meshStandardMaterial color={dark} />
            </mesh>
          </group>
        </group>
        <group position={[0.22, 0.97, -0.5]}>
          <group ref={legBR}>
            <mesh position={[0, -0.38, 0]}>
              <boxGeometry args={[0.14, 0.76, 0.14]} />
              <meshStandardMaterial color={dark} />
            </mesh>
          </group>
        </group>

        {/* Tail */}
        <mesh position={[0, 1.35, -0.92]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color={dark} />
        </mesh>
      </group>

      {/* Speech bubble — rendered in outer group so it doesn't flip with PI rotation */}
      <Html
        position={[0, 3.4, -0.5]}
        center
        style={{ pointerEvents: "none", width: "220px" }}
      >
        <div
          ref={bubbleRef}
          style={{
            opacity: 0,
            transition: "none",
            background: colors.isDark
              ? "rgba(30, 25, 15, 0.92)"
              : "rgba(255, 255, 255, 0.95)",
            color: colors.foreground,
            borderRadius: "14px",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "1.4",
            textAlign: "center",
            boxShadow: colors.isDark
              ? "0 2px 16px rgba(255,136,51,0.25)"
              : "0 2px 12px rgba(0,0,0,0.12)",
            border: colors.isDark
              ? "1px solid rgba(255,136,51,0.3)"
              : "1px solid rgba(0,0,0,0.08)",
            position: "relative",
            transformOrigin: "center bottom",
          }}
        />
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera rig — follows the camel from behind                         */
/* ------------------------------------------------------------------ */

function CameraRig({
  progressRef,
  camelXRef,
}: {
  progressRef: RefObject<number>;
  camelXRef: React.MutableRefObject<number>;
}) {
  const target = useMemo(() => new Vector3(), []);
  const scene = useThree((s) => s.scene);

  useFrame((state) => {
    const p = Math.max(0.001, Math.min(0.999, progressRef.current ?? 0));
    const camelZ = Z_START - p * TOTAL_LENGTH;
    const camelX = camelXRef.current;

    const camX = camelX * 0.6 + 1.5 + Math.sin(p * Math.PI * 3) * 0.3;
    const camY = 3.2;
    const camZ = camelZ + 7;

    state.camera.position.x += (camX - state.camera.position.x) * 0.04;
    state.camera.position.y += (camY - state.camera.position.y) * 0.04;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.04;

    target.set(camelX * 0.3, 0.8, camelZ - 4);
    state.camera.lookAt(target);

    if (scene.fog instanceof Fog) {
      scene.fog.near = state.camera.position.z - 12;
      scene.fog.far = state.camera.position.z - 55;
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Desert ground                                                      */
/* ------------------------------------------------------------------ */

function DesertGround({ colors }: { colors: ThemeColors }) {
  const sandColor = colors.isDark ? "#2A1F0F" : "#E8D5B7";

  return (
    <mesh
      position={[0, 0, -TOTAL_LENGTH / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[80, TOTAL_LENGTH + 40]} />
      <meshStandardMaterial color={sandColor} roughness={0.95} metalness={0} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Sand dunes (background hills)                                      */
/* ------------------------------------------------------------------ */

function Dunes({ colors }: { colors: ThemeColors }) {
  const duneColor = colors.isDark ? "#3A2A15" : "#DCC9A3";

  const dunes = useMemo(() => {
    const arr: {
      pos: [number, number, number];
      scale: [number, number, number];
    }[] = [];
    for (let i = 0; i < 35; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      arr.push({
        pos: [
          side * (9 + Math.random() * 22),
          0,
          Z_START - Math.random() * TOTAL_LENGTH,
        ],
        scale: [
          3 + Math.random() * 7,
          0.6 + Math.random() * 1.8,
          3 + Math.random() * 7,
        ],
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {dunes.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <sphereGeometry args={[1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={duneColor} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Path in the sand                                                   */
/* ------------------------------------------------------------------ */

function DesertPath({ colors }: { colors: ThemeColors }) {
  const pathColor = colors.isDark ? "#4A3520" : "#D4BC8E";

  return (
    <mesh
      position={[0, 0.01, -TOTAL_LENGTH / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[2.5, TOTAL_LENGTH + 20]} />
      <meshStandardMaterial color={pathColor} roughness={0.9} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Desert decorations — cacti, rocks                                  */
/* ------------------------------------------------------------------ */

function Cactus({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.3, 6]} />
        <meshStandardMaterial color="#2D5A27" />
      </mesh>
      <group position={[-0.15, 0.75, 0]} rotation={[0, 0, 0.45]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.45, 6]} />
          <meshStandardMaterial color="#2D5A27" />
        </mesh>
      </group>
      <group position={[0.15, 0.95, 0]} rotation={[0, 0, -0.5]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.38, 6]} />
          <meshStandardMaterial color="#2D5A27" />
        </mesh>
      </group>
    </group>
  );
}

function DesertDecorations() {
  const items = useMemo(() => {
    const cacti: [number, number, number][] = [];
    const rocks: { pos: [number, number, number]; scale: number }[] = [];

    for (let i = 0; i < 30; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (3 + Math.random() * 14);
      const z = Z_START - Math.random() * TOTAL_LENGTH;

      if (Math.random() > 0.45) {
        cacti.push([x, 0, z]);
      } else {
        rocks.push({ pos: [x, 0.12, z], scale: 0.4 + Math.random() * 0.9 });
      }
    }

    return { cacti, rocks };
  }, []);

  return (
    <group>
      {items.cacti.map((pos, i) => (
        <Cactus key={`c${i}`} position={pos} />
      ))}
      {items.rocks.map((r, i) => (
        <mesh key={`r${i}`} position={r.pos} scale={r.scale}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#8B7355" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Sand particles                                                     */
/* ------------------------------------------------------------------ */

function SandParticles({ colors }: { colors: ThemeColors }) {
  const ref = useRef<PointsType>(null);
  const count = 350;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 5 + 0.3;
      positions[i * 3 + 2] = Z_START - Math.random() * TOTAL_LENGTH;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.002;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={colors.isDark ? "#C4956A" : "#D4BC8E"}
        size={0.04}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Photo frame on a wooden post                                       */
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
  const captionRef = useRef<HTMLDivElement>(null);
  const texture = useOptionalTexture(item.src);

  const progressTarget = (index + 1) / (total + 1);
  const frameColor = colors.isDark ? "#4A3520" : "#8B6914";
  const postColor = colors.isDark ? "#3A2510" : "#6B4E10";

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const dist = Math.abs(p - progressTarget);
    const proximity = dist < 0.08 ? 1 - (dist / 0.08) ** 2 : 0;

    if (groupRef.current) {
      const s = 1 + proximity * 0.08;
      groupRef.current.scale.set(s, s, s);
    }
    if (captionRef.current) {
      captionRef.current.style.opacity = String(proximity);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Wooden post */}
      <mesh position={[0, -0.4, -0.05]}>
        <boxGeometry args={[0.14, 2, 0.14]} />
        <meshStandardMaterial color={postColor} roughness={0.85} />
      </mesh>

      {/* Frame border */}
      <mesh position={[0, 0.6, -0.03]}>
        <boxGeometry args={[3.3, 2.3, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>

      {/* Photo */}
      <mesh position={[0, 0.6, 0.03]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? "#ffffff" : colors.primary}
          transparent
          opacity={texture ? 1 : 0.15}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Lantern at base */}
      <mesh position={[0.3, -1.1, 0.15]}>
        <boxGeometry args={[0.15, 0.22, 0.15]} />
        <meshStandardMaterial
          color="#D4A054"
          emissive="#FF9933"
          emissiveIntensity={0.6}
        />
      </mesh>
      <pointLight
        position={[0.3, -0.9, 0.25]}
        intensity={colors.isDark ? 2 : 0.8}
        distance={6}
        color="#FFAA44"
      />

      {/* Caption */}
      <Html
        position={[0, -0.8, 0.1]}
        center
        style={{ width: "250px", pointerEvents: "none" }}
      >
        <div
          ref={captionRef}
          style={{ textAlign: "center", opacity: 0, transition: "none" }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              margin: 0,
              color: colors.foreground,
              textShadow: `0 0 15px ${colors.background}`,
            }}
          >
            {item.caption}
          </p>
          <p
            style={{
              fontSize: "11px",
              margin: "3px 0 0",
              color: colors.foreground,
              opacity: 0.6,
              textShadow: `0 0 15px ${colors.background}`,
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
/*  Video frame on a wooden post                                       */
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
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasPlaying = useRef(false);

  const progressTarget = (index + 1) / (total + 1);
  const frameColor = colors.isDark ? "#4A3520" : "#8B6914";
  const postColor = colors.isDark ? "#3A2510" : "#6B4E10";

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const dist = Math.abs(p - progressTarget);
    const proximity = dist < 0.08 ? 1 - (dist / 0.08) ** 2 : 0;

    if (groupRef.current) {
      const s = 1 + proximity * 0.08;
      groupRef.current.scale.set(s, s, s);
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = String(Math.max(proximity, 0.3));
    }
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
      {/* Wooden post */}
      <mesh position={[0, -0.4, -0.05]}>
        <boxGeometry args={[0.14, 2, 0.14]} />
        <meshStandardMaterial color={postColor} roughness={0.85} />
      </mesh>

      {/* Frame border */}
      <mesh position={[0, 0.6, -0.03]}>
        <boxGeometry args={[3.3, 2.3, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>

      {/* Video via Html */}
      <Html
        center
        transform
        scale={0.19}
        position={[0, 0.6, 0.06]}
        style={{ pointerEvents: "none" }}
      >
        <div ref={contentRef} style={{ opacity: 0.3, transition: "none" }}>
          <video
            ref={videoRef}
            src={item.src}
            muted
            loop
            playsInline
            style={{
              width: "500px",
              height: "340px",
              objectFit: "cover",
              borderRadius: "4px",
              display: "block",
            }}
          />
          <div style={{ textAlign: "center", marginTop: "6px" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                margin: 0,
                color: colors.foreground,
                textShadow: `0 0 15px ${colors.background}`,
              }}
            >
              {item.caption}
            </p>
            <p
              style={{
                fontSize: "11px",
                margin: "3px 0 0",
                color: colors.foreground,
                opacity: 0.6,
                textShadow: `0 0 15px ${colors.background}`,
              }}
            >
              {item.location}
            </p>
          </div>
        </div>
      </Html>

      {/* Lantern at base */}
      <mesh position={[0.3, -1.1, 0.15]}>
        <boxGeometry args={[0.15, 0.22, 0.15]} />
        <meshStandardMaterial
          color="#D4A054"
          emissive="#FF9933"
          emissiveIntensity={0.6}
        />
      </mesh>
      <pointLight
        position={[0.3, -0.9, 0.25]}
        intensity={colors.isDark ? 2 : 0.8}
        distance={6}
        color="#FFAA44"
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Finish sign at the end of the path                                 */
/* ------------------------------------------------------------------ */

function FinishSign({
  text,
  colors,
  progressRef,
}: {
  text: string;
  colors: ThemeColors;
  progressRef: RefObject<number>;
}) {
  const groupRef = useRef<Group>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const signZ = Z_END + 6;
  const postColor = colors.isDark ? "#4A3520" : "#6B4E10";
  const boardColor = colors.isDark ? "#3A2A15" : "#8B6914";

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const camelZ = Z_START - p * TOTAL_LENGTH;
    const dist = Math.abs(camelZ - signZ);
    const fade = dist < 20 ? Math.max(0, 1 - dist / 20) : 0;

    if (contentRef.current) {
      contentRef.current.style.opacity = String(fade);
      contentRef.current.style.transform = `scale(${0.7 + fade * 0.3})`;
    }
    if (groupRef.current) {
      const s = 1 + fade * 0.05;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, signZ]}>
      {/* Left post */}
      <mesh position={[-3, 1.8, 0]}>
        <boxGeometry args={[0.25, 3.6, 0.25]} />
        <meshStandardMaterial color={postColor} roughness={0.85} />
      </mesh>
      {/* Right post */}
      <mesh position={[3, 1.8, 0]}>
        <boxGeometry args={[0.25, 3.6, 0.25]} />
        <meshStandardMaterial color={postColor} roughness={0.85} />
      </mesh>
      {/* Cross beam top */}
      <mesh position={[0, 3.7, 0]}>
        <boxGeometry args={[6.8, 0.2, 0.2]} />
        <meshStandardMaterial color={postColor} roughness={0.85} />
      </mesh>

      {/* Sign board */}
      <mesh position={[0, 2.2, -0.06]}>
        <boxGeometry args={[6, 2.8, 0.12]} />
        <meshStandardMaterial color={boardColor} roughness={0.7} />
      </mesh>

      {/* Lanterns on top */}
      <mesh position={[-2.5, 3.8, 0.15]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial
          color="#D4A054"
          emissive="#FF9933"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[2.5, 3.8, 0.15]}>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial
          color="#D4A054"
          emissive="#FF9933"
          emissiveIntensity={1}
        />
      </mesh>
      <pointLight
        position={[-2.5, 4.2, 0.3]}
        intensity={colors.isDark ? 6 : 2}
        distance={12}
        color="#FFAA44"
      />
      <pointLight
        position={[2.5, 4.2, 0.3]}
        intensity={colors.isDark ? 6 : 2}
        distance={12}
        color="#FFAA44"
      />

      {/* Text */}
      <Html
        position={[0, 2.2, 0.1]}
        center
        style={{ pointerEvents: "none", width: "340px" }}
      >
        <div
          ref={contentRef}
          style={{
            opacity: 0,
            textAlign: "center",
            transformOrigin: "center center",
          }}
        >
          {text.split("\n").map((line, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? "22px" : "17px",
                fontWeight: i === 0 ? 800 : 600,
                margin: i === 0 ? "0 0 8px" : "0",
                color: colors.isDark ? "#FFD090" : "#5A3A10",
                textShadow: colors.isDark
                  ? "0 0 20px rgba(255,136,51,0.5)"
                  : "0 1px 4px rgba(0,0,0,0.15)",
                lineHeight: "1.3",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Environment — lighting, sky, fog                                   */
/* ------------------------------------------------------------------ */

function DesertEnvironment({ colors }: { colors: ThemeColors }) {
  const bgColor = useMemo(
    () => new Color(colors.isDark ? "#0D0A04" : "#F5E6CC"),
    [colors.isDark, colors.background],
  );

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 20, 65]} />

      {/* Warm sun / moonlight */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={colors.isDark ? 0.7 : 1.6}
        color={colors.isDark ? "#FFD0A0" : "#FFF5E0"}
      />
      <ambientLight
        intensity={colors.isDark ? 0.25 : 0.4}
        color={colors.isDark ? "#3A2F1F" : "#FFF0D0"}
      />
      <hemisphereLight
        color={colors.isDark ? "#1A1040" : "#FFE0B0"}
        groundColor={colors.isDark ? "#1A1008" : "#E8D5B7"}
        intensity={colors.isDark ? 0.4 : 0.3}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main scene                                                         */
/* ------------------------------------------------------------------ */

export default function GalleryScene({
  items,
  progressRef,
  pointerXRef,
  finishSign,
}: Props) {
  const colors = useCSSVariables();
  const camelXRef = useRef(0);

  return (
    <Canvas
      camera={{ position: [1.8, 3.2, Z_START + 7], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <CameraRig progressRef={progressRef} camelXRef={camelXRef} />
      <DesertEnvironment colors={colors} />
      <DesertGround colors={colors} />
      <DesertPath colors={colors} />
      <Dunes colors={colors} />
      <DesertDecorations />
      <SandParticles colors={colors} />
      <FinishSign
        text={finishSign}
        colors={colors}
        progressRef={progressRef}
      />
      <Camel
        progressRef={progressRef}
        pointerXRef={pointerXRef}
        camelXRef={camelXRef}
        isDark={colors.isDark}
        items={items}
        colors={colors}
      />

      {items.map((item, i) => {
        const position =
          ITEM_POSITIONS[i] ?? ITEM_POSITIONS[i % ITEM_POSITIONS.length];
        const rotation =
          ITEM_ROTATIONS[i] ?? ITEM_ROTATIONS[i % ITEM_ROTATIONS.length];

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
