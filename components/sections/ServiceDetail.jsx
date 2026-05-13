"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

function ListCard({ title, items }) {
  return (
    <Reveal className="h-full">
      <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <h2 className="text-2xl font-black tracking-tight text-dark">{title}</h2>
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-7 text-slate-600">
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

export default function ServiceDetail({ service }) {
  return (
    <article className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,195,24,0.2),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(156,206,217,0.22),transparent_32%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <Link
              href="/#services"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-white"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Back to services
            </Link>
          </Reveal>

          <Reveal className="mt-10 max-w-4xl" delay={0.05}>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              Velttech Service
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
              {service.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {service.overview}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308]"
              >
                Start a Conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/#services"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/8 px-5 text-sm font-black text-white transition hover:border-primary hover:bg-white/12"
              >
                View All Services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          <ListCard title="What You Will Gain" items={service.gains} />
          <ListCard title="Key Topics & Deliverables" items={service.topics} />
          <ListCard title="Who It Is For" items={service.audience} />
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
                Ready to begin?
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-dark">
                Let Velttech help you move from idea to practical results.
              </h2>
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
