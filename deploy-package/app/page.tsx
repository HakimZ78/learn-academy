import HeroWithBg from "@/components/home/HeroWithBg";
import Philosophy from "@/components/home/Philosophy";
import Programs from "@/components/home/Programs";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import SampleLessons from "@/components/home/SampleLessons";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <HeroWithBg />
      <Philosophy />
      <Programs />
      <WhyChooseUs />
      <SampleLessons />
      <CTA />
    </>
  );
}
