import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import VideoIntro from "@/components/sections/VideoIntro";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import AirplaneJourney from "@/components/sections/AirplaneJourney";
import PhotoGallery from "@/components/sections/PhotoGallery";
import SkillsUniverse from "@/components/sections/SkillsUniverse";
import SectionDivider from "@/components/ui/SectionDivider";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <SectionDivider />
      <AirplaneJourney />
      <SectionDivider />
      {/* <VideoIntro />
      <SectionDivider /> */}
      <PhotoGallery />
      <SectionDivider />
      <SkillsUniverse />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Contact />
    </>
  );
}
