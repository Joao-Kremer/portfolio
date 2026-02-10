"use client";

import { useTranslations } from "next-intl";
import {
  Briefcase,
  FolderOpen,
  Code2,
  Globe,
} from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/* ───── Dynamic experience calculation ───── */
const CAREER_START = new Date(2023, 9); // October 2023

function useYearsOfExperience() {
  return useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - CAREER_START.getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    return Math.ceil(years);
  }, []);
}

/* ───── Animated counter ───── */
function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

const storyChapters = ["bakery", "leap", "first_try", "return", "rise", "destiny", "present"];

/* ───── Component ───── */
export default function About() {
  const t = useTranslations("about");
  const years = useYearsOfExperience();

  const stats = [
    { key: "experience", value: years, suffix: "+", icon: Briefcase },
    { key: "projects", value: 30, suffix: "+", icon: FolderOpen },
    { key: "technologies", value: 50, suffix: "+", icon: Code2 },
    { key: "countries", value: 3, suffix: "+", icon: Globe },
  ];

  return (
    <section id="about" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle", { years })} />
        </AnimatedSection>

        {/* Bio intro */}
        <AnimatedSection delay={0.15}>
          <p className="mx-auto max-w-2xl text-center text-xl leading-relaxed text-foreground/90 font-medium italic">
            &ldquo;{t("bio_intro")}&rdquo;
          </p>
        </AnimatedSection>

        {/* Story chapters */}
        <div className="mx-auto mt-14 max-w-3xl">
          {storyChapters.map((key, i) => (
            <AnimatedSection key={key} delay={0.1 * i}>
              <div className="group relative flex gap-5 pb-10">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    "border-2 border-primary/40 bg-primary/10 text-primary",
                    "transition-all duration-300 group-hover:border-primary group-hover:bg-primary/20 group-hover:scale-110"
                  )}>
                    {i + 1}
                  </div>
                  {i < storyChapters.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-gradient-to-b from-primary/30 to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-2 pt-0.5">
                  <h4 className="text-base font-bold text-foreground tracking-tight sm:text-lg">
                    {t(`story.${key}.title`)}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t(`story.${key}.text`)}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Stats */}
        <AnimatedSection delay={0.3}>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(({ key, value, suffix, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-2xl p-6",
                  "border border-border/50 bg-card/50 overflow-hidden",
                  "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="relative text-3xl font-bold gradient-text">
                  <AnimatedCounter value={value} suffix={suffix} />
                </span>
                <span className="relative text-center text-xs text-muted-foreground">
                  {t(`stats.${key}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
