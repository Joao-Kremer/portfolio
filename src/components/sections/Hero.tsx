"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowDown, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import HeroGlobe from "@/components/sections/HeroGlobe";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Hero() {
  const t = useTranslations("hero");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Dot grid pattern */}
      <div className="pointer-events-none absolute inset-0 dot-grid" />

      {/* 3D Globe background */}
      <HeroGlobe />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl text-center select-none"
      >
        <motion.p
          variants={item}
          className="mb-4 text-sm font-medium uppercase tracking-widest text-primary sm:text-base"
        >
          {t("greeting")}
        </motion.p>

        <motion.h1
          variants={item}
          className="mb-2 text-6xl font-extrabold tracking-tighter sm:text-7xl lg:text-8xl"
        >
          <span className="gradient-text drop-shadow-[0_0_40px_var(--gradient-from)]">
            {t("name")}
          </span>
        </motion.h1>

        <motion.h1
          variants={item}
          className="mb-6 text-5xl font-bold tracking-tighter text-foreground/80 sm:text-6xl lg:text-7xl"
        >
          {t("surname")}
        </motion.h1>

        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium">{t("title")}</span>
        </motion.div>

        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => scrollTo("airplane-journey")}
            className={cn(
              "group relative flex items-center gap-2 rounded-full px-6 py-3",
              "bg-primary text-primary-foreground font-medium",
              "transition-all duration-300 hover:scale-105",
              "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40"
            )}
          >
            <span className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60" />
            <span className="relative flex items-center gap-2">
              <Plane className="h-4 w-4" />
              {t("cta_story")}
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
