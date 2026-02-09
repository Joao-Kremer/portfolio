"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  poster?: string;
  muteLabel: string;
  unmuteLabel: string;
};

export default function InlineVideo({
  src,
  poster,
  muteLabel,
  unmuteLabel,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Gradient glow border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/50 via-violet-500/50 to-fuchsia-500/50 opacity-60" />

      <div className="relative m-[1px] overflow-hidden rounded-2xl bg-background">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="aspect-video w-full cursor-pointer object-cover"
          onClick={togglePlay}
        />

        {/* Overlay controls */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110"
            >
              <Play className="h-7 w-7 text-white" fill="white" />
            </button>
          )}
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className={cn(
            "absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center",
            "rounded-full bg-black/40 backdrop-blur-sm text-white",
            "transition-all hover:bg-black/60 hover:scale-110"
          )}
          aria-label={isMuted ? unmuteLabel : muteLabel}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
