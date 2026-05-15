import { djangoApiFetch } from "@/lib/django-api";
import {
  AcademyCard,
  EmptyState,
  ErrorState,
  SectionHeading,
  formatDate,
  humanize,
} from "@/components/ui/academy";

export default async function NotificationsPage() {
  let notifications;

  try {
    notifications = await djangoApiFetch("notifications");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <ErrorState message="We could not load notifications right now. Please try again shortly." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="Notifications"
        description="Announcements and updates from the academy."
      />

      {notifications.length === 0 ? (
        <EmptyState>No notifications yet.</EmptyState>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <AcademyCard key={notification.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-dark">{notification.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  {humanize(notification.audience)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{notification.message}</p>
            </AcademyCard>
          ))}
        </div>
      )}
    </section>
  );
}
