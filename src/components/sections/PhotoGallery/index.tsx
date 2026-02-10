"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ComponentType,
} from "react";
import { cn } from "@/lib/utils";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import useFlightProgress from "@/components/sections/AirplaneJourney/useFlightProgress";
import useGalleryData, { type GalleryItemWithI18n } from "./useGalleryData";

const MobileFallback = dynamic(() => import("./MobileFallback"), {
  ssr: false,
});

type SceneProps = {
  items: GalleryItemWithI18n[];
  progressRef: React.RefObject<number>;
};

/** DOM overlay showing narrative card, counter, and progress — positioned on top of Canvas */
function GalleryOverlay({
  items,
  progressRef,
}: {
  items: GalleryItemWithI18n[];
  progressRef: React.RefObject<number>;
}) {
  const [state, setState] = useState({ index: 0, opacity: 0, progress: 0 });
  const prevSmoothed = useRef(0);

  const update = useCallback(() => {
    const p = progressRef.current ?? 0;
    const numPhotos = items.length;
    const milestoneTs = items.map((_, i) => (i + 0.5) / numPhotos);

    // Find closest photo
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < numPhotos; i++) {
      const d = Math.abs(p - milestoneTs[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }

    // Narrative opacity — synced with photo depth-opacity thresholds
    // PhotoCard: full opacity at dist < 0.07, fades to 0.15 at dist ≈ 0.11
    let targetOpacity = 0;
    if (bestDist < 0.07) {
      targetOpacity = 1.0;
    } else if (bestDist < 0.11) {
      targetOpacity = 1.0 - (bestDist - 0.07) / 0.04;
    }

    // Smooth the opacity
    prevSmoothed.current +=
      (targetOpacity - prevSmoothed.current) * 0.08;
    const rounded = Math.round(prevSmoothed.current * 100) / 100;

    setState((prev) => {
      if (
        prev.index !== bestIndex ||
        Math.abs(prev.opacity - rounded) > 0.01 ||
        Math.abs(prev.progress - p) > 0.005
      ) {
        return { index: bestIndex, opacity: rounded, progress: p };
      }
      return prev;
    });
  }, [items, progressRef]);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      update();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [update]);

  const item = items[state.index];
  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Narrative card — bottom left */}
      <div
        className="absolute bottom-12 left-8 max-w-sm"
        style={{
          opacity: state.opacity,
          transform: `translateY(${(1 - state.opacity) * 20}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="rounded-2xl border border-border/40 bg-card/85 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          {/* Location badge */}
          <div className="mb-3 flex items-center gap-3">
            <svg
              className="h-3.5 w-3.5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-xs font-medium tracking-wide text-primary">
              {item.location}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          {/* Caption */}
          <h4 className="text-lg font-bold tracking-tight text-foreground">
            {item.caption}
          </h4>

          {/* Story */}
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {item.story}
          </p>
        </div>
      </div>

      {/* Photo counter — bottom right */}
      <div
        className="absolute bottom-12 right-8 flex items-center gap-3"
        style={{ opacity: Math.max(0.4, state.opacity) }}
      >
        <span className="font-mono text-sm tabular-nums text-foreground/70">
          <span className="text-lg font-bold text-primary">
            {String(state.index + 1).padStart(2, "0")}
          </span>
          <span className="mx-1 text-muted-foreground/50">/</span>
          <span className="text-muted-foreground/70">
            {String(items.length).padStart(2, "0")}
          </span>
        </span>
      </div>

      {/* Vertical progress bar — right edge */}
      <div className="absolute right-4 top-1/2 flex h-40 -translate-y-1/2 flex-col items-center gap-2">
        <div className="relative h-full w-px overflow-hidden rounded-full bg-border/30">
          <div
            className="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)]"
            style={{
              height: `${state.progress * 100}%`,
              transition: "height 0.15s ease-out",
            }}
          />
        </div>
      </div>

      {/* Dots navigation */}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2.5">
        <div className="h-[1px] w-[1px]" style={{ marginTop: "84px" }} />
        {items.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-300",
              state.index === i
                ? "scale-150 bg-primary shadow-[0_0_6px_var(--gradient-from)]"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function PhotoGallery() {
  const t = useTranslations("photo_gallery");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useFlightProgress(scrollContainerRef);
  const items = useGalleryData();
  const [isMobile, setIsMobile] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    import("./GalleryScene").then((mod) => {
      setScene(() => mod.default);
    });
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section id="photo-gallery">
      <AnimatedSection>
        <div className="px-4 pt-24">
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
          <p className="mx-auto -mt-6 mb-8 max-w-md text-center text-sm text-muted-foreground/60">
            {t("scroll_hint")}
          </p>
        </div>
      </AnimatedSection>

      {isMobile ? (
        <MobileFallback items={items} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "750vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            {Scene && <Scene items={items} progressRef={progressRef} />}

            {/* DOM overlay: narrative + counter + progress */}
            <GalleryOverlay items={items} progressRef={progressRef} />

            {/* Scroll hint at bottom */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
              <div className="h-8 w-px animate-pulse bg-gradient-to-b from-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
