import { djangoApiFetch } from "@/lib/django-api";
import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
  formatDate,
  formatMoney,
  humanize,
} from "@/components/ui/academy";

export default async function MyCoursesPage() {
  let courses;
  let enrollments;

  try {
    [courses, enrollments] = await Promise.all([
      djangoApiFetch("my-courses"),
      djangoApiFetch("enrollments"),
    ]);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <ErrorState message="We could not load your courses right now. Please try again shortly." />
      </section>
    );
  }

  const enrollmentByCourseId = new Map(
    enrollments.map((enrollment) => [enrollment.course, enrollment]),
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="My Courses"
        description="A clear view of your current course access and enrollment details."
      />

      {courses.length === 0 ? (
        <EmptyState>No courses available yet.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const enrollment = enrollmentByCourseId.get(course.id);

            return (
              <AcademyCard key={course.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-dark">{course.title}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                    {humanize(enrollment?.status || (course.is_active ? "active" : "inactive"))}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{course.description}</p>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">Duration</dt>
                    <dd className="mt-1 text-slate-800">{course.duration_months} months</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Monthly fee</dt>
                    <dd className="mt-1 text-slate-800">{formatMoney(course.monthly_fee)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Enrollment date</dt>
                    <dd className="mt-1 text-slate-800">{formatDate(enrollment?.enrolled_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Instructor</dt>
                    <dd className="mt-1 text-slate-800">
                      {enrollment?.instructor_detail
                        ? `${enrollment.instructor_detail.first_name} ${enrollment.instructor_detail.last_name}`
                        : "Awaiting assignment"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Progress</dt>
                    <dd className="mt-1 text-slate-800">Coming soon</dd>
                  </div>
                </dl>
              </AcademyCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
