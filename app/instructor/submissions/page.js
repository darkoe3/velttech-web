import { GradeForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
  returned: "bg-amber-100 text-amber-700",
};

const submissionTypeLabels = {
  quiz: "Quiz assessment",
  practical: "Practical assessment",
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
        <SectionHeading title="Assessment Results" description="Review quiz results and practical assessment feedback." />
        {submissions.length === 0 ? (
          <EmptyState>No assessment results yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {submissions.map((submission) => (
              <AcademyCard key={submission.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-dark">{submission.assignment_title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{submission.student_name} - {submission.course_title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[submission.status]}`}>
                      {humanize(submission.status)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                      {submissionTypeLabels[submission.assignment_submission_type] || "Quiz assessment"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`#submission-${submission.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                    View Result
                  </a>
                  <a href={`#grade-${submission.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white">
                    Grade Result
                  </a>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">Due date</dt>
                    <dd className="mt-1 font-bold text-dark">{formatDate(submission.assignment_due_date)}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">Submitted date</dt>
                    <dd className="mt-1 font-bold text-dark">{formatDate(submission.submitted_at)}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">Grade</dt>
                    <dd className="mt-1 font-bold text-dark">{submission.grade ?? submission.score ?? "Not graded"} / {submission.max_score || submission.assignment_marks || 100}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">Graded date</dt>
                    <dd className="mt-1 font-bold text-dark">{formatDate(submission.graded_at)}</dd>
                  </div>
                </dl>

                <div id={`submission-${submission.id}`} className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-dark">Assignment instructions</p>
                  <p className="mt-2 whitespace-pre-wrap">{submission.assignment_description || "No instructions provided."}</p>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-dark">Quiz answers</p>
                  <p className="mt-2 whitespace-pre-wrap">{submission.quiz_answers ? JSON.stringify(submission.quiz_answers, null, 2) : "No quiz answers recorded."}</p>
                </div>

                <div id={`grade-${submission.id}`}>
                  <GradeForm submission={submission} />
                </div>
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
