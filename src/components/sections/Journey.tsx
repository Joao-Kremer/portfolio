"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Rocket, TrendingUp, Globe, MapPin } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const steps = [
  { key: "start", icon: Rocket },
  { key: "growth", icon: TrendingUp },
  { key: "opportunity", icon: Globe },
  { key: "dubai", icon: MapPin },
];

export default function Journey() {
  const t = useTranslations("journey");
  const lineRef = useRef(null);
  const isInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
        </AnimatedSection>

        <div ref={lineRef} className="relative">
          {/* Animated connecting line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-6 top-0 h-full w-0.5 origin-top bg-gradient-to-b from-primary via-violet-500 to-fuchsia-500 md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-12 md:space-y-16">
            {steps.map(({ key, icon: Icon }, index) => (
              <AnimatedSection
                key={key}
                delay={0.2 + index * 0.2}
                className={cn(
                  "relative flex items-start gap-6 md:gap-0",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Content */}
                <div
                  className={cn(
                    "flex-1 md:w-5/12",
                    index % 2 === 0
                      ? "md:pr-12 md:text-right"
                      : "md:pl-12 md:text-left"
                  )}
                >
                  <h3 className="text-xl font-bold">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>

                {/* Circle icon */}
                <div className="absolute left-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/10 md:relative md:left-auto md:mx-auto">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden flex-1 md:block md:w-5/12" />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
