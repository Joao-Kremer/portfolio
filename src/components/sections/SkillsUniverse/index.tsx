"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ComponentType,
} from "react";
import { useTranslations } from "next-intl";
import { Monitor, Smartphone, Server, Database as DatabaseIcon, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import useFlightProgress from "@/components/sections/AirplaneJourney/useFlightProgress";
import { skills } from "@/data/skills";
import { RING_CONFIGS, getActiveCategoryIndex, getCategoryFocus } from "./orbitalMath";

/* ───── Constants ───── */
const CATEGORY_KEYS = ["frontend", "mobile", "backend", "database", "tools"] as const;
const CATEGORY_ICONS = [Monitor, Smartphone, Server, DatabaseIcon, Wrench];

const skillsByCategory = CATEGORY_KEYS.map((key) =>
  skills.filter((s) => s.category === key).map((s) => s.name)
);

type SceneProps = {
  progressRef: React.RefObject<number>;
};

/* ───── DOM Overlay ───── */
function CategoryOverlay({
  progressRef,
  t,
}: {
  progressRef: React.RefObject<number>;
  t: (key: string) => string;
}) {
  const [state, setState] = useState({
    index: -1,
    opacity: 0,
    progress: 0,
  });
  const prevSmoothed = useRef(0);
  const prevIndex = useRef(-1);
  const transitionCooldown = useRef(0);

  const update = useCallback(() => {
    const p = progressRef.current ?? 0;
    const idx = getActiveCategoryIndex(p);

    // Detect category switch
    if (idx !== prevIndex.current) {
      prevIndex.current = idx;
      prevSmoothed.current = 0;
      transitionCooldown.current = 6;
    }

    if (transitionCooldown.current > 0) {
      transitionCooldown.current--;
      prevSmoothed.current = 0;
    } else if (idx >= 0) {
      const focus = getCategoryFocus(p, idx);
      const targetOpacity = Math.min(1, focus * 1.5);
      prevSmoothed.current += (targetOpacity - prevSmoothed.current) * 0.18;
    } else {
      prevSmoothed.current += (0 - prevSmoothed.current) * 0.18;
    }

    const rounded = Math.round(prevSmoothed.current * 100) / 100;

    setState((prev) => {
      if (
        prev.index !== idx ||
        Math.abs(prev.opacity - rounded) > 0.01 ||
        Math.abs(prev.progress - p) > 0.005
      ) {
        return { index: idx, opacity: rounded, progress: p };
      }
      return prev;
    });
  }, [progressRef]);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      update();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [update]);

  const Icon = state.index >= 0 ? CATEGORY_ICONS[state.index] : null;
  const categoryKey = state.index >= 0 ? CATEGORY_KEYS[state.index] : null;
  const categorySkills = state.index >= 0 ? skillsByCategory[state.index] : [];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* World label — top left */}
      {categoryKey && Icon && (
        <div
          className="absolute left-3 right-3 top-16 sm:left-8 sm:right-auto sm:top-20"
          style={{
            opacity: state.opacity,
            transform: `translateY(${(1 - state.opacity) * 15}px)`,
          }}
        >
          <div className="max-w-xs sm:max-w-sm rounded-2xl border border-border/30 bg-card/80 p-3 sm:p-4 backdrop-blur-xl shadow-lg shadow-primary/5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-xl font-bold gradient-text leading-tight truncate">
                  {t(`worlds.${categoryKey}`)}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {t(`descriptions.${categoryKey}`)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-border/20 pt-2">
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                <span className="font-semibold text-primary">{categorySkills.length}</span>{" "}
                {t("tech_count")}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              <span className="text-[10px] sm:text-xs text-muted-foreground/50 whitespace-nowrap">
                {t("orbit_label")} {state.index + 1}/{RING_CONFIGS.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Skill badges — bottom center */}
      {categorySkills.length > 0 && (
        <div
          className="absolute bottom-16 sm:bottom-12 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 sm:px-8"
          style={{
            opacity: state.opacity,
            transform: `translateY(${(1 - state.opacity) * 20}px)`,
          }}
        >
          <div className="max-h-[35vh] overflow-y-auto rounded-2xl border border-border/40 bg-card/85 p-3 sm:p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {categorySkills.map((name) => (
                <span
                  key={name}
                  className={cn(
                    "inline-flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5",
                    "bg-muted/60 text-xs sm:text-sm font-medium text-foreground/80",
                    "border border-border/30"
                  )}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}


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

      {/* Dot indicators */}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2.5">
        <div className="h-[1px] w-[1px]" style={{ marginTop: "84px" }} />
        {RING_CONFIGS.map((_, i) => (
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

/* ───── Main Section ───── */
export default function SkillsUniverse() {
  const t = useTranslations("skills_universe");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useFlightProgress(scrollContainerRef);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);

  useEffect(() => {
    import("./PlanetaryScene").then((mod) => {
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

  return (
    <section id="skills">
      <AnimatedSection>
        <div className="px-4 pt-24">
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
          <p className="mx-auto -mt-6 mb-8 max-w-md text-center text-sm text-muted-foreground/60">
            {t("scroll_hint")}
          </p>
        </div>
      </AnimatedSection>

      {prefersReducedMotion ? (
        <ReducedMotionFallback t={t} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="relative"
          style={{ height: "700vh" }}
        >
          <div className="sticky top-0 h-screen w-full">
            {Scene && <Scene progressRef={progressRef} />}
            <CategoryOverlay progressRef={progressRef} t={t} />

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

/* ───── Reduced motion fallback (accessibility only) ───── */
function ReducedMotionFallback({ t }: { t: (key: string) => string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORY_KEYS.map((key, i) => {
          const Icon = CATEGORY_ICONS[i];
          const catSkills = skillsByCategory[i];
          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border border-border/50 bg-card/80 p-5",
                i === 0 || i === 4 ? "sm:col-span-2" : ""
              )}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {t(`categories.${key}`)}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((name) => (
                  <span
                    key={name}
                    className={cn(
                      "rounded-lg border border-border/30 bg-muted/50 px-3 py-1.5",
                      "text-sm font-medium text-foreground/80"
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
