import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
  humanize,
} from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorStudentsPage() {
  try {
    const [{ authorized }, students] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/students", "students-page"),
    ]);

    if (!authorized) {
      return (
        <section className="mx-auto max-w-7xl px-5 py-10">
          <ErrorState message="Instructor access is required." />
        </section>
      );
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="My Students" />
        {students.length === 0 ? (
          <EmptyState>No assigned students yet.</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {students.map((student) => (
              <AcademyCard key={student.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-dark">
                    {student.full_name}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {humanize(student.enrollment_status)}
                  </span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">School</dt>
                    <dd className="mt-1 text-dark">
                      {student.school_name || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Assigned course</dt>
                    <dd className="mt-1 text-dark">
                      {student.assigned_course || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Parent</dt>
                    <dd className="mt-1 text-dark">
                      {student.parent_name || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Parent phone</dt>
                    <dd className="mt-1 text-dark">
                      {student.parent_phone || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <ErrorState message={error?.message || "We could not load instructor students."} />
      </section>
    );
  }
}
