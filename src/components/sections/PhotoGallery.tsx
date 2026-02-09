"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import PhotoGallery3D from "@/components/sections/PhotoGallery3D";
import { galleryImages } from "@/data/gallery";

export default function PhotoGallery() {
  const t = useTranslations("gallery");

  const translatedImages = galleryImages.map((img) => ({
    src: img.src,
    alt: t(`items.${img.id}.alt`),
    caption: t(`items.${img.id}.caption`),
    location: t(`items.${img.id}.location`),
  }));

  return (
    <section id="gallery">
      <AnimatedSection>
        <div className="px-4 pt-24">
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
          <p className="mx-auto -mt-6 mb-8 max-w-md text-center text-sm text-muted-foreground/60">
            {t("scroll_hint")}
          </p>
        </div>
      </AnimatedSection>

      <PhotoGallery3D photos={translatedImages} />
    </section>
  );
}
