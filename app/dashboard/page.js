import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, CreditCard, DollarSign, Hourglass, ListChecks, Users } from "lucide-react";
import { djangoApiFetch, getCurrentUser } from "@/lib/django-api";
import {
  AcademyCard,
  EmptyState,
  ErrorState,
  RoleBadge,
  SectionHeading,
  SummaryCard,
  formatDate,
  formatMoney,
} from "@/components/ui/academy";
import PendingStudentActions from "@/components/admin/PendingStudentActions";
import AdminCharts from "@/components/admin/AdminCharts";
import DashboardPaymentStatusActions from "@/components/payments/DashboardPaymentStatusActions";

const quickActions = {
  admin: [
    { title: "Manage Notifications", description: "Publish updates for students and parents.", href: "/notifications" },
    { title: "View Payments", description: "Review the latest academy payments.", href: "/payments" },
    { title: "Browse Courses", description: "Review available academy courses.", href: "/courses" },
    { title: "Activity Logs", description: "Review admin activity.", href: "/admin/activity-logs" },
  ],
  parent: [
    { title: "Add Child", description: "Create a child profile for admin review.", href: "/my-children/new" },
    { title: "My Courses", description: "Review your children’s enrolled courses.", href: "/my-courses" },
    { title: "My Children", description: "Review children and assigned courses.", href: "/my-children" },
    { title: "Payments", description: "Review payment history and printable receipts.", href: "/payments" },
  ],
  student: [
    { title: "My Courses", description: "Open your enrolled courses.", href: "/my-courses" },
    { title: "Notifications", description: "Read the latest academy updates.", href: "/notifications" },
    { title: "Payments", description: "Review your payment history.", href: "/payments" },
  ],
  instructor: [
    { title: "Attendance", description: "Record class attendance.", href: "/instructor/attendance" },
    { title: "Lesson Notes", description: "Document what was covered in class.", href: "/instructor/lesson-notes" },
    { title: "Progress Reports", description: "Update student progress.", href: "/instructor/progress" },
  ],
};

function QuickActions({ role }) {
  const actions = quickActions[role] || quickActions.student;

  return (
    <section className="mt-8">
      <SectionHeading title="Quick Actions" description="Shortcuts to the work you do most often." />
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <AcademyCard className="h-full transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <h3 className="font-bold text-dark">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
            </AcademyCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NotificationsPreview({ notifications }) {
  return (
    <section>
      <SectionHeading
        title="Recent Notifications"
        description="Latest updates from the academy."
        actionHref="/notifications"
        actionLabel="View all →"
      />
      {notifications.length === 0 ? (
        <EmptyState>No notifications yet.</EmptyState>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <AcademyCard key={notification.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-bold text-dark">{notification.title}</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {formatDate(notification.created_at)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{notification.message}</p>
            </AcademyCard>
          ))}
        </div>
      )}
    </section>
  );
}

