import { SubmissionForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
};

export default async function AssignmentsPage() {
  try {
    const [user, assignments] = await Promise.all([getCurrentUser(), djangoApiFetch("my-assignments")]);
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="Assignments" description="Course work and submission status in one place." />
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
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                      Due {formatDate(assignment.due_date)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{assignment.description}</p>

                  {user.role === "student" ? (
                    <>
                      <div className="mt-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[submission?.status || "pending"]}`}>
                          {humanize(submission?.status || "pending")}
                        </span>
                      </div>
                      {submission?.status === "graded" ? (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                          <p className="font-semibold">Score: {submission.score ?? "Not set"}</p>
                          <p className="mt-2">{submission.feedback || "No feedback yet."}</p>
                        </div>
                      ) : null}
                      <SubmissionForm assignmentId={assignment.id} existingSubmission={submission} />
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
                              <p className="mt-3 text-slate-600">Score: {item.score ?? "Not set"} · {item.feedback || "No feedback yet."}</p>
                            ) : null}
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
