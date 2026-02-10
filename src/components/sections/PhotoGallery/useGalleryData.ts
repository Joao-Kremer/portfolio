"use client";

import { useTranslations } from "next-intl";
import { galleryItems, type GalleryItem } from "@/data/gallery";

export type GalleryItemWithI18n = GalleryItem & {
  alt: string;
  caption: string;
  location: string;
  story: string;
};

export default function useGalleryData(): GalleryItemWithI18n[] {
  const t = useTranslations("photo_gallery");

  return galleryItems.map((item) => ({
    ...item,
    alt: t(`items.${item.id}.alt`),
    caption: t(`items.${item.id}.caption`),
    location: t(`items.${item.id}.location`),
    story: t(`items.${item.id}.story`),
  }));
}
