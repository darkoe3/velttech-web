import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LineChart,
  Microscope,
  UsersRound,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Data Collection Services for NGOs, Government & Academia in Ghana",
  description:
    "Velttech provides professional data collection, monitoring & evaluation (M&E), research support, Power BI dashboards, Excel reporting, and data analysis services in Ghana for NGOs, government agencies, businesses, and academic institutions.",
};

const developmentServices = [
  "Digital data collection solutions using ODK, KoboToolbox, Microsoft Forms, and mobile-friendly survey tools",
  "Real-time dashboards and reporting systems using Power BI and Microsoft Excel",
  "Data cleaning, validation, and reporting support",
  "Capacity building and practical training for field officers and project staff",
  "In-service training in Excel-based reporting and digital data collection systems",
  "Project performance tracking and visualization dashboards",
];

const developmentAudience = [
  "NGOs and non-profit organizations",
  "Government ministries and agencies",
  "Metropolitan, Municipal & District Assemblies (MMDAs)",
  "Donor-funded programs",
  "Policy, research, and development institutions",
];

const researchServices = [
  "Research survey design and questionnaire development",
  "Data entry, cleaning, transformation, and analysis",
  "Statistical analysis and interpretation for research projects",
  "Excel, Power BI, and SQL training for academic and research purposes",
  "Data collection and Excel training for students and researchers, individual and group sessions",
  "Academic performance dashboards and reporting tools",
  "Research data visualization and presentation support",
];

const researchAudience = [
  "Universities and tertiary institutions",
  "Graduate and postgraduate students",
  "Research institutions and think tanks",
  "Training centres and educational organizations",
];

const reasons = [
  "Over 5 years of experience in data analytics, reporting, and digital transformation",
  "Expertise in Power BI, Microsoft Excel, SQL, ODK, KoboToolbox, and Google Data Studio",
  "Affordable and customized solutions designed for organizations in Ghana",
  "Practical, hands-on training and implementation support",
  "Strong understanding of monitoring, evaluation, research, and business reporting needs",
];

function ServiceList({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <h3 className="text-xl font-black tracking-tight text-dark">{title}</h3>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-7 text-slate-600">
            <CheckCircle2 className="mt-1 shrink-0 text-accent" size={20} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AudienceCard({ title, items, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="inline-flex rounded-2xl bg-techBlue/30 p-3 text-dark">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-dark">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="text-base leading-7 text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DataCollectionAnalysisPage() {
  return (
    <article className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(244,195,24,0.22),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(122,201,67,0.16),transparent_24%),radial-gradient(circle_at_78%_78%,rgba(156,206,217,0.24),transparent_30%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              Data Consulting
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Data Collection &amp; Analysis Services in Ghana
            </h1>
            <p className="mt-5 text-xl font-bold text-primary">
              Transform Data into Actionable Insights
            </p>
            <div className="mt-6 space-y-5 text-lg leading-8 text-slate-300">
              <p>
                At Velttech, we help organizations, businesses, researchers, and institutions
                harness the power of data to make informed decisions, improve operational
                efficiency, and measure real impact. Our affordable and practical data consulting
                solutions are tailored to the Ghanaian environment and designed to support both
                development and business goals.
              </p>
              <p>
                From digital data collection systems to interactive dashboards and advanced
                analytics, we provide end-to-end support that turns raw data into meaningful
                results.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308]"
              >
                Request Data Support
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="#data-services"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/8 px-5 text-sm font-black text-white transition hover:border-primary hover:bg-white/12"
              >
                Explore Services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="data-services" className="scroll-mt-24 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              For development teams
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">
              Data Collection, Monitoring &amp; Evaluation (M&amp;E) Services
            </h2>
            <p className="mt-4 text-xl font-bold text-slate-700">
              Reliable Data Solutions for NGOs, Government &amp; Development Projects
            </p>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600">
              Accurate and timely data is essential for successful project implementation,
              reporting, and decision-making. Velttech supports NGOs, ministries, MMDAs,
              donor-funded projects, and development agencies with modern data systems that
              improve monitoring, evaluation, and accountability.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Reveal>
              <ServiceList title="Services Include" items={developmentServices} />
            </Reveal>
            <Reveal delay={0.05}>
              <AudienceCard title="Who We Serve" items={developmentAudience} icon={Building2} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              For research teams
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">
              Research Support &amp; Data Analysis Services
            </h2>
            <p className="mt-4 text-xl font-bold text-slate-700">
              Supporting Students, Researchers &amp; Academic Institutions with Data-Driven
              Research
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Reveal>
              <ServiceList title="Services Include" items={researchServices} />
            </Reveal>
            <Reveal delay={0.05}>
              <AudienceCard title="Who We Serve" items={researchAudience} icon={GraduationCap} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              Why Velttech
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">
              Why Choose Velttech?
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              ClipboardCheck,
              BarChart3,
              LineChart,
              UsersRound,
              Microscope,
            ].map((Icon, index) => (
              <Reveal key={reasons[index]} delay={index * 0.04}>
                <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
                  <div className="inline-flex rounded-2xl bg-primary/20 p-3 text-dark">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-base leading-7 text-slate-600">{reasons[index]}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-dark p-6 shadow-2xl shadow-slate-900/10 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight text-white">
                Ready to turn your data into actionable insights?
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Contact Velttech today for data collection, analysis, reporting, dashboards, and
                research support tailored to your organization.
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308] lg:mt-0"
            >
              Contact Velttech
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  );
}
