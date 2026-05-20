"use client";
import { useMemo, useState } from "react";
export default function StudentFilters({ students, renderStudent }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [course, setCourse] = useState("");

  const courses = useMemo(
    () => [...new Set(students.flatMap((student) => student.course_names || []))].sort(),
    [students],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return students.filter((student) => {
      const haystack = [
        student.first_name,
        student.other_name,
        student.last_name,
        student.email,
        student.parent_detail?.email,
        student.parent_detail?.first_name,
        student.parent_detail?.last_name,
      ].filter(Boolean).join(" ").toLowerCase();
      return (
        (!term || haystack.includes(term)) &&
        (!status || student.approval_status === status) &&
        (!course || (student.course_names || []).includes(course))
      );
    });
  }, [students, search, status, course]);

  return (
    <>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="rounded-xl border px-4 py-3" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border px-4 py-3">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={course} onChange={(event) => setCourse(event.target.value)} className="rounded-xl border px-4 py-3">
          <option value="">All courses</option>
          {courses.map((title) => <option key={title} value={title}>{title}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <p className="rounded-xl border bg-white p-6 text-slate-600">No students match the current filters.</p> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(renderStudent)}</div>}
    </>
  );
}
