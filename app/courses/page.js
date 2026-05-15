import { djangoApiFetch } from "@/lib/django-api";

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

export default async function CoursesPage() {
  const courses = await djangoApiFetch("courses");

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Courses</h1>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No courses available yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-dark">{course.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    course.is_active
                      ? "bg-accent/15 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {course.description || "No description provided."}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Duration</dt>
                  <dd className="mt-1 text-slate-800">
                    {course.duration_months} months
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Monthly fee</dt>
                  <dd className="mt-1 text-slate-800">
                    {formatMoney(course.monthly_fee)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
