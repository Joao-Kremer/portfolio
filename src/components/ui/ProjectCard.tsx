"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Github, Star, ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  const t = useTranslations("projects");

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "glow-card group relative overflow-hidden rounded-2xl",
        "border border-border/50 bg-card",
        "transition-all duration-500"
      )}
    >
      {project.featured && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
          <Star className="h-3 w-3" fill="currentColor" />
          {t("featured")}
        </div>
      )}

      {/* Image with hover overlay */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={project.image}
          alt={t(`items.${project.id}.title`)}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/70 backdrop-blur-sm opacity-0 transition-all duration-500 group-hover:opacity-100">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                "bg-card border border-border/50 text-foreground",
                "transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110",
                "translate-y-4 group-hover:translate-y-0"
              )}
              aria-label={t("view_code")}
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground",
                "transition-all duration-300 hover:scale-110",
                "translate-y-4 delay-75 group-hover:translate-y-0"
              )}
              aria-label={t("view_demo")}
            >
              <ArrowUpRight className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold">{t(`items.${project.id}.title`)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {t(`items.${project.id}.description`)}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border/30 bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
