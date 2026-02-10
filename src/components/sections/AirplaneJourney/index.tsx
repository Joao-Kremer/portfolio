"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRef, useState, useEffect, type ComponentType } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import useFlightProgress from "./useFlightProgress";

const MobileFallback = dynamic(() => import("./MobileFallback"), { ssr: false });

export type Milestone = {
  key: string;
  title: string;
  description: string;
  time: string;
};

type SceneProps = {
  milestones: Milestone[];
  progressRef: React.RefObject<number>;
};

const milestoneKeys = [
  "opensource",
  "first_job",
  "tech_lead",
  "dubai_hire",
  "dubai_mission",
  "europe",
  "evolving",
] as const;

export default function AirplaneJourney() {
  const t = useTranslations("about");
  const tSection = useTranslations("airplane_journey");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useFlightProgress(scrollContainerRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  // Load AirplaneScene manually (bypasses next/dynamic + Suspense entirely).
  // This guarantees the Canvas only mounts in a clean client render, never during hydration.
  useEffect(() => {
    import("./AirplaneScene").then((mod) => {
      setScene(() => mod.default);
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const milestones: Milestone[] = milestoneKeys.map((key) => ({
    key,
    title: t(`milestones.${key}.title`),
    description: t(`milestones.${key}.description`),
    time: t(`milestones.${key}.time`),
  }));

  return (
    <section id="airplane-journey">
      <AnimatedSection>
        <div className="px-4 pt-24">
          <SectionHeading
            title={tSection("heading")}
            subtitle={tSection("subtitle")}
          />
          <p className="mx-auto -mt-6 mb-8 max-w-md text-center text-sm text-muted-foreground/60">
            {tSection("scroll_hint")}
          </p>
        </div>
      </AnimatedSection>

      {prefersReducedMotion ? (
        <MobileFallback milestones={milestones} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "350vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            {Scene && (
              <Scene
                milestones={milestones}
                progressRef={progressRef}
              />
            )}

            {/* Scroll progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
              <div className="h-12 w-px bg-gradient-to-b from-primary/40 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
