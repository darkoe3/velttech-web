"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function ErrorMessage({ error }) {
  return error ? (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error}
    </p>
  ) : null;
}

async function requestJson(path, method, payload) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail =
      typeof body === "string"
        ? body
        : body?.detail || Object.values(body || {}).flat().join(" ") || "Request failed.";
    throw new Error(detail);
  }
  return body;
}

export function AssignmentForm({ courses }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setError("");
    try {
      await requestJson("/api/instructor/assignments", "POST", {
        course: Number(form.get("course")),
        title: form.get("title"),
        description: form.get("description"),
        due_date: form.get("due_date"),
        is_active: true,
      });
      formElement.reset();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage error={error} />
      <select name="course" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
        <option value="">Select course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      <input name="title" required placeholder="Assignment title" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="description" required placeholder="Instructions" className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <input name="due_date" type="date" required className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Publishing..." : "Create Assignment"}
      </button>
    </form>
  );
}

export function SubmissionForm({ assignmentId, existingSubmission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/my-assignments/${assignmentId}/submit`, "POST", {
        submission_text: form.get("submission_text"),
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <ErrorMessage error={error} />
      <textarea
        name="submission_text"
        required
        defaultValue={existingSubmission?.submission_text || ""}
        placeholder="Write your answer here"
        className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
      <button
        disabled={pending || existingSubmission?.status === "graded"}
        className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Submitting..." : existingSubmission ? "Update Submission" : "Submit Assignment"}
      </button>
    </form>
  );
}

export function GradeForm({ submission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/submissions/${submission.id}/grade`, "PATCH", {
        score: Number(form.get("score")),
        feedback: form.get("feedback"),
      });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <ErrorMessage error={error} />
      <input
        name="score"
        type="number"
        min="0"
        max="100"
        required
        defaultValue={submission.score ?? ""}
        placeholder="Score"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
      <textarea
        name="feedback"
        defaultValue={submission.feedback || ""}
        placeholder="Feedback"
        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : submission.status === "graded" ? "Update Grade" : "Grade Submission"}
      </button>
    </form>
  );
}
