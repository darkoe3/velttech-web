import { ProgressReportForm } from "@/components/instructor/InstructorRecordForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorProgressPage() {
  try {
    const [{ authorized }, enrollments, reports] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/enrollments", "progress-page"),
      fetchInternalJson("/api/instructor/progress-reports", "progress-page"),
    ]);

    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <AcademyCard>
            <SectionHeading title="Add Progress Report" />
            <ProgressReportForm enrollments={enrollments} />
          </AcademyCard>
          <section>
            <SectionHeading title="Previous Progress Reports" />
            {reports.length === 0 ? (
              <EmptyState>No records yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <AcademyCard key={report.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-dark">{report.student_name}</h2>
                        <p className="mt-1 text-sm text-slate-600">{report.course_title}</p>
                      </div>
                      <span className="text-2xl font-bold text-dark">{report.progress_score}%</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{formatDate(report.created_at)}</p>
                    {report.instructor_comment ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{report.instructor_comment}</p>
                    ) : null}
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load progress reports."} /></section>;
  }
}
