import { AssignmentForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

const submissionTypeLabels = {
  text: "Text answer",
  file_upload: "File upload",
  both: "Text + File upload",
};

export default async function InstructorAssignmentsPage() {
  try {
    const [{ authorized }, courses, enrollments, assignments] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "assignments-page"),
      fetchInternalJson("/api/instructor/enrollments", "assignments-page"),
      fetchInternalJson("/api/instructor/assignments", "assignments-page"),
    ]);
    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <AcademyCard>
            <SectionHeading title="Create Assignment" description="Publish work for a whole course group or one selected learner." />
            <AssignmentForm courses={courses} enrollments={enrollments} />
          </AcademyCard>
          <section>
            <SectionHeading title="Assignments" />
            {assignments.length === 0 ? (
              <EmptyState>No assignments yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
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
                        <dt className="font-semibold text-slate-500">Student/group</dt>
                        <dd className="mt-1 font-bold text-dark">{assignment.target_student_name || "Group"}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <dt className="font-semibold text-slate-500">Submission type</dt>
                        <dd className="mt-1 font-bold text-dark">{humanize(assignment.submission_type)}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <dt className="font-semibold text-slate-500">Marks</dt>
                        <dd className="mt-1 font-bold text-dark">{assignment.marks ?? "Not set"}</dd>
                      </div>
                    </dl>
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
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load assignments."} /></section>;
  }
}
