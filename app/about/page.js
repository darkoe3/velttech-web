import { CheckCircle2, Lightbulb, Target, Telescope } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "About Velttech",
  description:
    "Learn about Velttech, a Ghana-based technology company providing coding training, digital skills training, data collection and analysis, software solutions, and IT consulting.",
};

const values = [
  {
    title: "Our Mission",
    description:
      "To deliver scalable technology and digital skills solutions, powered by data, that enable institutions and individuals to make informed decisions, enhance productivity, and drive sustainable impact.",
    icon: Target,
  },
  {
    title: "Our Vision",
    description:
      "To be a leading African technology and data solutions company empowering organizations and individuals through innovation, digital transformation, and lifelong learning.",
    icon: Telescope,
  },
  {
    title: "Why Velttech Exists",
    description:
      "We exist to close the gap between technology potential and everyday results through training, data insight, software, and advisory support.",
    icon: Lightbulb,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,195,24,0.2),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(156,206,217,0.22),transparent_32%)]"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            About Velttech
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl">
            A Ghana-based technology company built for practical digital growth.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Velttech provides coding training, digital skills training, data collection
            and analysis, software solutions, and IT consulting for individuals,
            schools, businesses, and organizations.
          </p>
        </Reveal>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {values.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.07}>
                <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
                  <div className="grid size-12 place-items-center rounded-xl bg-primary text-dark">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-2xl font-black text-dark">{item.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <h2 className="text-3xl font-black tracking-tight text-dark">What we focus on</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Practical coding and digital skills education",
              "Clear data collection, analysis, and reporting",
              "Custom software and workflow systems",
              "Technology advisory and implementation support",
            ].map((item) => (
              <div key={item} className="flex gap-3 text-base font-semibold text-slate-700">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
