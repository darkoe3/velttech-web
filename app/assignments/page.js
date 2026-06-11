import { AssignmentForm, SubmissionForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
  returned: "bg-amber-100 text-amber-700",
};

const submissionTypeLabels = {
  text: "Text answer",
  file_upload: "File upload",
  both: "Text + File upload",
};

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
        <SectionHeading title="Assignments" description="Course work and submission status in one place." />
        {user.role === "admin" ? (
          <AcademyCard className="mb-8">
            <SectionHeading title="Create Assignment" description="Publish work for a course group or a selected student." />
            <AssignmentForm
              courses={courses}
              enrollments={enrollments}
              instructors={dashboard.instructors || []}
              allowInstructorSelect
            />
          </AcademyCard>
        ) : null}
        {assignments.length === 0 ? (
          <EmptyState>No assignments available yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {assignments.map((assignment) => {
              const submission = assignment.submission;
              return (
                <AcademyCard key={assignment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-dark">{assignment.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{assignment.course_title}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                        {submissionTypeLabels[assignment.submission_type] || "Text answer"}
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
                      <dd className="mt-1 font-bold text-dark">{submissionTypeLabels[assignment.submission_type] || "Text answer"}</dd>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <dt className="font-semibold text-slate-500">Marks</dt>
                      <dd className="mt-1 font-bold text-dark">{assignment.marks ?? "Not set"}</dd>
                    </div>
                  </dl>

                  {user.role === "student" ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[submission?.status || "pending"]}`}>
                          {humanize(submission?.status || "pending")}
                        </span>
                        <a href={`#assignment-${assignment.id}`} className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-bold text-dark">
                          View Assignment
                        </a>
                      </div>
                      {submission?.status === "graded" ? (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-semibold">Grade: {submission.grade ?? submission.score ?? "Not set"} / {submission.max_score || assignment.marks || 100}</p>
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
                              <p className="mt-3 text-slate-600">Grade: {item.grade ?? item.score ?? "Not set"} / {item.max_score || assignment.marks || 100} - {item.feedback || "No feedback yet."}</p>
                            ) : null}
                            {item.status === "submitted" ? <p className="mt-3 font-semibold text-blue-700">Awaiting grading</p> : null}
                            {item.status === "returned" ? <p className="mt-3 text-amber-800">Returned: {item.feedback || "Please review and resubmit."}</p> : null}
                            <p className="mt-2 text-slate-500">Submitted {formatDate(item.submitted_at)} - Graded {formatDate(item.graded_at)}</p>
                            {item.uploaded_file_name ? (
                              <p className="mt-2 text-slate-600">
                                File: <a href={`/api/my-assignments/submissions/${item.id}/file`} className="font-bold text-secondary">{item.uploaded_file_name}</a>
                              </p>
                            ) : null}
                            {(item.text_answer || item.submission_text) ? <p className="mt-2 text-slate-600">{item.text_answer || item.submission_text}</p> : null}
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
