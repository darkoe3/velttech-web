import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  School,
  ShieldCheck,
  TrendingDown,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "VeltSmartSchoolApp | School Management System in Ghana",
  description:
    "VeltSmartSchoolApp is a complete cloud-based school management system for Ghanaian and African schools, covering attendance, fees, reports, lesson plans, parent communication, and school dashboards.",
  alternates: {
    canonical: "/veltsmartschoolapp",
  },
  openGraph: {
    title: "VeltSmartSchoolApp",
    description:
      "A complete cloud-based school management system for Ghanaian and African schools.",
    url: "/veltsmartschoolapp",
    images: ["/images/veltsmartschoolapp-flyer.png"],
  },
};

const demoUrl =
  "https://wa.me/233555106820?text=Hello%20Velttech,%20I%20want%20a%20demo%20of%20VeltSmartSchoolApp";
const launchUrl = "https://app.velttech.org/";

const features = [
  {
    title: "Student & Teacher Management",
    icon: Users,
    copy:
      "Manage student records, teacher profiles, class assignments, and school staff information from one secure dashboard.",
  },
  {
    title: "Attendance Tracking",
    icon: ClipboardCheck,
    copy:
      "Mark daily attendance, monitor absenteeism, lateness, and generate attendance records for students and classes.",
  },
  {
    title: "Fees & Payments",
    icon: CreditCard,
    copy:
      "Create fee categories, generate student bills, record payments, track balances, and issue payment alerts.",
  },
  {
    title: "Results & Report Cards",
    icon: GraduationCap,
    copy:
      "Enter assessments, calculate subject results, generate terminal reports, and download professional report cards.",
  },
  {
    title: "Lesson Plan Approval",
    icon: BookOpenCheck,
    copy:
      "Teachers prepare lesson plans using a Ghana NaCCA/GES-style format and submit them for headteacher review and approval.",
  },
  {
    title: "Parent Communication",
    icon: MessageCircle,
    copy:
      "Send announcements, attendance updates, payment alerts, and important school notices to parents through communication logs.",
  },
  {
    title: "Safe Arrival Monitoring",
    icon: ShieldCheck,
    copy:
      "Support check-in and check-out tracking with QR/GPS-based safe arrival records for private schools.",
  },
  {
    title: "School Dashboard & Reports",
    icon: BarChart3,
    copy:
      "Give school leaders real-time summaries of students, teachers, attendance, payments, lesson plans, and academic performance.",
  },
  {
    title: "Student Dropout Monitoring",
    icon: TrendingDown,
    copy:
      "Track student status, identify inactive learners, and support early intervention for dropout risk monitoring.",
  },
];

const benefits = [
  {
    audience: "School Owners",
    icon: Building2,
    copy: "Track school performance, payments, enrolment, and operations from a single cloud dashboard.",
  },
  {
    audience: "Headteachers",
    icon: School,
    copy: "Monitor attendance, reports, teacher activity, lesson plans, and academic progress without paper-heavy follow-up.",
  },
  {
    audience: "Teachers",
    icon: UserRoundCheck,
    copy: "Record attendance, submit lesson plans, manage results, and communicate updates with less administrative pressure.",
  },
  {
    audience: "Parents",
    icon: HeartHandshake,
    copy: "Receive useful updates about fees, safe arrival, announcements, academic progress, and school communication.",
  },
  {
    audience: "Students",
    icon: GraduationCap,
    copy: "Benefit from better record keeping, clearer academic reporting, and more consistent school support.",
  },
];

const schoolTypes = [
  {
    title: "Private Schools",
    icon: Building2,
    color: "bg-primary text-dark",
    copy: "Private schools can use fees, payments, safe arrival, and full management tools alongside attendance, reports, teacher workflows, and parent communication.",
  },
  {
    title: "Public Schools",
    icon: School,
    color: "bg-accent text-dark",
    copy: "Public schools can use attendance, lesson planning, reports, students, teachers, and academic management to improve daily administration and accountability.",
  },
];

const contactItems = [
  { label: "Phone", value: "055 510 6820", href: "tel:+233555106820", icon: Phone },
  { label: "Email", value: "info@velttech.org", href: "mailto:info@velttech.org", icon: Mail },
  { label: "Website", value: "velttech.org", href: "https://velttech.org", icon: ArrowRight },
  { label: "Facebook", value: "velttech", href: "https://www.facebook.com/velttech", icon: Bell },
];

const faqs = [
  {
    question: "Is VeltSmartSchoolApp suitable for both private and public schools?",
    answer:
      "Yes. Private schools can use the full management, fees, payments, and safe arrival tools, while public schools can focus on attendance, lesson planning, reports, students, teachers, and academic management.",
  },
  {
    question: "Can parents receive school updates through the system?",
    answer:
      "Yes. The platform supports parent communication for announcements, academic updates, payment information, and safe arrival monitoring where the school enables those workflows.",
  },
  {
    question: "Does the platform support report cards and results?",
    answer:
      "Yes. VeltSmartSchoolApp includes results and report card management so schools can keep academic records organized and easier to share.",
  },
  {
    question: "Can teachers submit lesson plans for approval?",
    answer:
      "Yes. Teachers can submit lesson plans and school leaders can review and approve them through the platform.",
  },
  {
    question: "How can a school request a demo?",
    answer:
      "Use the Request Demo button to contact Velttech on WhatsApp, or reach us by phone at 055 510 6820 or email at info@velttech.org.",
  },
];

