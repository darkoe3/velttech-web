"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const adultProgrammes = [
  "Fullstack Web Development",
  "AI Productivity & Digital Skills",
  "General Adult Digital Literacy",
  "Coding & Robotics for Kids & Teens",
  "Information Technology Support (IT Support)",
  "Advanced Excel & Data Analytics",
  "Website Design with WordPress",
  "Python Programming",
  "Cloud Computing",
  "Digital Marketing & Social Media",
  "Video Editing & Content Creation",
  "ICT Integration for Teachers",
  "Freelancing & Tech Entrepreneurship",
];

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  account_type: "parent_registering_child",
  programme_of_interest: "",
  website: "",
  company: "",
  password: "",
  confirm_password: "",
};

function extractErrorMessage(data) {
  if (!data || typeof data !== "object") {
    return "Unable to create account. Please review your details and try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail.join(" ");
  }

  const fieldError = Object.entries(data)
    .filter(([field]) => field !== "detail")
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(" ") : value;
      return message ? `${field.replaceAll("_", " ")}: ${message}` : "";
    })
    .find(Boolean);

  return fieldError || "Unable to create account. Please review your details and try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdultLearner = form.account_type === "adult_learner";

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const honeypotWebsite = form.website.trim();
    const honeypotCompany = form.company.trim();
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email,
      phone_number: form.phone_number,
      account_type: form.account_type,
      programme_of_interest: form.programme_of_interest,
      password: form.password,
      confirm_password: form.confirm_password,
      role: form.account_type === "adult_learner" ? "student" : "parent",
    };
    if (honeypotWebsite) payload.website = honeypotWebsite;
    if (honeypotCompany) payload.company = honeypotCompany;

    let res;
    let data;
    try {
      res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => ({}));
    } catch {
      setError("Unable to connect to the registration service. Please check your connection and try again.");
      setIsSubmitting(false);
      return;
    }

    if (!res.ok) {
      setError(extractErrorMessage(data));
      setIsSubmitting(false);
      return;
    }

    if (data.pending_approval) {
      router.replace("/pending-approval");
      return;
    }

    router.replace("/pending-approval");
    router.refresh();
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Velttech Academy
        </p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Create account</h1>
        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div hidden aria-hidden="true">
            <input
              id="signup-confirmation-token"
              name="signup_confirmation_token"
              type="text"
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
              value={form.website}
              onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
            />
            <input
              id="signup-reference-code"
              name="signup_reference_code"
              type="text"
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
              value={form.company}
              onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
            />
          </div>
          {[
            ["first_name", "First Name", "text"],
            ["last_name", "Last Name", "text"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="text-sm font-semibold text-slate-700">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required
                value={form[name]}
                onChange={updateField}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
          ))}
          {[
            ["email", "Email", "email"],
            ["phone_number", "Phone number", "tel"],
            ["password", "Password", "password"],
            ["confirm_password", "Confirm password", "password"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="text-sm font-semibold text-slate-700">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required
                value={form[name]}
                onChange={updateField}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label htmlFor="account_type" className="text-sm font-semibold text-slate-700">
              Who are you registering?
            </label>
            <select
              id="account_type"
              name="account_type"
              value={form.account_type}
              onChange={updateField}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            >
              <option value="parent_registering_child">Parent enrolling a child</option>
              <option value="adult_learner">Adult learner enrolling myself</option>
            </select>
            <p className="mt-2 text-sm text-slate-500">
              Parents can add children after signup. Adult learners get dashboard access after admin approval.
            </p>
          </div>
          {isAdultLearner ? (
            <div className="sm:col-span-2">
              <label htmlFor="programme_of_interest" className="text-sm font-semibold text-slate-700">
                Programme of interest
              </label>
              <select
                id="programme_of_interest"
                name="programme_of_interest"
                required
                value={form.programme_of_interest}
                onChange={updateField}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                <option value="">Select programme</option>
                {adultProgrammes.map((programme) => (
                  <option key={programme} value={programme}>
                    {programme}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {success ? (
            <p className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          ) : null}
          {error ? (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {String(error)}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="sm:col-span-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-dark shadow-sm shadow-primary/30 transition hover:bg-secondary disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
