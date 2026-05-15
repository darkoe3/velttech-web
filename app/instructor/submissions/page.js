import { GradeForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
};

export default async function InstructorSubmissionsPage() {
  try {
    const [{ authorized }, submissions] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/submissions", "submissions-page"),
    ]);
    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="Assignment Submissions" description="Review and grade work submitted for your assignments." />
        {submissions.length === 0 ? (
          <EmptyState>No submissions yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {submissions.map((submission) => (
              <AcademyCard key={submission.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-dark">{submission.assignment_title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{submission.student_name} · {submission.course_title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[submission.status]}`}>
                    {humanize(submission.status)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {submission.submission_text || "No submission text yet."}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Submitted {formatDate(submission.submitted_at)}
                </p>
                <GradeForm submission={submission} />
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load submissions."} /></section>;
  }
}
