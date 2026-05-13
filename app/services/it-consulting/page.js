import ServiceDetail from "@/components/sections/ServiceDetail";
import { servicePages } from "@/lib/service-pages";

export const metadata = {
  title: "IT Consulting",
  description:
    "Velttech IT consulting supports digital transformation planning, technology advisory, system selection, cloud and hosting guidance, IT strategy, training, and implementation.",
};

export default function ITConsultingPage() {
  return <ServiceDetail service={servicePages.itConsulting} />;
}
