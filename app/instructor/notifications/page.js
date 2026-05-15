import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
  formatDate,
  humanize,
} from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorNotificationsPage() {
  try {
    const [{ authorized }, notifications] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/notifications", "notifications-page"),
    ]);

    if (!authorized) {
      return (
        <section className="mx-auto max-w-5xl px-5 py-10">
          <ErrorState message="Instructor access is required." />
        </section>
      );
    }

    return (
      <section className="mx-auto max-w-5xl px-5 py-10">
        <SectionHeading title="Notifications" />
        {notifications.length === 0 ? (
          <EmptyState>No notifications yet.</EmptyState>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <AcademyCard key={notification.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-dark">
                      {notification.title}
                    </h2>
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {humanize(notification.audience)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {notification.message}
                </p>
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-5xl px-5 py-10">
        <ErrorState message={error?.message || "We could not load instructor notifications."} />
      </section>
    );
  }
}
