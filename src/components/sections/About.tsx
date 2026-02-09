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

/* ───── Tech stack ───── */
const techStack = {
  frontend: ["React", "Next.js", "Angular", "React Native", "TypeScript"],
  backend: ["Node.js", "NestJS", "JavaScript", "TypeScript"],
  database: ["MongoDB", "PostgreSQL"],
};

/* ───── Component ───── */
export default function About() {
  const t = useTranslations("about");
  const years = useYearsOfExperience();

  const stats = [
    { key: "experience", value: years, suffix: "+", icon: Briefcase },
    { key: "projects", value: 10, suffix: "+", icon: FolderOpen },
    { key: "technologies", value: 20, suffix: "+", icon: Code2 },
    { key: "countries", value: 3, suffix: "+", icon: Globe },
  ];

  return (
    <section id="about" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle", { years })} />
        </AnimatedSection>

        {/* Bio */}
        <AnimatedSection delay={0.15}>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-lg leading-relaxed text-foreground/90 font-medium">
              {t("bio_intro", { years })}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t("bio_detail")}
            </p>
          </div>
        </AnimatedSection>

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

        {/* Tech Stack */}
        <AnimatedSection delay={0.4}>
          <div className="mt-20">
            <h3 className="mb-8 text-center text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="gradient-text">{t("tech_title")}</span>
            </h3>

            <div className="grid gap-6 sm:grid-cols-3">
              {(Object.keys(techStack) as (keyof typeof techStack)[]).map((category, ci) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: ci * 0.12 }}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-card/50 p-5",
                    "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  )}
                >
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                    {t(`tech.${category}`)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack[category].map((tech, ti) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: ci * 0.12 + ti * 0.05 }}
                        className={cn(
                          "rounded-lg border border-border/50 bg-muted/50 px-3 py-1.5",
                          "text-sm text-foreground/80 font-medium",
                          "transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
