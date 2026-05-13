import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Laptop,
  MessageCircle,
  Presentation,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Microsoft Excel Data Analysis Training for Businesses in Ghana | Velttech",
  description:
    "Practical Microsoft Excel data analysis training in Ghana for businesses, NGOs, and corporate teams. Learn dashboards, Pivot Tables, reporting, automation, and Excel analytics with Velttech.",
  alternates: {
    canonical: "/services/microsoft-excel-data-analysis-training-ghana",
  },
  openGraph: {
    title: "Microsoft Excel Data Analysis Training for Businesses in Ghana | Velttech",
    description:
      "Practical Microsoft Excel data analysis training in Ghana for businesses, NGOs, and corporate teams.",
    url: "/services/microsoft-excel-data-analysis-training-ghana",
    siteName: "Velttech",
    images: [
      {
        url: "/images/velttech-hero.png",
        width: 1200,
        height: 900,
        alt: "Corporate Microsoft Excel training in Ghana",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const requirements = [
  "A laptop (Windows or Mac)",
  "Microsoft Excel (2016 or later recommended)",
  "Basic computer literacy (no advanced Excel knowledge required)",
  "Familiarity with business operations (optional but beneficial)",
];

const outcomes = [
  "Organize and manage business data efficiently",
  "Clean and prepare data for accurate analysis",
  "Perform calculations using essential Excel functions",
  "Analyze business performance using Pivot Tables, filters, and charts",
  "Create clear, professional reports and dashboards",
  "Build practical trackers for sales, expenses, inventory, and operations",
  "Automate repetitive reporting tasks and reduce manual work",
  "Use Excel insights to support smarter business decisions",
];

const modules = [
  {
    title: "Module 1: Excel Fundamentals for Business Operations",
    description:
      "Build a strong foundation for using Excel in day-to-day business tasks. Participants learn workbook navigation, data entry standards, formatting, tables, and essential formulas for business records such as sales, expenses, inventory, and customer information.",
    outcome: "Improved accuracy in record keeping and fewer operational errors.",
  },
  {
    title: "Module 2: Data Cleaning, Preparation, and Consolidation",
    description:
      "Prepare business data for reliable analysis by removing duplicates, fixing inconsistent entries, handling missing values, applying data validation, structuring tables, and combining data from multiple sheets or sources.",
    outcome: "Cleaner, consistent, analysis-ready data for reporting and decisions.",
  },
  {
    title: "Module 3: Business Calculations and Excel Functions",
    description:
      "Use formulas and functions to simplify routine analysis. The module covers practical calculations for revenue, profit, costs, percentages, targets, lookup tasks, conditional logic, and performance comparisons.",
    outcome: "Faster calculations and better business decisions with less manual effort.",
  },
  {
    title: "Module 4: Data Analysis and Business Insights",
    description:
      "Turn raw data into insight using sorting, filtering, structured tables, Pivot Tables, slicers, and basic Power Query workflows. Participants analyze trends across products, departments, locations, projects, and time periods.",
    outcome: "Clear visibility into performance trends, gaps, and opportunities.",
  },
  {
    title: "Module 5: Reporting and Dashboard Creation",
    description:
      "Design professional reports and dashboards using charts, KPIs, conditional formatting, Pivot Charts, and summary views that make data easier for managers and stakeholders to understand.",
    outcome: "Clear dashboards and reports that support faster action.",
  },
  {
    title: "Module 6: Practical Business Systems in Excel",
    description:
      "Build simple Excel-based systems for sales tracking, expense monitoring, inventory control, customer records, attendance, project monitoring, and internal performance reporting.",
    outcome: "Reusable Excel tools your team can apply immediately at work.",
  },
  {
    title: "Module 7: Automation and Productivity Techniques",
    description:
      "Reduce repetitive work using Excel tables, reusable templates, named ranges, data validation lists, simple protection settings, and introductory automation concepts including basic macros where appropriate.",
    outcome: "More efficient workflows and reduced reporting workload.",
  },
  {
    title: "Module 8: Real-World Business Case Studies",
    description:
      "Apply the training to practical scenarios for Ghanaian businesses, NGOs, and SMEs, including sales analysis, financial summaries, project reports, operations tracking, and management dashboards.",
    outcome: "Confidence applying Excel skills to real organizational challenges.",
  },
];

const deliveryOptions = [
  "2-5 day intensive workshops",
  "Weekend executive training sessions",
  "On-site corporate training customized for your team",
  "Virtual or hybrid training options",
];

const teamReceives = [
  "Hands-on training with realistic business datasets",
  "Pre-designed Excel templates for immediate use",
  "Step-by-step training materials",
  "Certificate of completion",
  "Post-training support via email or WhatsApp",
];

const audiences = [
  "Business owners and entrepreneurs",
  "Corporate teams and departments",
  "Finance and administrative staff",
  "Sales and operations teams",
  "NGOs and development organizations",
];

const faqs = [
  {
    question: "What will participants learn in this Excel training?",
    answer:
      "Participants will learn data cleaning, business calculations, Pivot Tables, dashboards, reporting, automation, and practical business analysis using Microsoft Excel.",
  },
  {
    question: "Is this Microsoft Excel training suitable for businesses in Ghana?",
    answer:
      "Yes. The training includes practical business examples and case studies relevant to Ghanaian businesses, NGOs, SMEs, and corporate organizations.",
  },
  {
    question: "Do participants need advanced Excel knowledge?",
    answer:
      "No. Basic computer literacy is enough. The course is designed for beginners and intermediate Excel users who want practical workplace skills.",
  },
  {
    question: "Does Velttech offer on-site corporate Excel training?",
    answer:
      "Yes. Velttech provides on-site, virtual, hybrid, and customized corporate Excel training sessions for organizations in Ghana.",
  },
  {
    question: "Will participants receive a certificate?",
    answer: "Yes. Participants receive a certificate of completion after the training.",
  },
  {
    question: "Can the modules be customized for our organization?",
    answer:
      "Yes. The program can be adjusted around your team's data, reporting needs, industry, schedule, and current Excel skill level.",
  },
];

function SectionHeader({ eyebrow, title, description }) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
      ) : null}
    </Reveal>
  );
}

