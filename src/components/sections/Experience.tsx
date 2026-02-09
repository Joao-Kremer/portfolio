"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Briefcase } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import { experiences } from "@/data/experience";
import { cn } from "@/lib/utils";

export default function Experience() {
  const t = useTranslations("experience");
  const lineRef = useRef(null);
  const isInView = useInView(lineRef, { once: true, margin: "-50px" });

  return (
    <section id="experience" className="py-24 px-4 bg-muted/30">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
        </AnimatedSection>

        <div ref={lineRef} className="relative">
          {/* Animated vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute left-8 top-0 h-full w-0.5 origin-top bg-gradient-to-b from-primary via-primary/50 to-primary/10"
          />
          {/* Line glow */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            className="absolute left-[29px] top-0 h-full w-1 origin-top bg-gradient-to-b from-primary/30 via-primary/10 to-transparent blur-sm"
          />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <AnimatedSection
                key={exp.id}
                delay={0.2 * index}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-[18px] top-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      exp.current
                        ? "border-primary bg-primary/20 shadow-md shadow-primary/20"
                        : "border-border bg-background"
                    )}
                  >
                    <Briefcase className={cn(
                      "h-4 w-4",
                      exp.current ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                </div>

                {/* Card */}
                <div
                  className={cn(
                    "glow-card rounded-2xl border border-border/50 bg-card/80 p-6 sm:p-8",
                    "transition-all duration-300"
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold sm:text-xl">
                        {t(`items.${exp.id}.role`)}
                      </h3>
                      <p className="text-base font-semibold text-primary">
                        {t(`items.${exp.id}.company`)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {t(`items.${exp.id}.period`)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t(`items.${exp.id}.location`)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t(`items.${exp.id}.description`)}
                  </p>

                  {/* Tech tags */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={cn(
                          "inline-flex items-center rounded-lg px-2.5 py-1",
                          "bg-muted/60 text-xs font-medium text-foreground/70",
                          "border border-border/30"
                        )}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
