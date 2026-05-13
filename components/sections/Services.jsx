"use client";

import {
  ArrowRight,
  Blocks,
  ChartNoAxesCombined,
  Code2,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/data";
import Reveal from "@/components/ui/Reveal";

const icons = {
  Blocks,
  ChartNoAxesCombined,
  Code2,
  GraduationCap,
  Lightbulb,
};

export default function Services() {
  return (
    <section id="services" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            Core Services
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
            Everything Velttech offers to help you learn, build, and grow.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            From coding programs and digital skills training to analytics, software
            systems, and IT consulting, our services bring practical technology support
            into one focused place.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = icons[service.icon];

            return (
              <Reveal key={service.title} delay={index * 0.07} className="h-full">
                <article className="group flex h-full flex-col rounded-lg border border-slate-200 bg-light p-6 transition hover:-translate-y-1 hover:border-primary hover:bg-white hover:shadow-xl hover:shadow-slate-900/8">
                  <div className="grid size-12 place-items-center rounded-lg bg-dark text-primary transition group-hover:bg-primary group-hover:text-dark">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-dark">{service.title}</h3>
                  <p className="mt-3 flex-1 text-base leading-7 text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-dark shadow-md shadow-primary/25 transition hover:bg-[#EAB308] focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-light"
                    aria-label={`Learn more about ${service.title}`}
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
