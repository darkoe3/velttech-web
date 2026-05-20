"use client";
import { useMemo, useState } from "react";
export default function EnrollmentFilters({ enrollments, renderEnrollment }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [course, setCourse] = useState("");

  const courses = useMemo(
    () => [...new Map(enrollments.map((item) => [item.course, item.course_detail?.title]).filter(([, title]) => title)).entries()],
    [enrollments],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return enrollments.filter((enrollment) => {
      const haystack = [
        enrollment.student_detail?.first_name,
        enrollment.student_detail?.last_name,
        enrollment.student_detail?.email,
        enrollment.student_detail?.parent_detail?.email,
        enrollment.course_detail?.title,
      ].filter(Boolean).join(" ").toLowerCase();
      return (
        (!term || haystack.includes(term)) &&
        (!status || enrollment.status === status) &&
        (!course || String(enrollment.course) === course)
      );
    });
  }, [enrollments, search, status, course]);

  return (
    <>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="rounded-xl border px-4 py-3" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border px-4 py-3">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={course} onChange={(event) => setCourse(event.target.value)} className="rounded-xl border px-4 py-3">
          <option value="">All courses</option>
          {courses.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <p className="rounded-xl border bg-white p-6 text-slate-600">No enrollments match the current filters.</p> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(renderEnrollment)}</div>}
    </>
  );
}
