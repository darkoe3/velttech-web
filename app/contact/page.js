import { Mail, MessageCircle, Phone, Globe } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import {
  contactPhoneDisplay,
  contactPhoneHref,
  whatsappHref,
} from "@/lib/contact-details";

export const metadata = {
  title: "Contact Velttech",
  description:
    "Contact Velttech for coding training, digital skills development, data collection and analysis, software solutions, and IT consulting.",
};

const contactItems = [
  { label: "Phone", value: contactPhoneDisplay, href: contactPhoneHref, icon: Phone },
  { label: "Email", value: "info@velttech.org", href: "mailto:info@velttech.org", icon: Mail },
  { label: "Website", value: "velttech.org", href: "https://velttech.org", icon: Globe },
];

export default function ContactPage() {
  return (
    <main className="bg-light">
      <section className="relative overflow-hidden bg-dark px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,195,24,0.2),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(156,206,217,0.22),transparent_32%)]"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            Contact
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Contact Velttech
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Tell us what you want to learn, build, analyze, or improve. We will help
            you choose the right next step.
          </p>
        </Reveal>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-2xl font-black text-dark">Reach us directly</h2>
              <div className="mt-6 space-y-4">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-light p-4 transition hover:border-primary hover:bg-white"
                    >
                      <span className="grid size-11 place-items-center rounded-xl bg-primary text-dark">
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-slate-500">{item.label}</span>
                        <span className="block font-black text-dark">{item.value}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-black text-dark shadow-lg shadow-slate-900/10 transition hover:scale-[1.01]"
              >
                <MessageCircle size={19} aria-hidden="true" />
                Chat on WhatsApp
              </Link>
            </aside>
          </Reveal>

          <Reveal delay={0.07}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
