"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import PhotoCarousel from "@/components/ui/PhotoCarousel";
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
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("subtitle")} />
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <PhotoCarousel images={translatedImages} />
        </AnimatedSection>
      </div>
    </section>
  );
}
