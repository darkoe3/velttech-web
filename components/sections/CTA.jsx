"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function CTA() {
  return (
    <section className="bg-light px-5 py-20 sm:px-6 sm:py-24 lg:px-8" aria-labelledby="cta-title">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-dark px-6 py-14 shadow-2xl shadow-slate-900/18 sm:px-10 lg:px-14 lg:py-16">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(156,206,217,0.25),transparent_28%),radial-gradient(circle_at_84%_62%,rgba(244,195,24,0.18),transparent_30%)]"
            aria-hidden="true"
          />
          <div
            className="absolute left-8 top-8 h-1.5 w-20 rounded-full bg-secondary"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-bold text-primary">
                <Sparkles size={16} aria-hidden="true" />
                Let&apos;s build what comes next
              </div>

              <h2
                id="cta-title"
                className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl"
              >
                Ready to build your next digital solution?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Whether you need coding training, digital skills development, data
                analysis, software solutions, or IT consulting, Velttech is ready to help.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308]"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/8 px-5 text-sm font-black text-white transition hover:border-primary hover:bg-white/12"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
