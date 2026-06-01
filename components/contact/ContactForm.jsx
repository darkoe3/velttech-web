"use client";

import { Send } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

const initialForm = {
  name: "",
  email: "",
  phone: "",
  service: "Coding for Kids",
  message: "",
  website: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileReady || !turnstileContainerRef.current || !window.turnstile) {
      return;
    }

    if (turnstileWidgetIdRef.current !== null) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      callback(token) {
        setForm((current) => ({ ...current, turnstileToken: token }));
      },
      "expired-callback"() {
        setForm((current) => ({ ...current, turnstileToken: "" }));
      },
      "error-callback"() {
        setForm((current) => ({ ...current, turnstileToken: "" }));
      },
    });
  }, [turnstileReady]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "We could not send your message right now.");
      }

      setForm(initialForm);
      if (turnstileWidgetIdRef.current !== null && window.turnstile) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
      setStatus("success");
      setFeedback("Thank you! Your message has been sent successfully.");
    } catch (error) {
      setStatus("error");
      setFeedback(error.message || "We could not send your message right now.");
    }
  }

  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
      onSubmit={handleSubmit}
    >
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setTurnstileReady(true)}
        />
      ) : null}
      <h2 className="text-2xl font-black text-dark">Send an enquiry</h2>
      <label className="hidden" aria-hidden="true" tabIndex={-1}>
        <span>Website</span>
        <input
          name="website"
          type="text"
          value={form.website}
          onChange={updateField}
          autoComplete="off"
          tabIndex={-1}
        />
      </label>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Name</span>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            name="name"
            type="text"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Phone</span>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Service interest</span>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            name="service"
            value={form.service}
            onChange={updateField}
          >
            <option>Coding for Kids</option>
            <option>Corporate Microsoft Excel Training</option>
            <option>Data Collection &amp; Analysis</option>
            <option>Software Solutions</option>
            <option>IT Consulting</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Message</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            name="message"
            value={form.message}
            onChange={updateField}
            required
          />
        </label>
        {turnstileSiteKey ? (
          <div
            className="min-h-[65px] md:col-span-2"
            ref={turnstileContainerRef}
          />
        ) : null}
      </div>

      {feedback ? (
        <p
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            status === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-dark shadow-lg shadow-primary/25 transition hover:bg-[#EAB308] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
        <Send size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
