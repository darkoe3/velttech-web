"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const resourceTypes = [
  ["document", "Document"],
  ["video", "Video"],
  ["website", "Website"],
  ["github", "GitHub"],
  ["note", "Note"],
  ["other", "Other"],
];

function ErrorMessage({ error }) {
  return error ? (
    <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error}
    </p>
  ) : null;
}

async function requestJson(path, method, payload) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: payload === undefined ? undefined : JSON.stringify(payload),
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

function courseLearners(enrollments, selectedCourse) {
  return enrollments.filter((item) => String(item.course) === String(selectedCourse));
}

function buildPayload(form, resourceType, publishValue) {
  const targetStudent = form.get("target_student");
  return {
    course: Number(form.get("course")),
    title: form.get("title"),
    description: form.get("description"),
    resource_type: resourceType,
    url: resourceType === "note" ? "" : form.get("url"),
    target_student: targetStudent ? Number(targetStudent) : null,
    is_published: publishValue,
  };
}

function ResourceFields({
  courses,
  enrollments,
  selectedCourse,
  setSelectedCourse,
  resourceType,
  setResourceType,
  defaultResource,
}) {
  const learners = useMemo(
    () => courseLearners(enrollments, selectedCourse),
    [enrollments, selectedCourse],
  );
  const [audience, setAudience] = useState(defaultResource?.target_student ? "learner" : "course");

  return (
    <>
      <select
        name="course"
        required
        value={selectedCourse}
        onChange={(event) => setSelectedCourse(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-3"
      >
        <option value="">Select course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          <input
            type="radio"
            name="audience"
            value="course"
            checked={audience === "course"}
            onChange={() => setAudience("course")}
          />
          Entire Course
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          <input
            type="radio"
            name="audience"
            value="learner"
            checked={audience === "learner"}
            onChange={() => setAudience("learner")}
          />
          Individual Learner
        </label>
      </div>
      {audience === "learner" ? (
        <select
          name="target_student"
          required
          defaultValue={defaultResource?.target_student || ""}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        >
          <option value="">Select learner</option>
          {learners.map((item) => (
            <option key={`${item.id}-${item.student}`} value={item.student}>
              {item.student_name || "Learner"} - {item.course_title || "Course"}
            </option>
          ))}
        </select>
      ) : (
        <input type="hidden" name="target_student" value="" />
      )}
      <input
        name="title"
        required
        defaultValue={defaultResource?.title || ""}
        placeholder="Resource title"
        className="w-full rounded-lg border border-slate-300 px-4 py-3"
      />
      <select
        name="resource_type"
        required
        value={resourceType}
        onChange={(event) => setResourceType(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-4 py-3"
      >
        {resourceTypes.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {resourceType !== "note" ? (
        <input
          name="url"
          type="url"
          required
          defaultValue={defaultResource?.url || ""}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      ) : null}
      <textarea
        name="description"
        required={resourceType === "note"}
        defaultValue={defaultResource?.description || ""}
        placeholder="Description / instructions"
        className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3"
      />
    </>
  );
}

export function ResourceForm({ courses, enrollments }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [resourceType, setResourceType] = useState("document");

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const action = event.nativeEvent.submitter?.value || "draft";
    const publishNow = form.get("publish_now") === "on";
    setPending(true);
    setError("");
    try {
      await requestJson("/api/instructor/resources", "POST", buildPayload(form, resourceType, action === "publish" || publishNow));
      formElement.reset();
      setSelectedCourse("");
      setResourceType("document");
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
      <ResourceFields
        courses={courses}
        enrollments={enrollments}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        resourceType={resourceType}
        setResourceType={setResourceType}
      />
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="publish_now" type="checkbox" />
        Publish now
      </label>
      <div className="flex flex-wrap gap-3">
        <button name="action" value="draft" disabled={pending} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-dark disabled:opacity-60">
          {pending ? "Saving..." : "Save Draft"}
        </button>
        <button name="action" value="publish" disabled={pending} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "Publishing..." : "Publish Resource"}
        </button>
      </div>
    </form>
  );
}

export function ResourceActions({ resource, courses, enrollments }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(String(resource.course || ""));
  const [resourceType, setResourceType] = useState(resource.resource_type || "document");

  async function updateResource(payload) {
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/resources/${resource.id}`, "PATCH", payload);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateResource(buildPayload(form, resourceType, resource.is_published));
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this resource?")) return;
    setPending(true);
    setError("");
    try {
      await requestJson(`/api/instructor/resources/${resource.id}`, "DELETE");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ErrorMessage error={error} />
      {resource.url ? (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
          Open
        </a>
      ) : null}
      <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-10 items-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white">
        Edit
      </button>
      <button
        type="button"
        onClick={() => updateResource({ is_published: !resource.is_published })}
        disabled={pending}
        className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-dark disabled:opacity-60"
      >
        {resource.is_published ? "Unpublish" : "Publish"}
      </button>
      <button type="button" onClick={handleDelete} disabled={pending} className="inline-flex min-h-10 items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
        Delete
      </button>
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8">
          <form onSubmit={handleUpdate} className="w-full max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-dark">Edit Resource</h3>
                <p className="mt-1 text-sm text-slate-600">Update the link, note, audience, or instructions.</p>
              </div>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-dark">Cancel</button>
            </div>
            <ErrorMessage error={error} />
            <ResourceFields
              courses={courses}
              enrollments={enrollments}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              resourceType={resourceType}
              setResourceType={setResourceType}
              defaultResource={resource}
            />
            <div className="flex flex-wrap gap-3">
              <button disabled={pending} className="rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pending ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-dark">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
