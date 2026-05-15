import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
  formatDate,
  humanize,
} from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorEnrollmentsPage() {
  try {
    const [{ authorized }, enrollments] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/enrollments", "enrollments-page"),
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
        <SectionHeading title="Enrollments" />
        {enrollments.length === 0 ? (
          <EmptyState>No enrollments yet.</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => (
              <AcademyCard key={enrollment.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-dark">
                    {enrollment.student_name}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {humanize(enrollment.status)}
                  </span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">Course</dt>
                    <dd className="mt-1 text-dark">{enrollment.course_title}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Start date</dt>
                    <dd className="mt-1 text-dark">
                      {formatDate(enrollment.start_date)}
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
        <ErrorState message={error?.message || "We could not load instructor enrollments."} />
      </section>
    );
  }
}
