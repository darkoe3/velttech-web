import ServiceDetail from "@/components/sections/ServiceDetail";
import { servicePages } from "@/lib/service-pages";

export const metadata = {
  title: "Coding for Kids",
  description:
    "Velttech coding programs for children and teens covering Scratch, App Inventor, Tinkercad, HTML, CSS, JavaScript, Python basics, robotics, and creative projects.",
};

export default function CodingForKidsPage() {
  return <ServiceDetail service={servicePages.codingForKids} />;
}