function ProductCtas({ dark = false }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
      >
        Request Demo
        <MessageCircle size={18} aria-hidden="true" />
      </Link>
      <Link
        href={launchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-black shadow-lg transition focus:outline-none focus:ring-2 focus:ring-techBlue focus:ring-offset-2 ${
          dark
            ? "border-techBlue/55 bg-white text-dark shadow-black/20 hover:border-primary hover:bg-techBlue/25 focus:ring-offset-dark"
            : "border-slate-300 bg-white text-dark shadow-slate-900/10 hover:border-dark focus:ring-offset-light"
        }`}
      >
        Launch School App
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function VeltSmartSchoolAppPage() {
  return (
    <main className="bg-light">
      <section className="relative isolate overflow-hidden bg-dark py-20 sm:py-24">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(244,195,24,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(156,206,217,0.2),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(122,201,67,0.16),transparent_30%)]"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
          <Reveal>
            <p className="inline-flex rounded-lg border border-primary/35 bg-white/10 px-3 py-2 text-sm font-black uppercase tracking-[0.16em] text-primary">
              School management software
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              VeltSmartSchoolApp
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-slate-200">
              A complete cloud-based school management system for Ghanaian and African schools.
            </p>
            <div className="mt-8">
              <ProductCtas dark />
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="rounded-lg bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-lg bg-dark text-primary">
                      <School size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-black text-dark">Admin Dashboard</p>
                      <p className="text-sm font-semibold text-slate-500">Today at a glance</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-green-700">
                    Cloud ready
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Students", "1,240", "bg-primary"],
                    ["Teachers", "84", "bg-techBlue"],
                    ["Attendance", "96%", "bg-accent"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-light p-4">
                      <div className={`mb-4 h-1.5 rounded-full ${color}`} />
                      <p className="text-2xl font-black text-dark">{value}</p>
                      <p className="text-sm font-bold text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-lg border border-slate-200 bg-light p-4">
                    <p className="text-sm font-black text-dark">School performance</p>
                    <div className="mt-5 flex h-40 items-end gap-3">
                      {[56, 82, 64, 91, 74, 88, 68].map((height, index) => (
                        <span
                          key={`${height}-${index}`}
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
                  <div className="space-y-3">
                    {["Lesson plans pending approval", "Parents notified today", "Dropout risks flagged"].map(
                      (item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-lg bg-light p-4">
                          <span
                            className={`grid size-10 place-items-center rounded-lg ${
                              index === 0
                                ? "bg-secondary/15 text-secondary"
                                : index === 1
                                  ? "bg-techBlue/25 text-dark"
                                  : "bg-accent/15 text-green-700"
                            }`}
                          >
                            <CheckCircle2 size={18} aria-hidden="true" />
                          </span>
                          <p className="text-sm font-black text-dark">{item}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              Key features
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
              One platform for the work schools repeat every day.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Reveal key={feature.title} delay={index * 0.04} className="h-full">
                  <article className="flex h-full items-start gap-4 rounded-lg border border-slate-200 bg-light p-5 transition hover:-translate-y-1 hover:border-primary hover:bg-white hover:shadow-xl hover:shadow-slate-900/8">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-dark text-primary">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-dark">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {feature.copy}
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-light py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
              Benefits
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
              Designed around the people who keep schools moving.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <Reveal key={benefit.audience} delay={index * 0.05} className="h-full">
                  <article className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="grid size-12 place-items-center rounded-lg bg-primary text-dark">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-black text-dark">{benefit.audience}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.copy}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              School fit
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
              Useful for private and public school operations.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              VeltSmartSchoolApp supports the commercial, administrative, and academic workflows that different school types need most.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {schoolTypes.map((schoolType, index) => {
              const Icon = schoolType.icon;

              return (
                <Reveal key={schoolType.title} delay={index * 0.08} className="h-full">
                  <article className="h-full rounded-lg border border-slate-200 bg-light p-6">
                    <span className={`grid size-12 place-items-center rounded-lg ${schoolType.color}`}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-2xl font-black text-dark">{schoolType.title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-600">{schoolType.copy}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-dark py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
              Product visual
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              A school dashboard made for clear daily decisions.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Use the platform to bring student records, teacher workflows, attendance, payments, reports, and communication into one organized place.
            </p>
            <div className="mt-8">
              <ProductCtas dark />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-lg border border-white/15 bg-white p-3 shadow-2xl shadow-black/30">
              <Image
                src="/images/veltsmartschoolapp-flyer.png"
                alt="VeltSmartSchoolApp product flyer"
                width={900}
                height={900}
                className="h-auto w-full rounded-lg object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
              Common questions from schools.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              A quick look at how VeltSmartSchoolApp fits everyday school administration.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.05} className="h-full">
                <article className="h-full rounded-lg border border-slate-200 bg-light p-6">
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-dark text-primary">
                      <HelpCircle size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-dark">{faq.question}</h3>
                      <p className="mt-3 text-base leading-7 text-slate-600">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="rounded-lg bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
                  Contact
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
                  Talk to Velttech about VeltSmartSchoolApp.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Request a walkthrough, discuss your school type, and see how the system can support your administration and academic workflows.
                </p>
                <div className="mt-8">
                  <ProductCtas />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="rounded-lg border border-slate-200 bg-light p-5 transition hover:border-primary hover:bg-white"
                    >
                      <span className="grid size-11 place-items-center rounded-lg bg-dark text-primary">
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-black text-dark">{item.value}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
