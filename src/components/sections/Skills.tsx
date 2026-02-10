"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Monitor, Server, Database as DatabaseIcon, Wrench, Smartphone } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import { skills } from "@/data/skills";
import { cn } from "@/lib/utils";

const categories = [
  { key: "frontend" as const, icon: Monitor, span: "sm:col-span-2 lg:col-span-2" },
  { key: "mobile" as const, icon: Smartphone, span: "" },
  { key: "backend" as const, icon: Server, span: "" },
  { key: "database" as const, icon: DatabaseIcon, span: "sm:col-span-2 lg:col-span-1" },
  { key: "tools" as const, icon: Wrench, span: "sm:col-span-2 lg:col-span-2" },
];

export default function Skills() {
  const t = useTranslations("skills");

  return (
    <section id="skills" className="py-24 px-4 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ key, icon: Icon, span }, catIndex) => {
            const categorySkills = skills.filter((s) => s.category === key);
            return (
              <AnimatedSection key={key} delay={0.1 * catIndex} className={span}>
                <div
                  className={cn(
                    "glow-card group h-full rounded-2xl border border-border/50 bg-card/80 p-6",
                    "transition-all duration-300"
                  )}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t(`categories.${key}`)}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill, index) => (
                      <motion.span
                        key={skill.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: catIndex * 0.1 + index * 0.04,
                          duration: 0.3,
                        }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        className={cn(
                          "inline-flex items-center rounded-lg px-3 py-1.5",
                          "bg-muted/60 text-sm font-medium text-foreground/80",
                          "border border-border/30",
                          "transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        {skill.name}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
