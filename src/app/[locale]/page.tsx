import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import VideoIntro from "@/components/sections/VideoIntro";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import AirplaneJourney from "@/components/sections/AirplaneJourney";
import PhotoGallery from "@/components/sections/PhotoGallery";
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
      <VideoIntro />
      <SectionDivider />
      <PhotoGallery />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Skills />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Contact />
    </>
  );
}
