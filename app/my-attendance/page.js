import { AcademyCard, EmptyState, ErrorState, SectionHeading, formatDate, humanize } from "@/components/ui/academy";
import { djangoApiFetch } from "@/lib/django-api";

export default async function MyAttendancePage() {
  try {
    const records = await djangoApiFetch("my-attendance");
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <SectionHeading title="Attendance" description="Your class attendance records." />
        {records.length === 0 ? (
          <EmptyState>No attendance records yet.</EmptyState>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {records.map((record) => (
              <AcademyCard key={record.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-dark">{record.course_title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(record.date)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                    {humanize(record.status)}
                  </span>
                </div>
                {record.remarks ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{record.remarks}</p>
                ) : null}
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <ErrorState message="We could not load attendance records." />
      </section>
    );
  }
}
