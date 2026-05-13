"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { BriefcaseBusiness, CalendarCheck, School, UsersRound } from "lucide-react";
import { useEffect, useRef } from "react";

const stats = [
  {
    value: 200,
    label: "Learners Trained",
    icon: UsersRound,
    color: "bg-primary text-dark",
  },
  {
    value: 11,
    label: "Projects Delivered",
    icon: BriefcaseBusiness,
    color: "bg-secondary text-white",
  },
  {
    value: 20,
    label: "Schools & Organizations Served",
    icon: School,
    color: "bg-accent text-dark",
  },
  {
    value: 5,
    label: "Years Experience",
    icon: CalendarCheck,
    color: "bg-techBlue text-dark",
  },
];

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}+`);
  const Icon = stat.icon;

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const controls = animate(count, stat.value, {
      duration: 1.4,
      ease: "easeOut",
      delay: index * 0.08,
    });

    return () => controls.stop();
  }, [count, index, isInView, stat.value]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      className="rounded-lg border border-white/10 bg-white p-6 shadow-xl shadow-slate-900/8"
    >
      <div className={`grid size-12 place-items-center rounded-lg ${stat.color}`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <motion.p className="mt-6 text-4xl font-black tracking-tight text-dark sm:text-5xl">
        {rounded}
      </motion.p>
      <p className="mt-2 text-base font-bold leading-6 text-slate-600">{stat.label}</p>
    </motion.article>
  );
}

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-dark py-16 sm:py-20" aria-labelledby="stats-title">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,195,24,0.18),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(156,206,217,0.18),transparent_30%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
            Velttech in Numbers
          </p>
          <h2 id="stats-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Proven outcomes across learning, delivery, and digital transformation.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
