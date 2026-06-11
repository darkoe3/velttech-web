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

function submissionTypeLabel(value) {
  const labels = {
    text: "Text answer",
    file_upload: "File upload",
    both: "Text + File upload",
  };
  return labels[value] || "Text answer";
}

async function requestFormData(path, method, payload) {
  const response = await fetch(path, {
    method,
    credentials: "include",
    body: payload,
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

export function AssignmentForm({ courses, enrollments = [], instructors = [], allowInstructorSelect = false }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const targetStudent = form.get("target_student");
    const marks = form.get("marks");
    setPending(true);
    setError("");
    try {
      const payload = {
        course: Number(form.get("course")),
        title: form.get("title"),
        description: form.get("description"),
        due_date: form.get("due_date"),
        submission_type: form.get("submission_type"),
        target_student: targetStudent ? Number(targetStudent) : null,
        marks: marks ? Number(marks) : null,
        is_active: true,
      };
      if (allowInstructorSelect && form.get("instructor")) {
        payload.instructor = Number(form.get("instructor"));
      }
      await requestJson("/api/instructor/assignments", "POST", payload);
      formElement.reset();
      setSelectedCourse("");
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
      {allowInstructorSelect ? (
        <select name="instructor" required className="w-full rounded-xl border border-slate-300 px-4 py-3">
          <option value="">Select instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {[instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || instructor.email}
            </option>
          ))}
        </select>
      ) : null}
      <select
        name="course"
        required
        value={selectedCourse}
        onChange={(event) => setSelectedCourse(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Select course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      <select name="target_student" className="w-full rounded-xl border border-slate-300 px-4 py-3">
        <option value="">Group assignment</option>
        {enrollments
          .filter((item) => !selectedCourse || String(item.course) === selectedCourse)
          .map((item) => (
            <option key={`${item.id}-${item.student}`} value={item.student}>
              {item.student_name || item.student_detail?.full_name || "Student"} - {item.course_title || item.course_detail?.title || "Course"}
            </option>
          ))}
      </select>
      <input name="title" required placeholder="Assignment title" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
      <textarea name="description" required placeholder="Description / question / instructions" className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3" />
      <div className="grid gap-4 sm:grid-cols-3">
        <input name="due_date" type="date" required className="rounded-xl border border-slate-300 px-4 py-3" />
        <select name="submission_type" required defaultValue="text" className="rounded-xl border border-slate-300 px-4 py-3">
          <option value="text">Text answer</option>
          <option value="file_upload">File upload</option>
          <option value="both">Text + File upload</option>
        </select>
        <input name="marks" type="number" min="0" max="100" placeholder="Marks / score" className="rounded-xl border border-slate-300 px-4 py-3" />
      </div>
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Publishing..." : "Create Assignment"}
      </button>
    </form>
  );
}

export function SubmissionForm({ assignment, existingSubmission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submissionType = assignment.submission_type || "text";
  const acceptsText = submissionType === "text" || submissionType === "both";
  const acceptsFile = submissionType === "file_upload" || submissionType === "both";
  const fileDownloadHref = existingSubmission?.id
    ? `/api/my-assignments/submissions/${existingSubmission.id}/file`
    : "";

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("uploaded_file");
    if (file?.size > 10 * 1024 * 1024) {
      setError("Assignment files must be 10MB or smaller.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await requestFormData(`/api/my-assignments/${assignment.id}/submit`, "POST", form);
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
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-dark">Allowed submission: {submissionTypeLabel(submissionType)}</p>
        <p className="mt-1">Maximum file size: {assignment.max_file_size_mb || 10}MB</p>
      </div>
      {acceptsText ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Type your answer here</span>
          <textarea
            name="text_answer"
            required={submissionType === "text"}
            defaultValue={existingSubmission?.text_answer || existingSubmission?.submission_text || ""}
            className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
      ) : null}
      {acceptsFile ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Upload your assignment file</span>
          <input
            name="uploaded_file"
            type="file"
            required={submissionType === "file_upload" && !existingSubmission?.uploaded_file_name}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt,.html,.css,.js,.py"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
      ) : null}
      {existingSubmission ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-dark">Submitted {existingSubmission.submitted_at ? new Date(existingSubmission.submitted_at).toLocaleDateString("en-GH") : "date not set"}</p>
          {existingSubmission.uploaded_file_name ? (
            <p className="mt-2">
              File: <a href={fileDownloadHref} className="font-bold text-secondary">{existingSubmission.uploaded_file_name}</a>
            </p>
          ) : null}
          {(existingSubmission.text_answer || existingSubmission.submission_text) ? (
            <p className="mt-2">{existingSubmission.text_answer || existingSubmission.submission_text}</p>
          ) : null}
          {existingSubmission.status === "graded" ? (
            <p className="mt-2 font-semibold">Grade: {existingSubmission.grade ?? existingSubmission.score ?? "Not set"} / {existingSubmission.max_score || assignment.marks || 100}</p>
          ) : null}
          {existingSubmission.graded_at ? (
            <p className="mt-2 text-slate-500">Graded {new Date(existingSubmission.graded_at).toLocaleDateString("en-GH")}</p>
          ) : null}
          {existingSubmission.feedback ? <p className="mt-2">{existingSubmission.feedback}</p> : null}
        </div>
      ) : null}
      <button
        disabled={pending || existingSubmission?.status === "graded"}
        className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : existingSubmission ? "Save Submission" : "Submit Assignment"}
      </button>
    </form>
  );
}

export function GradeForm({ submission }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const maxScore = submission.max_score || submission.assignment_marks || 100;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await requestJson(`/api/instructor/submissions/${submission.id}/grade`, "PATCH", {
        grade: Number(form.get("grade")),
        max_score: Number(form.get("max_score")),
        feedback: form.get("feedback"),
        status: form.get("status"),
      });
      setSuccess("Grade saved successfully.");
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
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-dark">Max score: {maxScore}</p>
      </div>
      <input
        name="grade"
        type="number"
        min="0"
        max={maxScore}
        required
        defaultValue={submission.grade ?? submission.score ?? ""}
        placeholder="Grade"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />
      <input name="max_score" type="hidden" value={maxScore} />
      <textarea
        name="feedback"
        required
        defaultValue={submission.feedback || ""}
        placeholder="Feedback"
        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
      <select
        name="status"
        defaultValue={submission.status === "returned" ? "returned" : "graded"}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="graded">Graded</option>
        <option value="returned">Returned</option>
      </select>
      <button disabled={pending} className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : submission.status === "graded" ? "Update Grade" : "Save Grade"}
      </button>
    </form>
  );
}
