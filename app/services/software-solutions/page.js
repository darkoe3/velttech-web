import ServiceDetail from "@/components/sections/ServiceDetail";
import { servicePages } from "@/lib/service-pages";

export const metadata = {
  title: "Software Solutions",
  description:
    "Velttech builds custom websites, business systems, school platforms, dashboards, workflow automation tools, and web applications for real operational needs.",
};

export default function SoftwareSolutionsPage() {
  return <ServiceDetail service={servicePages.softwareSolutions} />;
}
