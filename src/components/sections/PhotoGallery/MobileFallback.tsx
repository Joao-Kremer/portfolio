"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { GalleryItemWithI18n } from "./useGalleryData";

type Props = {
  items: GalleryItemWithI18n[];
};

export default function MobileFallback({ items }: Props) {
  return (
    <div className="px-4 pb-16">
      <div className="mx-auto flex max-w-md flex-col gap-10">
        {items.map((item, i) => {
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group relative"
            >
              {/* Photo with cinematic aspect */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-primary/10">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {item.type === "video" ? (
                    <video
                      src={item.src}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 448px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Location badge */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      {item.location}
                    </span>
                  </div>

                  {/* Caption over image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-lg font-bold text-white drop-shadow-lg">
                      {item.caption}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Story narrative below */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.15,
                  ease: "easeOut",
                }}
                className={cn(
                  "mt-4 rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm",
                  isLeft ? "mr-4" : "ml-4"
                )}
              >
                <div className={cn("flex items-center gap-2 mb-2", isLeft ? "" : "flex-row-reverse")}>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                </div>
                <p className={cn(
                  "text-sm leading-relaxed text-muted-foreground",
                  isLeft ? "text-left" : "text-right"
                )}>
                  {item.story}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
