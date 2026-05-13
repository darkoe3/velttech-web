import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { servicePages } from "@/lib/service-pages";

export const metadata = {
  title: "Our Services",
  description:
    "Explore Velttech services: coding for kids, Microsoft Excel data analysis training, data collection and analysis, software solutions, and IT consulting.",
};

const serviceSections = [
  { id: "coding-for-kids", data: servicePages.codingForKids },
  { id: "microsoft-excel-data-analysis-training-ghana", data: servicePages.microsoftExcelTraining },
  { id: "data-collection-analysis", data: servicePages.dataCollectionAnalysis },
  { id: "software-solutions", data: servicePages.softwareSolutions },
  { id: "it-consulting", data: servicePages.itConsulting },
];

function BulletList({ title, items }) {
  return (
    <div>
      <h3 className="text-lg font-black text-dark">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <CheckCircle2 size={17} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <main className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,195,24,0.2),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(156,206,217,0.22),transparent_32%)]"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            Velttech Services
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Our Services
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Explore practical technology services for learners, schools, businesses,
            NGOs, and organizations ready to build stronger digital capacity.
          </p>
        </Reveal>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto space-y-6 max-w-7xl">
          {serviceSections.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.04}>
              <article
                id={service.id}
                className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
                      Core Service
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-dark">
                      {service.data.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {service.data.overview}
                    </p>
                    <Link
                      href="/contact"
                      className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-dark shadow-md shadow-primary/25 transition hover:bg-[#EAB308]"
                    >
                      Enquire Now
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <BulletList title="Key topics & deliverables" items={service.data.topics} />
                    <BulletList title="Who it is for" items={service.data.audience} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
