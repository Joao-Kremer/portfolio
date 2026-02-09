"use client";

import { useRef, useState, useEffect, type ComponentType } from "react";
import useFlightProgress from "../AirplaneJourney/useFlightProgress";

export type GalleryItemData = {
  src: string;
  type: "image" | "video";
  alt: string;
  caption: string;
  location: string;
};

type SceneProps = {
  items: GalleryItemData[];
  progressRef: React.RefObject<number>;
};

type Props = {
  items: GalleryItemData[];
};

export default function PhotoGallery3D({ items }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useFlightProgress(scrollContainerRef);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    import("./GalleryScene").then((mod) => {
      setScene(() => mod.default);
    });
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="relative"
      style={{ height: "600vh" }}
    >
      <div className="sticky top-0 h-screen w-full">
        {Scene && <Scene items={items} progressRef={progressRef} />}

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="h-12 w-px bg-gradient-to-b from-primary/40 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
