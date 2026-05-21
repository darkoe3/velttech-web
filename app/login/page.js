"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = searchParams.get("next");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.detail || "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    const defaultPath = data.user?.role === "instructor" ? "/instructor/dashboard" : "/dashboard";
    router.replace(nextPath?.startsWith("/") ? nextPath : defaultPath);
    router.refresh();
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
            Velttech Academy
          </p>
          <h1 className="mt-2 text-3xl font-bold text-dark">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Access dashboard, student, course, enrollment, and payment records.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={updateField}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={updateField}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-dark shadow-sm shadow-primary/30 transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-lg">
            Loading sign in...
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
