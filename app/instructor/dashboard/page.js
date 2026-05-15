import Link from "next/link";
import {
  AcademyCard,
  EmptyState,
  ErrorState,
  RoleBadge,
  SectionHeading,
  SummaryCard,
  formatDate,
  humanize,
} from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";
import { requireInstructor } from "@/lib/instructor";

export default async function InstructorDashboardPage() {
  try {
    const [{ user, authorized }, dashboard] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/dashboard", "dashboard-page"),
    ]);

    if (!authorized) {
      return (
        <section className="mx-auto max-w-7xl px-5 py-10">
          <ErrorState message="Instructor access is required." />
        </section>
      );
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <RoleBadge role={user.role} />
        <h1 className="mt-4 text-3xl font-bold text-dark">
          Welcome, {user.first_name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Review the courses, students, and enrollments currently assigned to you.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Assigned Courses"
            value={dashboard.total_assigned_courses}
          />
          <SummaryCard
            label="Assigned Students"
            value={dashboard.total_assigned_students}
          />
          <SummaryCard
            label="Active Enrollments"
            value={dashboard.active_enrollments}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section>
            <SectionHeading
              title="Recent Assigned Students"
              actionHref="/instructor/enrollments"
              actionLabel="View all →"
            />
            {dashboard.recent_enrollments.length === 0 ? (
              <EmptyState>No enrollments have been assigned yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {dashboard.recent_enrollments.map((enrollment) => (
                  <AcademyCard key={enrollment.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-dark">
                          {enrollment.student_name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {enrollment.course_title}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        {humanize(enrollment.status)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                      Start date: {formatDate(enrollment.start_date)}
                    </p>
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="Notifications"
              actionHref="/instructor/notifications"
              actionLabel="View all →"
            />
            {dashboard.notifications.length === 0 ? (
              <EmptyState>No notifications yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {dashboard.notifications.map((notification) => (
                  <AcademyCard key={notification.id}>
                    <h2 className="font-bold text-dark">{notification.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-8">
          <SectionHeading title="Quick Actions" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["My Courses", "/instructor/courses"],
              ["My Students", "/instructor/students"],
              ["Enrollments", "/instructor/enrollments"],
              ["Notifications", "/instructor/notifications"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-dark shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10">
        <ErrorState message={error?.message || "We could not load the instructor dashboard."} />
      </section>
    );
  }
}
