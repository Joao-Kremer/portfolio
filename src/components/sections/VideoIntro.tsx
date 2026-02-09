"use client";

import { useTranslations } from "next-intl";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import InlineVideo from "@/components/ui/InlineVideo";

export default function VideoIntro() {
  const t = useTranslations("video");

  return (
    <section id="video" className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <SectionHeading title={t("heading")} subtitle={t("description")} />
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <InlineVideo
            src="/videos/intro.mp4"
            poster="/images/video-poster.jpg"
            muteLabel={t("mute")}
            unmuteLabel={t("unmute")}
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
