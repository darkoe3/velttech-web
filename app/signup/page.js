"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  role: "parent",
  password: "",
  confirm_password: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const firstError =
        data.detail ||
        Object.values(data).flat().find(Boolean) ||
        "Unable to create account.";
      setError(firstError);
      setIsSubmitting(false);
      return;
    }

    router.replace("/dashboard");
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
          {[
            ["first_name", "First name", "text"],
            ["last_name", "Last name", "text"],
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
            <label htmlFor="role" className="text-sm font-semibold text-slate-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={updateField}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            >
              <option value="parent">Parent</option>
              <option value="student">Student</option>
            </select>
          </div>
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
