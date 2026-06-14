"use client";

import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const demoUrl =
  "https://wa.me/233555106820?text=Hello%20Velttech,%20I%20want%20a%20demo%20of%20VeltSmartSchoolApp";
const launchUrl = "https://app.velttech.org/";

const features = [
  { label: "Student & Teacher Management", icon: Users },
  { label: "Attendance Tracking", icon: ClipboardCheck },
  { label: "Fees & Payments", icon: CreditCard },
  { label: "Results & Report Cards", icon: GraduationCap },
  { label: "Lesson Plan Approval", icon: CheckCircle2 },
  { label: "Parent Communication", icon: MessageCircle },
  { label: "Safe Arrival Monitoring", icon: ShieldCheck },
  { label: "School Dashboard & Reports", icon: LayoutDashboard },
];

const dashboardStats = [
  { label: "Attendance", value: "94%", color: "bg-accent" },
  { label: "Fee collection", value: "82%", color: "bg-primary" },
  { label: "Reports ready", value: "128", color: "bg-techBlue" },
];

export default function VeltSmartSchoolProduct() {
  return (
    <section className="relative isolate overflow-hidden bg-dark py-20 sm:py-24">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(244,195,24,0.2),transparent_28%),radial-gradient(circle_at_88%_70%,rgba(122,201,67,0.16),transparent_30%),linear-gradient(135deg,rgba(156,206,217,0.14),transparent_48%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary/35 bg-white/10 px-3 py-2 text-sm font-black text-primary shadow-sm backdrop-blur">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            New Product
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-techBlue">
            VeltSmartSchoolApp
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Complete School Management System for Modern Schools
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            A secure cloud-based platform that helps schools manage students,
            teachers, attendance, fees, results, report cards, lesson plans,
            announcements, and parent communication from one easy-to-use dashboard.
          </p>
          <p className="mt-4 inline-flex rounded-lg bg-techBlue/15 px-3 py-2 text-sm font-bold text-white ring-1 ring-techBlue/30">
            Built for Ghanaian and African schools.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="flex min-h-14 items-center gap-3 rounded-lg border border-white/12 bg-white/8 px-4 py-3 text-sm font-bold text-white"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-dark">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {feature.label}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
            >
              Request Demo
              <MessageCircle size={18} aria-hidden="true" />
            </Link>
            <Link
              href={launchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
            >
              Launch School App
              <ExternalLink size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/veltsmartschoolapp"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/45 bg-white/10 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:border-primary hover:bg-primary hover:text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
            >
              Learn More
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <div className="rounded-2xl border border-white/16 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="overflow-hidden rounded-xl bg-light">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-lg bg-dark text-primary">
                    <GraduationCap size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-dark">VeltSmartSchoolApp</p>
                    <p className="text-xs font-bold text-slate-500">School command center</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-green-700">
                  Live
                </span>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="space-y-3 rounded-lg bg-dark p-4 text-white">
                  {["Dashboard", "Students", "Payments", "Reports"].map((item, index) => (
                    <div
                      key={item}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${
                        index === 0 ? "bg-primary text-dark" : "bg-white/8 text-slate-200"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${
                          index === 0 ? "bg-dark" : "bg-techBlue"
                        }`}
                        aria-hidden="true"
                      />
                      {item}
                    </div>
                  ))}
                  <div className="rounded-lg bg-techBlue/15 p-3">
                    <p className="text-xs font-bold text-techBlue">Safe arrival</p>
                    <p className="mt-2 text-2xl font-black">316</p>
                    <p className="text-xs text-slate-300">students checked in today</p>
                  </div>
                </aside>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {dashboardStats.map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className={`mb-3 h-1.5 rounded-full ${stat.color}`} />
                        <p className="text-2xl font-black text-dark">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-dark">Academic overview</p>
                        <p className="text-xs font-semibold text-slate-500">Results and reports</p>
                      </div>
                      <BarChart3 size={22} className="text-secondary" aria-hidden="true" />
                    </div>
                    <div className="mt-5 flex h-32 items-end gap-3">
                      {[48, 72, 58, 88, 64, 96].map((height, index) => (
                        <span
                          key={height}
                          className={`flex-1 rounded-t-lg ${
                            index % 3 === 0
                              ? "bg-primary"
                              : index % 3 === 1
                                ? "bg-accent"
                                : "bg-techBlue"
                          }`}
                          style={{ height: `${height}%` }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-lg bg-secondary/15 text-secondary">
                          <Bell size={19} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-dark">Announcements</p>
                          <p className="text-xs font-semibold text-slate-500">Parents notified</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-lg bg-accent/15 text-green-700">
                          <UserRoundCheck size={19} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-dark">Teacher tools</p>
                          <p className="text-xs font-semibold text-slate-500">Lessons approved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -right-3 hidden w-40 overflow-hidden rounded-xl border border-white/30 bg-white p-2 shadow-2xl shadow-black/20 sm:block">
            <Image
              src="/images/veltsmartschoolapp-flyer.png"
              alt="VeltSmartSchoolApp product flyer"
              width={320}
              height={320}
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
