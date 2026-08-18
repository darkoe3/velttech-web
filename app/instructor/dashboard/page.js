import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListChecks,
  Users,
} from "lucide-react";
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

const quickActions = [
  ["Students", "/instructor/students", Users],
  ["Courses", "/instructor/courses", BookOpen],
  ["Attendance", "/instructor/attendance", ClipboardCheck],
  ["Assessments", "/instructor/assignments", ListChecks],
  ["Learning Resources", "/instructor/resources", FileText],
  ["Certificates", "/instructor/certificates", Award],
  ["Notifications", "/instructor/notifications", Bell],
];

function statusPillClass(value) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    present: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
    certificate_issued: "bg-emerald-100 text-emerald-700",
    ready_for_review: "bg-blue-100 text-blue-700",
    late: "bg-amber-100 text-amber-700",
    pending: "bg-amber-100 text-amber-700",
    incomplete: "bg-amber-100 text-amber-700",
    absent: "bg-rose-100 text-rose-700",
  };
  return styles[value] || "bg-slate-100 text-slate-700";
}

function CompactList({ items = [], empty, render }) {
  if (!items.length) return <EmptyState>{empty}</EmptyState>;
  return <div className="space-y-3">{items.slice(0, 5).map(render)}</div>;
}

function QuickActions() {
  return (
    <section className="mt-8">
      <SectionHeading title="Quick Actions" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(([label, href, Icon]) => (
          <Link key={href} href={href} className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-bold text-dark shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/20 text-dark">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function InstructorDashboardPage() {
  try {
    const [{ user, authorized }, dashboard] = await Promise.all([
      requireInstructor(),
      fetchInternalJson("/api/instructor/dashboard", "dashboard-page"),
    ]);

    if (!authorized) {
      return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message="Instructor access is required." /></section>;
    }

    const attendanceSummary = dashboard.attendance_summary || {};
    const assessmentSummary = dashboard.assessment_summary || {};
    const resourceSummary = dashboard.resource_summary || {};
    const recentAttendance = dashboard.recent_attendance || [];
    const recentEnrollments = dashboard.recent_enrollments || [];
    const notifications = dashboard.notifications || [];

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <RoleBadge role={user.role} />
          <h1 className="mt-4 text-3xl font-bold text-dark">Welcome back, {user.first_name || "Instructor"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Instructor dashboard for daily teaching, learner follow-up, resources, and assessments.</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Assigned Courses" value={dashboard.total_assigned_courses || 0} icon={BookOpen} />
          <SummaryCard label="Assigned Learners" value={dashboard.total_assigned_students || 0} icon={Users} />
          <SummaryCard label="Attendance Rate" value={`${attendanceSummary.percentage || 0}%`} detail={`${attendanceSummary.classes_attended || 0}/${attendanceSummary.total || 0} attended`} icon={ClipboardCheck} />
          <SummaryCard label="Results Pending" value={(assessmentSummary.incomplete || 0) + (assessmentSummary.ready_for_review || 0)} detail={`${assessmentSummary.approved || 0} approved`} icon={ListChecks} />
          <SummaryCard label="Published Resources" value={resourceSummary.published || 0} detail={`${resourceSummary.draft || 0} drafts`} icon={FileText} />
          <SummaryCard label="Certificates Issued" value={assessmentSummary.certificate_issued || 0} icon={Award} />
        </div>

        <QuickActions />

        <section className="mt-8">
          <SectionHeading title="Attendance Snapshot" actionHref="/instructor/attendance" actionLabel="View attendance" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Records" value={attendanceSummary.total || 0} />
            <SummaryCard label="Present" value={attendanceSummary.present || 0} />
            <SummaryCard label="Absent" value={attendanceSummary.absent || 0} />
            <SummaryCard label="Late" value={attendanceSummary.late || 0} />
            <SummaryCard label="Rate" value={`${attendanceSummary.percentage || 0}%`} />
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <section>
            <SectionHeading title="Recent Learners" actionHref="/instructor/students" actionLabel="View students" />
            <CompactList
              items={recentEnrollments}
              empty="No enrollments have been assigned yet."
              render={(enrollment) => (
                <AcademyCard key={enrollment.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-dark">{enrollment.student_name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{enrollment.course_title}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(enrollment.status)}`}>
                      {humanize(enrollment.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Start date: {formatDate(enrollment.start_date)}</p>
                </AcademyCard>
              )}
            />
          </section>

          <section>
            <SectionHeading title="Recent Attendance" actionHref="/instructor/attendance" actionLabel="View all" />
            <CompactList
              items={recentAttendance}
              empty="No attendance records have been recorded yet."
              render={(record) => (
                <AcademyCard key={record.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-dark">{record.student_name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{record.course_title}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(record.status)}`}>
                      {humanize(record.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{formatDate(record.date)}</p>
                </AcademyCard>
              )}
            />
          </section>

          <section>
            <SectionHeading title="Notifications" actionHref="/instructor/notifications" actionLabel="View all" />
            <CompactList
              items={notifications}
              empty="No notifications yet."
              render={(notification) => (
                <AcademyCard key={notification.id} className="p-4">
                  <h2 className="font-bold text-dark">{notification.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{notification.message}</p>
                </AcademyCard>
              )}
            />
          </section>
        </div>

        <section className="mt-8">
          <SectionHeading title="Teaching Workload" actionHref="/instructor/assignments" actionLabel="Manage assessments" />
          <div className="grid gap-4 md:grid-cols-3">
            <AcademyCard>
              <p className="text-sm font-semibold text-slate-500">Assessment Activity</p>
              <p className="mt-3 text-3xl font-bold text-dark">{assessmentSummary.total || 0}</p>
              <p className="mt-2 text-sm text-slate-600">{assessmentSummary.ready_for_review || 0} ready for review, {assessmentSummary.incomplete || 0} incomplete.</p>
            </AcademyCard>
            <AcademyCard>
              <p className="text-sm font-semibold text-slate-500">Learning Resources</p>
              <p className="mt-3 text-3xl font-bold text-dark">{resourceSummary.total || 0}</p>
              <p className="mt-2 text-sm text-slate-600">{resourceSummary.published || 0} published and {resourceSummary.draft || 0} drafts.</p>
              <Link href="/instructor/resources" className="mt-4 inline-flex rounded-lg bg-dark px-4 py-2 text-sm font-bold text-white">Manage Resources</Link>
            </AcademyCard>
            <AcademyCard>
              <p className="text-sm font-semibold text-slate-500">Certificates</p>
              <p className="mt-3 text-3xl font-bold text-dark">{assessmentSummary.certificate_issued || 0}</p>
              <p className="mt-2 text-sm text-slate-600">Issued certificates remain managed on the certificates page.</p>
              <Link href="/instructor/certificates" className="mt-4 inline-flex rounded-lg bg-dark px-4 py-2 text-sm font-bold text-white">Manage Certificates</Link>
            </AcademyCard>
          </div>
        </section>
      </section>
    );
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load the instructor dashboard."} /></section>;
  }
}
