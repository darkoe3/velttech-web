"use client";

import {
  ArrowRight,
  Bot,
  ChartColumnBig,
  CloudCog,
  Code2,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const featuredPrograms = [
  {
    title: "Coding for Kids",
    description:
      "Practical coding programs for children and teens covering Scratch, HTML, CSS, JavaScript, robotics, and creative problem-solving.",
    tags: ["Scratch", "Web Design", "Robotics"],
    icon: Code2,
  },
  {
    title: "Corporate Microsoft Excel Training",
    description:
      "Hands-on Microsoft Excel data analysis training for businesses, NGOs, and teams using dashboards, Pivot Tables, reporting, and automation.",
    tags: ["Excel", "Dashboards", "Pivot Tables"],
    icon: GraduationCap,
  },
  {
    title: "Data Collection & Analysis",
    description:
      "Professional support for collecting, cleaning, organizing, analyzing, and visualizing data for schools, businesses, NGOs, and institutions.",
    tags: ["Excel", "Power BI", "Reports"],
    icon: ChartColumnBig,
  },
  {
    title: "Software Solutions",
    description:
      "Custom websites, business systems, school platforms, dashboards, and workflow automation tools built for real operational needs.",
    tags: ["Next.js", "Django", "Dashboards"],
    icon: Bot,
  },
  {
    title: "IT Consulting",
    description:
      "Technology advisory, digital transformation planning, system selection, cloud guidance, and support for modern digital adoption.",
    tags: ["Strategy", "Cloud", "Systems"],
    icon: CloudCog,
  },
];

export default function FeaturedPrograms() {
  return (
    <section id="programs" className="bg-light py-20 sm:py-24" aria-labelledby="featured-programs-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            Featured Work
          </p>
          <h2
            id="featured-programs-title"
            className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl"
          >
            Featured Projects & Programs
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Explore Velttech&apos;s practical software solutions, digital skills programs,
            and data-driven services for schools, businesses, and individuals.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredPrograms.map((program, index) => {
            const Icon = program.icon;

            return (
              <Reveal key={program.title} delay={index * 0.07}>
                <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl hover:shadow-slate-900/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-dark text-primary transition group-hover:bg-primary group-hover:text-dark">
                      <Icon size={26} aria-hidden="true" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-dark">
                      <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                      Active
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-black tracking-tight text-dark">
                    {program.title}
                  </h3>
                  <p className="mt-3 flex-1 text-base leading-7 text-slate-600">
                    {program.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-techBlue/45 bg-techBlue/18 px-3 py-1 text-xs font-bold text-dark"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={
                      program.title === "Corporate Microsoft Excel Training"
                        ? "/services/microsoft-excel-data-analysis-training-ghana"
                        : "#contact"
                    }
                    className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-dark shadow-md shadow-primary/25 transition hover:bg-[#EAB308]"
                    aria-label={`Learn more about ${program.title}`}
                  >
                    Learn More
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
