import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";
import VeltSmartSchoolProduct from "@/components/sections/VeltSmartSchoolProduct";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <VeltSmartSchoolProduct />
      <FAQ />
      <CTA />
    </>
  );
}
