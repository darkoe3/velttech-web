"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const initialForm = {
  first_name: "",
  other_name: "",
  last_name: "",
  date_of_birth: "",
  school_name: "",
  phone_number: "",
  emergency_contact: "",
};

function formatBackendErrors(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  return Object.entries(data)
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((message) => `${field.replaceAll("_", " ")}: ${message}`);
      }
      if (typeof value === "string") {
        return `${field.replaceAll("_", " ")}: ${value}`;
      }
      return [];
    })
    .join(" ");
}

function parseResponseBody(text) {
  if (!text) {
    return { parsed: null, message: "" };
  }

  try {
    const parsed = JSON.parse(text);
    return {
      parsed,
      message: formatBackendErrors(parsed),
    };
  } catch {
    return {
      parsed: null,
      message: text,
    };
  }
}

export default function NewChildPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      first_name: form.first_name,
      other_name: form.other_name,
      last_name: form.last_name,
      date_of_birth: form.date_of_birth || null,
      school_name: form.school_name,
      phone_number: form.phone_number,
      emergency_contact: form.emergency_contact,
    };

    console.log("Add child request payload", payload);

    const response = await fetch("/api/my-children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const { parsed, message } = parseResponseBody(responseText);

    console.log("Add child response status", response.status, response.statusText);
    console.log("Add child response body", responseText);

    if (!response.ok) {
      console.error("Add child failed", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        parsed,
      });

      setError(message || "We could not add this child right now.");
      setSubmitting(false);
      return;
    }

    router.push("/my-children");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Parent</p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Add Child</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add your child’s profile first. Course and instructor assignment are handled by the academy admin.
        </p>

        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ["first_name", "First name", "text", true],
            ["other_name", "Other name", "text", false],
            ["last_name", "Last name", "text", true],
            ["date_of_birth", "Date of birth", "date", false],
            ["school_name", "School name", "text", false],
            ["phone_number", "Phone number", "text", false],
            ["emergency_contact", "Emergency contact", "text", false],
          ].map(([name, label, type, required]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
              {label}
              <input
                name={name}
                type={type}
                required={required}
                value={form[name]}
                onChange={updateField}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-dark"
              />
            </label>
          ))}

          {error ? (
            <p className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Child"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-dark transition hover:bg-slate-50"
              onClick={() => router.push("/my-children")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
