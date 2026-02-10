"use client";

import { useRef, useState, useEffect, type ComponentType } from "react";
import useFlightProgress from "../AirplaneJourney/useFlightProgress";

export type GalleryItemData = {
  src: string;
  type: "image" | "video";
  alt: string;
  caption: string;
  location: string;
  comments: string[];
};

type SceneProps = {
  items: GalleryItemData[];
  progressRef: React.RefObject<number>;
  pointerXRef: React.RefObject<number>;
  finishSign: string;
};

type Props = {
  items: GalleryItemData[];
  finishSign: string;
};

export default function PhotoGallery3D({ items, finishSign }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useFlightProgress(scrollContainerRef);
  const pointerXRef = useRef(0);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    import("./GalleryScene").then((mod) => {
      setScene(() => mod.default);
    });
  }, []);

  /* Track pointer X on the scroll container so it works during scroll */
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const update = (clientX: number) => {
      pointerXRef.current = (clientX / window.innerWidth) * 2 - 1;
    };

    const onPointer = (e: PointerEvent) => update(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) update(e.touches[0].clientX);
    };

    el.addEventListener("pointermove", onPointer, { passive: true });
    el.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onPointer);
      el.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="relative"
      style={{ height: "900vh" }}
    >
      <div className="sticky top-0 h-screen w-full">
        {Scene && (
          <Scene
            items={items}
            progressRef={progressRef}
            pointerXRef={pointerXRef}
            finishSign={finishSign}
          />
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <div className="h-12 w-px bg-gradient-to-b from-primary/40 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
