import { AssignmentForm, InstructorAssignmentActions, SubmissionForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
  returned: "bg-amber-100 text-amber-700",
  overdue: "bg-rose-100 text-rose-700",
};

const submissionTypeLabels = {
  quiz: "Quiz assessment",
  practical: "Practical assessment",
};

function assignmentStatus(assignment, submission) {
  if (submission?.status === "graded") return "graded";
  if (submission?.status === "submitted") return "submitted";
  if (submission?.status === "returned") return "returned";
  if (submission?.quiz_answers && Object.keys(submission.quiz_answers).length) return "in_progress";
  const dueDate = assignment.due_date ? new Date(`${assignment.due_date}T23:59:59`) : null;
  return dueDate && dueDate < new Date() ? "overdue" : "not_started";
}

function assessmentActionLabel(assignment, submission) {
  if (assignment.submission_type === "practical") return "View Practical";
  if (submission?.status === "graded") return "View Result";
  if (submission?.quiz_answers && Object.keys(submission.quiz_answers).length) return "Answer Questions";
  return "Take Quiz";
}

function resultLabel(result, fallbackMarks) {
  const score = result.grade ?? result.score ?? "Not set";
  const marks = result.max_score || fallbackMarks || 100;
  const percentage = result.percentage ?? null;
  const letterGrade = result.letter_grade || "";
  const summary = `${score} / ${marks}`;
  if (percentage === null && !letterGrade) return summary;
  return `${summary} (${letterGrade || "-"} - ${percentage ?? 0}%)`;
}

export default async function AssignmentsPage() {
  try {
    const user = await getCurrentUser();
    const [assignments, courses, enrollments, dashboard] = await Promise.all([
      djangoApiFetch("my-assignments"),
      user.role === "admin" ? djangoApiFetch("courses") : Promise.resolve([]),
      user.role === "admin" ? djangoApiFetch("enrollments") : Promise.resolve([]),
      user.role === "admin" ? djangoApiFetch("dashboard") : Promise.resolve({ instructors: [] }),
    ]);
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="Assessments" description="Quizzes, practical assessments, scores, and feedback in one place." />
        {user.role === "admin" ? (
          <AcademyCard className="mb-8">
            <SectionHeading title="Create Assessment" description="Publish a quiz or practical assessment for a group or selected learner." />
            <AssignmentForm
              courses={courses}
              enrollments={enrollments}
              instructors={dashboard.instructors || []}
              allowInstructorSelect
            />
          </AcademyCard>
        ) : null}
        {assignments.length === 0 ? (
          <EmptyState>No assessments available yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {assignments.map((assignment) => {
              const submission = assignment.submission;
              const currentStatus = assignmentStatus(assignment, submission);
              return (
                <AcademyCard key={assignment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-dark">{assignment.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{assignment.course_title}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                        {submissionTypeLabels[assignment.submission_type] || "Quiz assessment"}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                        Due {formatDate(assignment.due_date)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{assignment.description}</p>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <dt className="font-semibold text-slate-500">Course/programme</dt>
                      <dd className="mt-1 font-bold text-dark">{assignment.course_title}</dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <dt className="font-semibold text-slate-500">Submission type</dt>
                      <dd className="mt-1 font-bold text-dark">{submissionTypeLabels[assignment.submission_type] || "Quiz assessment"}</dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <dt className="font-semibold text-slate-500">Marks</dt>
                      <dd className="mt-1 font-bold text-dark">{assignment.marks ?? "Not set"}</dd>
                    </div>
                  </dl>

                  {user.role === "student" ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[currentStatus]}`}>
                          {humanize(currentStatus)}
                        </span>
                        <a href={`#assignment-${assignment.id}`} className="rounded-xl bg-dark px-3 py-1 text-xs font-bold text-white">
                          {assessmentActionLabel(assignment, submission)}
                        </a>
                      </div>
                      {submission?.status === "graded" ? (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-semibold">Grade: {resultLabel(submission, assignment.marks)}</p>
                          <p className="mt-2 text-slate-500">Graded {formatDate(submission.graded_at)}</p>
                          <p className="mt-2">{submission.feedback || "No feedback yet."}</p>
                        </div>
                      ) : null}
                      {submission?.status === "submitted" ? (
                        <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                          Awaiting grading
                        </p>
                      ) : null}
                      {submission?.status === "returned" ? (
                        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                          <p className="font-semibold">Returned for revision</p>
                          <p className="mt-2">{submission.feedback || "Please review and resubmit."}</p>
                        </div>
                      ) : null}
                      <div id={`assignment-${assignment.id}`}>
                        <SubmissionForm assignment={assignment} existingSubmission={submission} />
                      </div>
                    </>
                  ) : null}

                  {user.role === "admin" ? (
                    <InstructorAssignmentActions
                      assignment={assignment}
                      courses={courses}
                      enrollments={enrollments}
                      instructors={dashboard.instructors || []}
                      allowInstructorSelect
                    />
                  ) : null}

                  {user.role === "parent" ? (
                    <div className="mt-5 space-y-3">
                      {assignment.submissions.length === 0 ? (
                        <EmptyState>No child submissions yet.</EmptyState>
                      ) : (
                        assignment.submissions.map((item) => (
                          <div key={item.id} className="rounded-xl bg-slate-50 p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-dark">{item.student_name}</p>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[item.status]}`}>
                                {humanize(item.status)}
                              </span>
                            </div>
                            {item.status === "graded" ? (
                              <p className="mt-3 text-slate-600">Grade: {resultLabel(item, assignment.marks)} - {item.feedback || "No feedback yet."}</p>
                            ) : null}
                            {item.status === "submitted" ? <p className="mt-3 font-semibold text-blue-700">Awaiting grading</p> : null}
                            {item.status === "returned" ? <p className="mt-3 text-amber-800">Returned: {item.feedback || "Please review and resubmit."}</p> : null}
                            <p className="mt-2 text-slate-500">Submitted {formatDate(item.submitted_at)} - Graded {formatDate(item.graded_at)}</p>
                            {item.quiz_answers ? <p className="mt-2 text-slate-600">Quiz answers recorded.</p> : null}
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </AcademyCard>
              );
            })}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="We could not load assignments." /></section>;
  }
}
