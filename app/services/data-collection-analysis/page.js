import ServiceDetail from "@/components/sections/ServiceDetail";
import { servicePages } from "@/lib/service-pages";

export const metadata = {
  title: "Data Collection & Analysis",
  description:
    "Velttech data collection and analysis services for schools, NGOs, businesses, and institutions, including data cleaning, Excel analysis, Power BI dashboards, reports, and visualizations.",
};

export default function DataCollectionAnalysisPage() {
  return <ServiceDetail service={servicePages.dataCollectionAnalysis} />;
}
