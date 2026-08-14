import StudentFilters from "@/components/admin/StudentFilters";
import { ErrorState } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";

export const dynamic = "force-dynamic";

function fullName(person) {
  return [person?.first_name, person?.other_name, person?.last_name]
    .filter(Boolean)
    .join(" ") || "Not provided";
}

export default async function StudentsPage() {
  let students = [];
  try {
    students = await fetchInternalJson("/api/admin/students", "admin-students-page");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[admin-students-page] failed to load students", {
      endpoint: "/api/admin/students",
      message: error?.message,
    });
    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="Students could not load"
          message="The students list is temporarily unavailable. The technical details were logged for support."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Students</h1>
      </div>

      {students.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No students available yet.
        </p>
      ) : (
        <StudentFilters students={students} renderStudent={(student) => (
            <article
              key={student.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-dark">{fullName(student)}</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">School</dt>
                  <dd className="mt-1 text-slate-800">
                    {student.school_name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Phone number</dt>
                  <dd className="mt-1 text-slate-800">
                    {student.phone_number || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Parent name</dt>
                  <dd className="mt-1 text-slate-800">
                    {fullName(student.parent_detail)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Parent phone</dt>
                  <dd className="mt-1 text-slate-800">
                    {student.parent_detail?.phone_number || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Courses</dt>
                  <dd className="mt-1 text-slate-800">
                    {student.course_names?.length ? student.course_names.join(", ") : "Not assigned"}
                  </dd>
                </div>
              </dl>
            </article>
          )} />
      )}
    </section>
  );
}
