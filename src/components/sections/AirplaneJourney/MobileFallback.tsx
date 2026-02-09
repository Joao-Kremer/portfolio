"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Milestone } from "./index";

type Props = {
  milestones: Milestone[];
};

export default function MobileFallback({ milestones }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // The drawn portion of the path (0 → 1)
  const pathLength = useTransform(scrollYProgress, [0.05, 0.85], [0, 1]);
  // Airplane vertical position
  const airplaneTop = useTransform(scrollYProgress, [0.05, 0.85], ["0%", "100%"]);
  // Airplane glow intensity
  const airplaneOpacity = useTransform(scrollYProgress, [0, 0.05, 0.8, 0.9], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative px-4 pb-24">
      <div className="mx-auto max-w-lg">
        {/* SVG dashed flight path that draws itself */}
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-4 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="flight-path-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gradient-from)" />
              <stop offset="50%" stopColor="var(--gradient-via)" />
              <stop offset="100%" stopColor="var(--gradient-to)" />
            </linearGradient>
          </defs>
          {/* Background dashed line (faint) */}
          <line
            x1="8" y1="0" x2="8" y2="100%"
            stroke="var(--primary)"
            strokeOpacity="0.1"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          {/* Animated drawn line */}
          <motion.line
            x1="8" y1="0" x2="8" y2="100%"
            stroke="url(#flight-path-gradient)"
            strokeWidth="2"
            strokeDasharray="8 6"
            style={{
              pathLength,
              strokeOpacity: 0.6,
            }}
          />
        </svg>

        {/* Flying airplane indicator */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{ top: airplaneTop, opacity: airplaneOpacity }}
        >
          <div className="relative -mt-3 flex h-7 w-7 items-center justify-center">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-via)] opacity-30 blur-md animate-pulse" />
            {/* Airplane icon */}
            <svg
              viewBox="0 0 24 24"
              className="relative h-4 w-4 text-primary drop-shadow-[0_0_6px_var(--gradient-from)]"
              fill="currentColor"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </motion.div>

        <div className="space-y-8">
          {milestones.map((milestone, i) => {
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={milestone.key}
                initial={{ opacity: 0, x: isLeft ? -30 : 30, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                  ease: "easeOut",
                }}
                className={cn(
                  "relative",
                  isLeft ? "pr-[52%] text-right" : "pl-[52%] text-left"
                )}
              >
                {/* Waypoint dot */}
                <div className="absolute left-1/2 top-3 -translate-x-1/2">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, ease: "easeOut", type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/40 bg-background"
                  >
                    {/* Pulse ring on appear */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      whileInView={{ scale: 2, opacity: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="absolute inset-0 rounded-full border border-primary/40"
                    />
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 text-primary"
                      fill="currentColor"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </motion.div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm",
                    "transition-colors duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  )}
                >
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {milestone.time}
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-foreground">
                    {milestone.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {milestone.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
