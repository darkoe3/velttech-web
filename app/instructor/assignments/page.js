import { AssignmentForm, InstructorAssignmentActions } from "@/components/assignments/AssignmentForms";
import CombinedResults from "@/components/assignments/CombinedResults";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

const submissionTypeLabels = {
  quiz: "Quiz assessment",
  practical: "Practical assessment",
};

export default async function InstructorAssignmentsPage() {
  try {
    const [{ user, authorized }, courses, enrollments, assignments, dashboard, assessmentResults, gradedSubmissions] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "assignments-page"),
      fetchInternalJson("/api/instructor/enrollments", "assignments-page"),
      fetchInternalJson("/api/instructor/assignments", "assignments-page"),
      fetchInternalJson("/api/instructor/dashboard", "assignments-page"),
      fetchInternalJson("/api/instructor/assessment-results", "assignments-page"),
      fetchInternalJson("/api/instructor/submissions?status=graded", "assignments-page"),
    ]);
    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }
    const quizAssignments = assignments.filter((assignment) => assignment.submission_type === "quiz");
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <AcademyCard>
            <SectionHeading title="Create Quiz" description="Publish an online objective quiz for a course group or selected learner." />
            <AssignmentForm
              courses={courses}
              enrollments={enrollments}
              instructors={dashboard.instructors || []}
              allowInstructorSelect={user.role === "admin"}
              quizOnly
            />
          </AcademyCard>
          <section>
            <SectionHeading title="Objective Quizzes" />
            {quizAssignments.length === 0 ? (
              <EmptyState>No objective quizzes yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {quizAssignments.map((assignment) => (
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
                    <InstructorAssignmentActions
                      assignment={assignment}
                      courses={courses}
                      enrollments={enrollments}
                      instructors={dashboard.instructors || []}
                        allowInstructorSelect={user.role === "admin"}
                        quizOnly
                      />
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>
        </div>
        <section className="mt-10">
          <SectionHeading title="Assessment Results" description="Enter practical, final project, and objective scores together, then approve and issue certificates when eligible." />
          <CombinedResults results={assessmentResults} submissions={gradedSubmissions} userRole={user.role} />
        </section>
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load assignments."} /></section>;
  }
}
