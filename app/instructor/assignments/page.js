import { AssignmentForm } from "@/components/assignments/AssignmentForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorAssignmentsPage() {
  try {
    const [{ authorized }, courses, assignments] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "assignments-page"),
      fetchInternalJson("/api/instructor/assignments", "assignments-page"),
    ]);
    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <AcademyCard>
            <SectionHeading title="Create Assignment" description="Publish work only for courses assigned to you." />
            <AssignmentForm courses={courses} />
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
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                        Due {formatDate(assignment.due_date)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{assignment.description}</p>
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
