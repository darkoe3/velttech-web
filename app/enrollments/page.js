import { djangoApiFetch } from "@/lib/django-api";
import EnrollmentFilters from "@/components/admin/EnrollmentFilters";

function fullName(person) {
  return [person?.first_name, person?.other_name, person?.last_name]
    .filter(Boolean)
    .join(" ") || "Not provided";
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatStatus(value) {
  return value
    ? value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase())
    : "Not provided";
}

export default async function EnrollmentsPage() {
  const enrollments = await djangoApiFetch("enrollments");

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Enrollments</h1>
      </div>

      {enrollments.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No enrollments available yet.
        </p>
      ) : (
        <EnrollmentFilters enrollments={enrollments} renderEnrollment={(enrollment) => (
            <article
              key={enrollment.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-dark">
                  {fullName(enrollment.student_detail)}
                </h2>
                <span className="rounded-full bg-techBlue/25 px-3 py-1 text-xs font-bold text-slate-700">
                  {formatStatus(enrollment.status)}
                </span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Course</dt>
                  <dd className="mt-1 text-slate-800">
                    {enrollment.course_detail?.title || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Start date</dt>
                  <dd className="mt-1 text-slate-800">
                    {formatDate(enrollment.start_date)}
                  </dd>
                </div>
              </dl>
            </article>
          )} />
      )}
    </section>
  );
}
