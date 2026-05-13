import CTA from "@/components/sections/CTA";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Stats from "@/components/sections/Stats";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <FAQ />
      <CTA />
    </>
  );
}
