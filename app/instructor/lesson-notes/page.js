import { LessonNoteForm } from "@/components/instructor/InstructorRecordForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorLessonNotesPage() {
  try {
    const [{ authorized }, courses, notes] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/courses", "lesson-notes-page"),
      fetchInternalJson("/api/instructor/lesson-notes", "lesson-notes-page"),
    ]);

    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <AcademyCard>
            <SectionHeading title="Add Lesson Note" />
            <LessonNoteForm courses={courses} />
          </AcademyCard>
          <section>
            <SectionHeading title="Recent Lesson Notes" />
            {notes.length === 0 ? (
              <EmptyState>No records yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <AcademyCard key={note.id}>
                    <h2 className="font-bold text-dark">{note.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{note.course_title} · {formatDate(note.lesson_date)}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{note.content}</p>
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
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load lesson notes."} /></section>;
  }
}