function CheckList({ items }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <CheckCircle2 size={20} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
          <span className="text-base font-semibold leading-7 text-slate-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MicrosoftExcelDataAnalysisTrainingGhanaPage() {
  return (
    <main className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(244,195,24,0.24),transparent_30%),radial-gradient(circle_at_84%_62%,rgba(156,206,217,0.24),transparent_32%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
              Corporate Excel Training
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Corporate Microsoft Excel Training for Businesses, NGOs & SMEs
            </h1>
            <p className="mt-6 max-w-3xl text-xl font-semibold leading-8 text-techBlue">
              Turn Your Everyday Business Data into Smarter, Profitable Decisions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308]"
              >
                Request Corporate Training
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="#course-modules"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/8 px-5 text-sm font-black text-white transition hover:border-primary hover:bg-white/12"
              >
                View Course Modules
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
              <div className="grid size-14 place-items-center rounded-2xl bg-primary text-dark">
                <FileSpreadsheet size={28} aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-white">Business-ready Excel skills</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Dashboards, Pivot Tables, reporting, automation, and Excel analytics
                taught through practical workflows your team can use immediately.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Dashboards", "Pivot Tables", "Reports", "Automation"].map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border border-techBlue/25 bg-techBlue/10 px-3 py-2 text-sm font-bold text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            About This Course
          </p>
          <div className="mt-5 space-y-5 text-lg leading-8 text-slate-600">
            <p>
              At Velttech, we help businesses transform raw data into meaningful
              insights using practical Microsoft Excel skills. This hands-on training
              is designed for organizations that want to improve reporting, reduce
              inefficiencies, and make better decisions backed by data.
            </p>
            <p>
              Whether you&apos;re managing sales, tracking expenses, or analyzing
              performance, this program equips your team with tools they can apply
              immediately.
            </p>
            <p>
              This course goes beyond basic Excel skills by focusing on real business
              applications, including sales tracking, financial analysis, reporting,
              and decision-making. Participants will learn how to clean, analyze, and
              visualize data efficiently using Microsoft Excel tools and functions.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Requirements"
            title="Course Requirements"
            description="A simple setup is enough for your team to participate fully."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {requirements.map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
                  <Laptop size={24} className="text-secondary" aria-hidden="true" />
                  <p className="mt-4 text-base font-black leading-7 text-dark">{item}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Outcomes"
            title="General Course Outcomes"
            description="By the end of the program, your team will be able to use Excel for clearer reporting, analysis, and operational decisions."
          />
          <div className="mt-10">
            <Reveal>
              <CheckList items={outcomes} />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="course-modules" className="scroll-mt-28 px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Curriculum"
            title="Course Modules"
            description="Eight practical modules designed around business operations, reporting, analysis, and decision-making."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {modules.map((module, index) => (
              <Reveal key={module.title} delay={index * 0.04}>
                <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-slate-900/10">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary text-dark">
                    <BarChart3 size={24} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-black leading-7 text-dark">{module.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{module.description}</p>
                  <div className="mt-5 rounded-2xl bg-accent/10 p-4">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-dark">
                      Outcome
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{module.outcome}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Delivery"
              title="Training Delivery Options"
              description="Choose a format that works for your organization, team size, and schedule."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {deliveryOptions.map((item, index) => (
                <Reveal key={item} delay={index * 0.05}>
                  <article className="h-full rounded-2xl border border-slate-200 bg-light p-5">
                    <Clock size={24} className="text-secondary" aria-hidden="true" />
                    <p className="mt-4 font-black leading-7 text-dark">{item}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Resources"
              title="What Your Team Will Receive"
              description="Participants leave with practical materials and support they can use immediately."
            />
            <div className="mt-10">
              <Reveal>
                <CheckList items={teamReceives} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Audience"
            title="Who This Training Is For"
            description="Designed for teams that handle records, reports, operations, sales, finance, and project data."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {audiences.map((item, index) => (
              <Reveal key={item} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-lg shadow-slate-900/5">
                  <UsersRound size={25} className="mx-auto text-secondary" aria-hidden="true" />
                  <p className="mt-4 font-black leading-7 text-dark">{item}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="FAQ"
            title="Corporate Excel Training FAQ"
            description="Answers to common questions about Velttech's Microsoft Excel training."
          />
          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.04}>
                <details className="group rounded-2xl border border-slate-200 bg-light p-5 shadow-sm">
                  <summary className="cursor-pointer list-none text-base font-black text-dark">
                    <span className="flex items-center justify-between gap-4">
                      {faq.question}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-dark transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-slate-200 pt-4 text-base leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-dark p-6 shadow-2xl shadow-slate-900/18 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(156,206,217,0.2),transparent_28%),radial-gradient(circle_at_86%_70%,rgba(244,195,24,0.18),transparent_30%)]"
              aria-hidden="true"
            />
            <div className="relative max-w-3xl">
              <Presentation size={30} className="text-primary" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Empower your team with practical Excel skills that deliver real business results.
              </h2>
            </div>
            <Link
              href="/contact"
              className="relative mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308] lg:mt-0"
            >
              Contact Velttech Today
              <MessageCircle size={18} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