function StudentDashboard({ dashboard }) {
  const courses = dashboard.courses || [];
  const notifications = dashboard.notifications || [];
  const attendanceSummary = dashboard.attendance_summary || {};
  const latestProgress = dashboard.latest_progress_report;

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="My Courses" value={courses.length} />
        <SummaryCard
          label="Attendance"
          value={`${attendanceSummary.present || 0}/${attendanceSummary.total || 0}`}
          detail="Present records"
        />
        <SummaryCard label="Notifications" value={notifications.length} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section>
          <SectionHeading title="My Courses" description="Your current enrolled courses." />
          {courses.length === 0 ? (
            <EmptyState>You are not enrolled in any courses yet.</EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <AcademyCard key={course.id}>
                  <h3 className="text-lg font-bold text-dark">{course.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Progress placeholder
                  </p>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section>
            <SectionHeading title="Upcoming Classes" />
            <AcademyCard>
              <p className="text-sm text-slate-600">Upcoming classes will appear here soon.</p>
            </AcademyCard>
          </section>
          <section>
            <SectionHeading title="Assignments" />
            <AcademyCard>
              <p className="text-sm text-slate-600">Assignments will appear here once published.</p>
            </AcademyCard>
          </section>
        </div>
      </div>

      <div className="mt-8">
        <NotificationsPreview notifications={notifications} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeading title="My Attendance Summary" />
          <AcademyCard>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-slate-500">Present</dt><dd className="mt-1 font-bold text-dark">{attendanceSummary.present || 0}</dd></div>
              <div><dt className="font-semibold text-slate-500">Absent</dt><dd className="mt-1 font-bold text-dark">{attendanceSummary.absent || 0}</dd></div>
              <div><dt className="font-semibold text-slate-500">Late</dt><dd className="mt-1 font-bold text-dark">{attendanceSummary.late || 0}</dd></div>
              <div><dt className="font-semibold text-slate-500">Excused</dt><dd className="mt-1 font-bold text-dark">{attendanceSummary.excused || 0}</dd></div>
            </dl>
          </AcademyCard>
        </section>
        <section>
          <SectionHeading title="My Progress Report" />
          {latestProgress ? (
            <AcademyCard>
              <h3 className="font-bold text-dark">{latestProgress.course_title}</h3>
              <p className="mt-3 text-3xl font-bold text-dark">{latestProgress.progress_score}%</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {latestProgress.instructor_comment || "No instructor comment yet."}
              </p>
            </AcademyCard>
          ) : (
            <EmptyState>No progress report has been added yet.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}

function ParentDashboard({ dashboard }) {
  const children = dashboard.children || [];
  const notifications = dashboard.notifications || [];
  const recentPayments = dashboard.recent_payments || [];
  const paymentSummary = dashboard.payment_summary || {};

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="My Children" value={children.length} />
        <SummaryCard label="Paid Payments" value={paymentSummary.completed || 0} />
        <SummaryCard label="Pending Payments" value={paymentSummary.pending || 0} />
        <SummaryCard label="Total Paid" value={formatMoney(paymentSummary.completed_amount)} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section>
          <SectionHeading
            title="My Children"
            description="Children linked to your account."
            actionHref="/my-children/new"
            actionLabel="Add Child →"
          />
          {children.length === 0 ? (
            <EmptyState>No children are linked to your account yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <AcademyCard key={child.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-dark">{child.full_name}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {child.approval_status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-500">Enrolled courses</p>
                    {child.courses.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">No enrolled courses yet.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {child.courses.map((course) => (
                          <span
                            key={course.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                          >
                            {course.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section>
            <SectionHeading title="Payment Status" />
            <AcademyCard>
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Total payments</dt>
                  <dd className="font-bold text-dark">{paymentSummary.total || 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Completed</dt>
                  <dd className="font-bold text-dark">{paymentSummary.completed || 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Pending</dt>
                  <dd className="font-bold text-dark">{paymentSummary.pending || 0}</dd>
                </div>
              </dl>
              <div className="mt-5">
                <DashboardPaymentStatusActions
                  outstandingAmount={paymentSummary.outstanding_amount}
                  pendingPaymentIds={paymentSummary.pending_payment_ids || []}
                />
              </div>
            </AcademyCard>
          </section>
          <section>
            <SectionHeading title="Latest Progress Report" />
            {children.some((child) => child.latest_progress_report) ? (
              <div className="space-y-4">
                {children
                  .filter((child) => child.latest_progress_report)
                  .map((child) => (
                    <AcademyCard key={child.id}>
                      <h3 className="font-bold text-dark">{child.full_name}</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {child.latest_progress_report.course_title}
                      </p>
                      <p className="mt-3 text-2xl font-bold text-dark">
                        {child.latest_progress_report.progress_score}%
                      </p>
                    </AcademyCard>
                  ))}
              </div>
            ) : (
              <EmptyState>No progress reports yet.</EmptyState>
            )}
          </section>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeading title="Child Attendance Summary" />
          {children.length === 0 ? (
            <EmptyState>No children are linked to your account yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <AcademyCard key={child.id}>
                  <h3 className="font-bold text-dark">{child.full_name}</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    Present {child.attendance_summary.present} of {child.attendance_summary.total} records
                  </p>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>
        <section>
          <SectionHeading title="Recent Payments" />
          {recentPayments.length === 0 ? (
            <EmptyState>No payments recorded yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <AcademyCard key={payment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{payment.course_title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{payment.student_name}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {payment.status}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-dark">{formatMoney(payment.amount)}</p>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>
        <NotificationsPreview notifications={notifications} />
      </div>
    </>
  );
}

function AdminDashboard({ dashboard }) {
  const summary = dashboard.summary || {};
  const recentRegistrations = dashboard.recent_registrations || [];
  const recentPayments = dashboard.recent_payments || [];
  const notifications = dashboard.notifications || [];
  const pendingChildren = dashboard.pending_children || [];
  const approvedUnassignedChildren = dashboard.approved_unassigned_children || [];
  const latestActivityLogs = dashboard.latest_activity_logs || [];

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Students" value={summary.total_students || 0} icon={Users} />
        <SummaryCard label="Approved Students" value={summary.approved_students || 0} icon={CheckCircle2} />
        <SummaryCard label="Pending Approvals" value={summary.pending_approvals || 0} icon={Hourglass} />
        <SummaryCard label="Total Courses" value={summary.total_courses || 0} icon={BookOpen} />
        <SummaryCard label="Total Payments" value={summary.total_payments || 0} icon={CreditCard} />
        <SummaryCard label="Total Paid Amount" value={formatMoney(summary.total_paid_amount)} icon={DollarSign} />
        <SummaryCard label="Current Month Revenue" value={formatMoney(summary.current_month_revenue)} icon={ListChecks} />
        <SummaryCard label="Pending Payments" value={summary.pending_payments || 0} icon={Clock} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section>
          <SectionHeading title="Pending Students" />
          {pendingChildren.length === 0 ? (
            <EmptyState>No children are waiting for approval.</EmptyState>
          ) : (
            <div className="space-y-4">
              {pendingChildren.map((child) => (
                <AcademyCard key={child.id}>
                  <h3 className="font-bold text-dark">{child.full_name}</h3>
                  <p className="mt-2 text-sm text-slate-600">Awaiting admin approval.</p>
                  <PendingStudentActions studentId={child.id} />
                </AcademyCard>
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading title="Recent Registrations" />
          {recentRegistrations.length === 0 ? (
            <EmptyState>No registrations yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {recentRegistrations.map((registration) => (
                <AcademyCard key={registration.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">
                        {[registration.first_name, registration.last_name].filter(Boolean).join(" ") ||
                          registration.email}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{registration.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {registration.role}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{formatDate(registration.date_joined)}</p>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading title="Recent Payments" />
          {recentPayments.length === 0 ? (
            <EmptyState>No payments recorded yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <AcademyCard key={payment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{payment.student_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{payment.course_title}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {payment.status}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-dark">{formatMoney(payment.amount)}</p>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8">
        <SectionHeading title="Approved but Unassigned" />
        {approvedUnassignedChildren.length === 0 ? (
          <EmptyState>No approved children are waiting for enrollment.</EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approvedUnassignedChildren.map((child) => (
              <AcademyCard key={child.id}>
                <h3 className="font-bold text-dark">{child.full_name}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Approved and ready for course assignment.
                </p>
                <Link
                  href={`/admin/enrollments/new?student=${child.id}`}
                  className="mt-4 inline-flex rounded-xl bg-dark px-3 py-2 text-sm font-bold text-white"
                >
                  Assign Course
                </Link>
              </AcademyCard>
            ))}
          </div>
        )}
      </section>
      <AdminCharts dashboard={dashboard} />

      <section className="mt-8">
        <SectionHeading title="Latest Activity" description="Recent admin operations across the academy." actionHref="/admin/activity-logs" actionLabel="View all ->" />
        {latestActivityLogs.length === 0 ? (
          <EmptyState>No activity has been logged yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestActivityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(log.timestamp || log.created_at, { timeStyle: "short" })}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-dark">{log.user_email || "System"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{log.action}</td>
                    <td className="px-4 py-3 text-slate-600">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8">
        <NotificationsPreview notifications={notifications} />
      </div>
    </>
  );
}

function InstructorDashboard({ dashboard }) {
  const notifications = dashboard.notifications || [];
  const courses = dashboard.courses || [];
  const students = dashboard.assigned_students || [];

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Assigned Courses" value={courses.length} />
        <SummaryCard label="Students List" value={students.length} />
        <SummaryCard label="Attendance" value="Coming soon" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <section>
            <SectionHeading title="Assigned Courses" />
            {courses.length === 0 ? (
              <EmptyState>No assigned courses yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <AcademyCard key={course.id}>
                    <h3 className="font-bold text-dark">{course.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>
          <section>
            <SectionHeading title="Students List" />
            {students.length === 0 ? (
              <EmptyState>No assigned students yet.</EmptyState>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <AcademyCard key={student.id}>
                    <h3 className="font-bold text-dark">{student.full_name}</h3>
                  </AcademyCard>
                ))}
              </div>
            )}
          </section>
        </div>
        <NotificationsPreview notifications={notifications} />
      </div>
    </>
  );
}

export default async function DashboardPage() {
  let user;
  let dashboard;

  try {
    [user, dashboard] = await Promise.all([getCurrentUser(), djangoApiFetch("dashboard")]);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <ErrorState message="We could not load your dashboard right now. Please refresh the page or try again shortly." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <RoleBadge role={user.role} />
        <p className="text-sm text-slate-500">Academy dashboard</p>
      </div>
      <h1 className="mt-4 text-3xl font-bold text-dark">Welcome, {user.first_name}</h1>

      <div className="mt-8">
        {user.role === "student" ? <StudentDashboard dashboard={dashboard} /> : null}
        {user.role === "parent" ? <ParentDashboard dashboard={dashboard} /> : null}
        {user.role === "admin" ? <AdminDashboard dashboard={dashboard} /> : null}
        {user.role === "instructor" ? <InstructorDashboard dashboard={dashboard} /> : null}
      </div>

      <QuickActions role={user.role} />
    </section>
  );
}
