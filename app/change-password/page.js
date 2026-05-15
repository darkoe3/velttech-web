"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: form.get("old_password"),
        new_password: form.get("new_password"),
        confirm_password: form.get("confirm_password"),
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.detail || Object.values(body || {}).flat().join(" ") || "Could not change password.");
    } else {
      setMessage(body.detail || "Password changed successfully.");
      formElement.reset();
    }
    setPending(false);
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-10">
      <h1 className="text-3xl font-bold text-dark">Change Password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        <input name="old_password" type="password" required placeholder="Old password" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        <input name="new_password" type="password" required placeholder="New password" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        <input name="confirm_password" type="password" required placeholder="Confirm password" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
        <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "Saving..." : "Change Password"}
        </button>
      </form>
    </section>
  );
}
