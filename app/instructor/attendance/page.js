import { AttendanceForm } from "@/components/instructor/InstructorRecordForms";
import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorAttendancePage() {
  try {
    const [{ authorized }, enrollments, records] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/enrollments", "attendance-page"),
      fetchInternalJson("/api/instructor/attendance", "attendance-page"),
    ]);
    if (!authorized) return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    return <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AcademyCard><SectionHeading title="Record Attendance" /><AttendanceForm enrollments={enrollments} /></AcademyCard>
        <section><SectionHeading title="Recent Attendance" />{records.length===0?<EmptyState>No records yet.</EmptyState>:<div className="space-y-4">{records.map((record)=><AcademyCard key={record.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-dark">{record.student_name}</h2><p className="mt-1 text-sm text-slate-600">{record.course_title}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{humanize(record.status)}</span></div><p className="mt-4 text-sm text-slate-500">{formatDate(record.date)}</p>{record.remarks?<p className="mt-3 text-sm text-slate-600">{record.remarks}</p>:null}</AcademyCard>)}</div>}</section>
      </div>
    </section>;
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <ErrorState message={error?.message || "We could not load attendance."} />
      </section>
    );
  }
}
