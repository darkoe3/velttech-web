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

async function submitJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const detail =
      typeof body === "string"
        ? body
        : body?.detail ||
          Object.values(body || {}).flat().join(" ") ||
          "Request failed.";
    throw new Error(detail);
  }
  return body;
}

export function AttendanceForm({ enrollments }) {
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
      await submitJson("/api/instructor/attendance", {
        enrollment: Number(form.get("enrollment")),
        date: form.get("date"),
        status: form.get("status"),
        remarks: form.get("remarks"),
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
      <select name="enrollment" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
        <option value="">Select enrollment</option>
        {enrollments.map((item) => (
          <option key={item.id} value={item.id}>
            {item.student_name} — {item.course_title}
          </option>
        ))}
      </select>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="date" type="date" required className="rounded-xl border border-slate-300 px-4 py-3" />
        <select name="status" required className="rounded-xl border border-slate-300 px-4 py-3">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </div>
      <textarea name="remarks" placeholder="Remarks" className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Record Attendance"}
      </button>
    </form>
  );
}

export function LessonNoteForm({ courses }) {
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
      await submitJson("/api/instructor/lesson-notes", {
        course: Number(form.get("course")),
        title: form.get("title"),
        content: form.get("content"),
        lesson_date: form.get("lesson_date"),
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
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <input name="title" required placeholder="Lesson title" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="content" required placeholder="Lesson content" className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <input name="lesson_date" type="date" required className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Add Lesson Note"}
      </button>
    </form>
  );
}

export function ProgressReportForm({ enrollments }) {
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
      await submitJson("/api/instructor/progress-reports", {
        enrollment: Number(form.get("enrollment")),
        progress_score: Number(form.get("progress_score")),
        strengths: form.get("strengths"),
        areas_for_improvement: form.get("areas_for_improvement"),
        instructor_comment: form.get("instructor_comment"),
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
      <select name="enrollment" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
        <option value="">Select enrollment</option>
        {enrollments.map((item) => (
          <option key={item.id} value={item.id}>{item.student_name} — {item.course_title}</option>
        ))}
      </select>
      <input name="progress_score" type="number" min="0" max="100" required placeholder="Progress score" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="strengths" placeholder="Strengths" className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="areas_for_improvement" placeholder="Areas for improvement" className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="instructor_comment" placeholder="Instructor comment" className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Add Progress Report"}
      </button>
    </form>
  );
}
