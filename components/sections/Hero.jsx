"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const metrics = [
  { value: "5", label: "Core service areas" },
  { value: "360", label: "Digital growth support" },
  { value: "K-12+", label: "Learners to teams" },
];

const heroSlides = [
  {
    image: "/images/coding-kids.jpg",
    alt: "Children learning coding with Velttech",
    title: "Coding for Kids",
    caption: "Creative programming, robotics, and problem-solving for young learners.",
    tag: "Coding for Kids",
    accent: "from-primary/85 via-secondary/65 to-accent/70",
  },
  {
    image: "/images/excel-training.jpg",
    alt: "Corporate Microsoft Excel training in Ghana",
    title: "Corporate Excel & Digital Training",
    caption: "Excel dashboards, Pivot Tables, reporting, automation, and practical digital skills.",
    tag: "Excel Training",
    accent: "from-techBlue/80 via-primary/70 to-secondary/75",
  },
  {
    image: "/images/data-analysis.jpg",
    alt: "Excel data analysis workshop for businesses",
    title: "Data Collection & Analysis",
    caption: "Clean data, meaningful reports, dashboards, and insights for better decisions.",
    tag: "Data Analysis",
    accent: "from-accent/80 via-techBlue/70 to-primary/70",
  },
  {
    image: "/images/software-solutions.jpg",
    alt: "Business reporting and dashboard training using Excel",
    title: "Software Solutions",
    caption: "Custom websites, platforms, dashboards, and workflow systems built for real operations.",
    tag: "Software",
    accent: "from-dark via-techBlue/80 to-primary/65",
  },
  {
    image: "/images/it-consulting.jpg",
    alt: "Advanced Excel training for organizations in Ghana",
    title: "IT Consulting",
    caption: "Technology advisory, systems planning, cloud guidance, and digital transformation support.",
    tag: "Consulting",
    accent: "from-secondary/80 via-accent/70 to-techBlue/75",
  },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const currentSlide = heroSlides[activeSlide];
  const imageFailed = failedImages[currentSlide.image];

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current === 0 ? heroSlides.length - 1 : current - 1));
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  const markImageFailed = (image) => {
    setFailedImages((current) => ({ ...current, [image]: true }));
  };

  return (
    <section className="relative isolate overflow-hidden bg-light">
      <div className="absolute inset-x-0 top-0 h-32 bg-white" aria-hidden="true" />
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm font-bold text-dark shadow-sm">
            <Sparkles size={16} className="text-secondary" aria-hidden="true" />
            Practical technology education and consulting
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] text-dark sm:text-6xl lg:text-7xl">
            Digital skills and software solutions for real-world growth.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Velttech helps children, professionals, teams, and organizations learn,
            build, analyze, and transform with technology that is useful from day one.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="https://veltsmartschoolapp.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-secondary"
            >
              SmartSchoolApp
              <ExternalLink size={18} aria-hidden="true" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-dark transition hover:border-dark"
            >
              Book a consultation
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-2xl font-black text-dark">{metric.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{metric.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
          className="relative mt-4 lg:mt-0"
        >
          <div
            className="absolute -inset-4 -z-10 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(156,206,217,0.55),transparent_34%),radial-gradient(circle_at_78%_70%,rgba(244,195,24,0.35),transparent_32%)] blur-xl"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/80 bg-slate-200 shadow-2xl shadow-slate-900/16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.image}
                initial={{ opacity: 0, x: 28, scale: 1.02 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -28, scale: 0.98 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className={`absolute inset-0 bg-gradient-to-br ${currentSlide.accent}`}
              >
                {!imageFailed ? (
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.alt}
                    fill
                    priority={activeSlide === 0}
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    className="object-cover"
                    onError={() => markImageFailed(currentSlide.image)}
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.26),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_30%)]"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/88 via-dark/24 to-dark/10" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-dark/55 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-primary backdrop-blur">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              {currentSlide.tag}
            </div>
            <div className="absolute inset-x-5 bottom-5 z-10 rounded-lg border border-white/25 bg-white/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-96">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <CheckCircle2 size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-black text-dark">{currentSlide.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{currentSlide.caption}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Show previous hero slide"
              onClick={showPreviousSlide}
              className="absolute left-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-dark/55 text-white shadow-lg backdrop-blur transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Show next hero slide"
              onClick={showNextSlide}
              className="absolute right-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-dark/55 text-white shadow-lg backdrop-blur transition hover:border-primary hover:text-primary"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2" aria-label="Hero service slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`Show ${slide.title} slide`}
                aria-current={activeSlide === index}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-slate-300 hover:bg-secondary"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
