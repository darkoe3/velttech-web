import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate } from "@/components/ui/academy";
import { djangoApiFetch } from "@/lib/django-api";

export default async function MyProgressPage() {
  try {
    const reports = await djangoApiFetch("my-progress");
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="Progress" description="Latest learning updates and instructor feedback." />
        {reports.length === 0 ? (
          <EmptyState>No progress reports yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {reports.map((report) => (
              <AcademyCard key={report.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-dark">{report.course_title}</h2>
                    {report.student_name ? <p className="mt-1 text-sm text-slate-600">{report.student_name}</p> : null}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {report.progress_score}%
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {report.instructor_comment || "No instructor comment yet."}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {formatDate(report.created_at)}
                </p>
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="We could not load progress reports." /></section>;
  }
}
