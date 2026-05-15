import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
} from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorCoursesPage() {
  try {
    const [{ authorized }, courses] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "courses-page"),
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
        <SectionHeading title="My Courses" />
        {courses.length === 0 ? (
          <EmptyState>No assigned courses yet.</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <AcademyCard key={course.id}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-dark">{course.title}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      course.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {course.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {course.description || "No description provided."}
                </p>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">
                      Assigned students
                    </dt>
                    <dd className="mt-1 text-dark">{course.assigned_students_count}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Duration</dt>
                    <dd className="mt-1 text-dark">
                      {course.duration_months} months
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
        <ErrorState message={error?.message || "We could not load instructor courses."} />
      </section>
    );
  }
}
