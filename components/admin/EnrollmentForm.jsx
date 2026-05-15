"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function messageFrom(text) {
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    if (parsed.detail) return parsed.detail;
    return Object.entries(parsed)
      .flatMap(([field, messages]) =>
        Array.isArray(messages)
          ? messages.map((message) => `${field.replaceAll("_", " ")}: ${message}`)
          : [],
      )
      .join(" ");
  } catch {
    return text;
  }
}

export default function EnrollmentForm({ students, courses, instructors, initialStudentId }) {
  const router = useRouter();
  const [form, setForm] = useState({
    student: initialStudentId || "",
    course: "",
    instructor: "",
    start_date: "",
    status: "active",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/enrollments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        student: Number(form.student),
        course: Number(form.course),
        instructor: form.instructor ? Number(form.instructor) : null,
        start_date: form.start_date || null,
      }),
    });
    const body = await response.text();
    if (!response.ok) {
      setMessage(messageFrom(body) || "Could not create enrollment.");
      setSaving(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Approved student
        <select name="student" required value={form.student} onChange={update} className="rounded-xl border border-slate-300 px-4 py-3">
          <option value="">Select student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>{student.full_name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Course
        <select name="course" required value={form.course} onChange={update} className="rounded-xl border border-slate-300 px-4 py-3">
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Instructor
        <select name="instructor" required value={form.instructor} onChange={update} className="rounded-xl border border-slate-300 px-4 py-3">
          <option value="">Select instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.first_name} {instructor.last_name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Start date
          <input type="date" name="start_date" value={form.start_date} onChange={update} className="rounded-xl border border-slate-300 px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Status
          <select name="status" value={form.status} onChange={update} className="rounded-xl border border-slate-300 px-4 py-3">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      {message ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</p> : null}
      <button disabled={saving} className="rounded-xl bg-dark px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {saving ? "Creating..." : "Create Enrollment"}
      </button>
    </form>
  );
}
