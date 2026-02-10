import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Group,
  Mesh,
  AdditiveBlending,
  SRGBColorSpace,
  VideoTexture,
  MathUtils,
} from "three";
import type { GalleryItemWithI18n } from "./useGalleryData";
import type { ThemeColors } from "@/components/sections/AirplaneJourney/useCSSVariables";

type Props = {
  item: GalleryItemWithI18n;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  progressRef: React.RefObject<number>;
  milestoneT: number;
  colors: ThemeColors;
};

function ImageCard({
  item,
  index,
  position,
  rotation,
  progressRef,
  milestoneT,
  colors,
}: Props) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const innerGlowRef = useRef<Mesh>(null);
  const photoRef = useRef<Mesh>(null);
  const prevGlow = useRef(0);
  const prevScale = useRef(0.7);
  const prevOpacity = useRef(0);
  const baseY = position[1];

  const texture = useTexture(item.src);
  texture.colorSpace = SRGBColorSpace;

  const photoHeight = 4.2;
  const photoWidth = photoHeight * item.aspectRatio;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime;
    // Subtle breathing
    groupRef.current.position.y =
      baseY + Math.sin(t * 0.35 + index * 1.5) * 0.03;
    // Subtle rotation sway
    groupRef.current.rotation.z =
      rotation[2] + Math.sin(t * 0.25 + index * 0.8) * 0.008;

    const p = progressRef.current ?? 0;
    const dist = Math.abs(p - milestoneT);

    // Scale: dramatic zoom from 0.7 to 1.0 as camera approaches
    const scaleTarget =
      dist < 0.06
        ? 1.0
        : MathUtils.lerp(1.0, 0.7, Math.min(1, (dist - 0.06) / 0.05));
    prevScale.current += (scaleTarget - prevScale.current) * 0.1;
    groupRef.current.scale.setScalar(prevScale.current);

    // Depth-based opacity: fade out distant photos
    const opacityTarget =
      dist < 0.07
        ? 1.0
        : MathUtils.lerp(1.0, 0.15, Math.min(1, (dist - 0.07) / 0.04));
    prevOpacity.current += (opacityTarget - prevOpacity.current) * 0.12;

    if (photoRef.current) {
      (photoRef.current.material as { opacity: number }).opacity =
        prevOpacity.current;
    }

    // Glow halo — wider and more dramatic
    const glowTarget = dist < 0.06 ? (1 - dist / 0.06) * 0.5 : 0;
    prevGlow.current += (glowTarget - prevGlow.current) * 0.1;
    if (glowRef.current) {
      (glowRef.current.material as { opacity: number }).opacity =
        prevGlow.current;
    }
    if (innerGlowRef.current) {
      (innerGlowRef.current.material as { opacity: number }).opacity =
        prevGlow.current * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Outer glow halo */}
      <mesh ref={glowRef} position={[0, 0, -0.12]}>
        <planeGeometry args={[photoWidth + 1.2, photoHeight + 1.2]} />
        <meshBasicMaterial
          color={colors.gradientFrom}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow — softer */}
      <mesh ref={innerGlowRef} position={[0, 0, -0.08]}>
        <planeGeometry args={[photoWidth + 0.5, photoHeight + 0.5]} />
        <meshBasicMaterial
          color={colors.gradientVia}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Thin elegant border */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[photoWidth + 0.1, photoHeight + 0.1]} />
        <meshBasicMaterial
          color={colors.card}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Photo — meshBasicMaterial so it's always full brightness */}
      <mesh ref={photoRef}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshBasicMaterial map={texture} transparent opacity={1} />
      </mesh>
    </group>
  );
}

function VideoCard({
  item,
  index,
  position,
  rotation,
  progressRef,
  milestoneT,
  colors,
}: Props) {
  const groupRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const prevGlow = useRef(0);
  const prevScale = useRef(0.7);
  const prevOpacity = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null);
  const wasPlaying = useRef(false);
  const baseY = position[1];

  const photoHeight = 4.2;
  const photoWidth = photoHeight * item.aspectRatio;

  useEffect(() => {
    const video = document.createElement("video");
    video.src = item.src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    videoRef.current = video;

    const tex = new VideoTexture(video);
    tex.colorSpace = SRGBColorSpace;
    setVideoTexture(tex);

    return () => {
      video.pause();
      video.src = "";
      tex.dispose();
    };
  }, [item.src]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.elapsedTime;
    groupRef.current.position.y =
      baseY + Math.sin(t * 0.35 + index * 1.5) * 0.03;
    groupRef.current.rotation.z =
      rotation[2] + Math.sin(t * 0.25 + index * 0.8) * 0.008;

    const p = progressRef.current ?? 0;
    const dist = Math.abs(p - milestoneT);

    // Scale
    const scaleTarget =
      dist < 0.06
        ? 1.0
        : MathUtils.lerp(1.0, 0.7, Math.min(1, (dist - 0.06) / 0.05));
    prevScale.current += (scaleTarget - prevScale.current) * 0.1;
    groupRef.current.scale.setScalar(prevScale.current);

    // Depth opacity
    const opacityTarget =
      dist < 0.07
        ? 1.0
        : MathUtils.lerp(1.0, 0.15, Math.min(1, (dist - 0.07) / 0.04));
    prevOpacity.current += (opacityTarget - prevOpacity.current) * 0.12;

    // Auto-play/pause
    const shouldPlay = dist < 0.07;
    if (videoRef.current) {
      if (shouldPlay && !wasPlaying.current) {
        videoRef.current.play().catch(() => {});
        wasPlaying.current = true;
      } else if (!shouldPlay && wasPlaying.current) {
        videoRef.current.pause();
        wasPlaying.current = false;
      }
    }

    // Glow
    const glowTarget = dist < 0.06 ? (1 - dist / 0.06) * 0.5 : 0;
    prevGlow.current += (glowTarget - prevGlow.current) * 0.1;
    if (glowRef.current) {
      (glowRef.current.material as { opacity: number }).opacity =
        prevGlow.current;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Glow */}
      <mesh ref={glowRef} position={[0, 0, -0.12]}>
        <planeGeometry args={[photoWidth + 1.2, photoHeight + 1.2]} />
        <meshBasicMaterial
          color={colors.gradientFrom}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Border */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[photoWidth + 0.1, photoHeight + 0.1]} />
        <meshBasicMaterial color={colors.card} transparent opacity={0.5} />
      </mesh>

      {/* Video */}
      {videoTexture && (
        <mesh>
          <planeGeometry args={[photoWidth, photoHeight]} />
          <meshBasicMaterial map={videoTexture} transparent opacity={1} />
        </mesh>
      )}
    </group>
  );
}

export default function PhotoCard(props: Props) {
  if (props.item.type === "video") {
    return <VideoCard {...props} />;
  }
  return <ImageCard {...props} />;
}
