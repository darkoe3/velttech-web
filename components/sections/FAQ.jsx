"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";

const faqs = [
  {
    question: "What services does Velttech provide?",
    answer:
      "Velttech provides coding for kids, Microsoft Excel data analysis training, data collection and analysis, software solutions, and IT consulting.",
  },
  {
    question: "Do you train children in coding?",
    answer:
      "Yes. We teach children and teens practical coding skills including block programming such as Scratch, App Inventor, Tinkercad, and text-based programming languages like Python and JavaScript.",
  },
  {
    question: "What are the modes of training?",
    answer: "Our training sessions are delivered virtually using Zoom.",
  },
  {
    question: "What tools are needed for training?",
    answer: "Learners need a laptop and a stable internet connection.",
  },
  {
    question: "Do you have sample project presentations?",
    answer: "Yes. Please contact the admin for sample project presentations.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-light py-20 sm:py-24" aria-labelledby="faq-title">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-secondary">
            FAQ
          </p>
          <h2 id="faq-title" className="mt-3 text-4xl font-black tracking-tight text-dark sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Clear answers about Velttech services, training delivery, and what learners need.
          </p>
        </Reveal>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <Reveal key={faq.question} delay={index * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="text-base font-black text-dark sm:text-lg">
                      {faq.question}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/18 text-dark">
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <ChevronDown size={20} aria-hidden="true" />
                      </motion.span>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-slate-100 px-5 pb-5 pt-4 text-base leading-7 text-slate-600 sm:px-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
