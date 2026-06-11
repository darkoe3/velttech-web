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
import PendingAccountActions from "@/components/admin/PendingAccountActions";
import AdminCharts from "@/components/admin/AdminCharts";
import DashboardPaymentStatusActions, { PayNowButton } from "@/components/payments/DashboardPaymentStatusActions";
import ChildCertificates from "@/components/certificates/ChildCertificates";

const quickActions = {
  admin: [
    { title: "Manage Notifications", description: "Publish updates for students and parents.", href: "/notifications" },
    { title: "View Payments", description: "Review the latest academy payments.", href: "/payments" },
    { title: "Certificates", description: "Issue and manage learner certificates.", href: "/admin/certificates" },
    { title: "Browse Courses", description: "Review available academy courses.", href: "/courses" },
    { title: "Activity Logs", description: "Review admin activity.", href: "/admin/activity-logs" },
  ],
  parent: [
    { title: "Add Child", description: "Create a child profile for admin review.", href: "/my-children/new" },
    { title: "My Courses", description: "Review your children’s enrolled courses.", href: "/my-courses" },
    { title: "My Children", description: "Review children and assigned courses.", href: "/my-children" },
    { title: "Payments", description: "Review payment history and printable receipts.", href: "/payments" },
    { title: "Certificates", description: "View certificates issued for your children.", href: "/my-certificates" },
  ],
  student: [
    { title: "My Courses", description: "Open your enrolled courses.", href: "/my-courses" },
    { title: "Assessments", description: "Take quizzes and review practical grades.", href: "/assignments" },
    { title: "Attendance", description: "Track your class attendance records.", href: "/my-attendance" },
    { title: "Progress", description: "Read instructor feedback and progress updates.", href: "/my-progress" },
    { title: "Certificates", description: "Download completed programme certificates.", href: "/my-certificates" },
    { title: "Notifications", description: "Read the latest academy updates.", href: "/notifications" },
    { title: "Payments", description: "Pay invoices and review receipts.", href: "/payments" },
  ],
  instructor: [
    { title: "Attendance", description: "Record class attendance.", href: "/instructor/attendance" },
    { title: "Lesson Notes", description: "Document what was covered in class.", href: "/instructor/lesson-notes" },
    { title: "Progress Reports", description: "Update student progress.", href: "/instructor/progress" },
    { title: "Assessments", description: "Create quizzes and grade practical work.", href: "/instructor/assignments" },
  ],
};

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function currentPeriodLabel() {
  const now = new Date();
  return `${monthNames[now.getMonth() + 1]} ${now.getFullYear()}`;
}

function paymentPeriod(payment) {
  if (payment?.payment_period) return payment.payment_period;
  if (payment?.month && payment?.year) return `${monthNames[payment.month]} ${payment.year}`;
  return "";
}

function statusLabel(value) {
  return value ? value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()) : "Not provided";
}

function statusPillClass(value) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    submitted: "bg-blue-100 text-blue-700",
    graded: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    absent: "bg-rose-100 text-rose-700",
  };
  return styles[value] || "bg-slate-100 text-slate-700";
}

function submissionTypeLabel(value) {
  const labels = {
    quiz: "Quiz assessment",
    practical: "Practical assessment",
  };
  return labels[value] || "Quiz assessment";
}

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
  const assignmentSummary = dashboard.assignment_summary || {};
  const assignments = dashboard.assignments || [];
  const paymentSummary = dashboard.payment_summary || {};
  const recentPayments = dashboard.recent_payments || [];
  const currentProgramme = dashboard.current_programme || {};
  const progressTracker = dashboard.progress_tracker || {};
  const profile = dashboard.profile || {};
  const selectedProgramme = dashboard.selected_programme || courses[0]?.title || "Pending assignment";
  const enrollmentStatus = dashboard.enrollment_status || "pending";
  const currentPeriod = paymentSummary.current_payment_period || currentPeriodLabel();
  const outstandingMonthlyPayment = Number(paymentSummary.outstanding_monthly_payment ?? paymentSummary.outstanding_amount ?? 0);
  const currentAmountPaid = Number(paymentSummary.current_amount_paid ?? paymentSummary.completed_amount ?? 0);
  const progressPercentage = Math.min(Number(progressTracker.progress_percentage || 0), 100);
  const learningResources = [
    {
      title: "Student Learning Guide",
      detail: "Orientation notes for Velttech Academy learners.",
      href: "/resources/velttech-academy-student-guide.txt",
    },
    {
      title: "Programme Progress Checklist",
      detail: "A simple checklist for tracking modules and class preparation.",
      href: "/resources/velttech-academy-progress-checklist.txt",
    },
  ];

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="My Programme" value={selectedProgramme} detail={statusLabel(enrollmentStatus)} />
        <SummaryCard
          label="Payment Status"
          value={outstandingMonthlyPayment > 0 ? "Pending" : "Settled"}
          detail={outstandingMonthlyPayment > 0 ? formatMoney(outstandingMonthlyPayment) : currentPeriod}
        />
        <SummaryCard
          label="Assessments"
          value={assignmentSummary.total || 0}
          detail={`${assignmentSummary.pending || 0} pending`}
        />
        <SummaryCard
          label="Attendance"
          value={`${attendanceSummary.percentage || 0}%`}
          detail={`${attendanceSummary.classes_attended || 0}/${attendanceSummary.total || 0} classes attended`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeading title="Current Programme" description="Your active learning plan and class assignment." />
          <AcademyCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-dark">{currentProgramme.name || selectedProgramme}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Instructor: {currentProgramme.instructor || "Awaiting assignment"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(enrollmentStatus)}`}>
                {statusLabel(enrollmentStatus)}
              </span>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">Start Date</dt>
                <dd className="mt-1 font-bold text-dark">{formatDate(currentProgramme.start_date)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">End Date</dt>
                <dd className="mt-1 font-bold text-dark">{formatDate(currentProgramme.end_date)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">Programme Name</dt>
                <dd className="mt-1 font-bold text-dark">{currentProgramme.name || selectedProgramme}</dd>
              </div>
            </dl>
          </AcademyCard>
        </section>

        <section>
          <SectionHeading title="Progress Tracker" actionHref="/my-progress" actionLabel="View report ->" />
          <AcademyCard>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Overall progress</p>
                <p className="mt-2 text-4xl font-bold text-dark">{progressPercentage}%</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p><span className="font-bold text-dark">{progressTracker.modules_completed || 0}</span> modules completed</p>
                <p><span className="font-bold text-dark">{progressTracker.modules_remaining || 0}</span> modules remaining</p>
              </div>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercentage}%` }} />
            </div>
          </AcademyCard>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <SectionHeading title="Assessments" actionHref="/assignments" actionLabel="View all ->" />
          {assignments.length === 0 ? (
            <EmptyState>No assessments available yet.</EmptyState>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <AcademyCard key={assignment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{assignment.course_title}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {submissionTypeLabel(assignment.submission_type)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(assignment.status)}`}>
                      {statusLabel(assignment.status)}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-500">Due {formatDate(assignment.due_date)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/assignments" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                        View Assessment
                      </Link>
                      <Link href={`/assignments#assignment-${assignment.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white">
                        Start Quiz
                      </Link>
                    </div>
                  </div>
                </AcademyCard>
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading title="Attendance" actionHref="/my-attendance" actionLabel="View records ->" />
          <AcademyCard>
            <dl className="grid gap-4 text-sm sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">Total Classes</dt>
                <dd className="mt-1 text-2xl font-bold text-dark">{attendanceSummary.total || 0}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">Classes Attended</dt>
                <dd className="mt-1 text-2xl font-bold text-dark">{attendanceSummary.classes_attended || 0}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-semibold text-slate-500">Attendance Percentage</dt>
                <dd className="mt-1 text-2xl font-bold text-dark">{attendanceSummary.percentage || 0}%</dd>
              </div>
            </dl>
          </AcademyCard>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <SectionHeading title="Payments" />
          <AcademyCard>
            <DashboardPaymentStatusActions
              outstandingAmount={outstandingMonthlyPayment}
              pendingPaymentIds={paymentSummary.pending_payment_ids || []}
              currentPeriod={currentPeriod}
              amountPaid={currentAmountPaid}
            />
          </AcademyCard>
        </section>

        <section>
          <SectionHeading title="Profile" />
          <AcademyCard>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Name</dt>
                <dd className="mt-1 font-bold text-dark">{profile.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd className="mt-1 break-words text-slate-800">{profile.email || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Phone</dt>
                <dd className="mt-1 text-slate-800">{profile.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Programme</dt>
                <dd className="mt-1 font-bold text-dark">{profile.programme || selectedProgramme}</dd>
              </div>
            </dl>
          </AcademyCard>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeading title="Notifications" actionHref="/notifications" actionLabel="View all ->" />
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

        <section>
          <SectionHeading title="Resources" />
          <div className="space-y-4">
            {learningResources.map((resource) => (
              <AcademyCard key={resource.title}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-dark">{resource.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{resource.detail}</p>
                  </div>
                  <Link href={resource.href} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                    Download
                  </Link>
                </div>
              </AcademyCard>
            ))}
          </div>
        </section>
      </div>

      {recentPayments.length ? (
        <section className="mt-8">
          <SectionHeading title="Recent Payments" actionHref="/payments" actionLabel="View all ->" />
          <div className="grid gap-4 md:grid-cols-2">
            {recentPayments.map((payment) => (
              <AcademyCard key={payment.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-dark">{paymentPeriod(payment) || currentPeriod}</h3>
                    <p className="mt-1 text-sm text-slate-600">{payment.course_title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(payment.status)}`}>
                    {statusLabel(payment.status)}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-dark">{formatMoney(payment.amount)}</p>
              </AcademyCard>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function ParentDashboard({ dashboard }) {
  const children = dashboard.children || [];
  const notifications = dashboard.notifications || [];
  const recentPayments = dashboard.recent_payments || [];
  const paymentSummary = dashboard.payment_summary || {};
  const currentPeriod = paymentSummary.current_payment_period || currentPeriodLabel();
  const outstandingMonthlyPayment = Number(paymentSummary.outstanding_monthly_payment ?? paymentSummary.outstanding_amount ?? 0);
  const currentAmountPaid = Number(paymentSummary.current_amount_paid ?? 0);
  const lastPayment = paymentSummary.last_payment;
  const currentPendingPaymentIds = paymentSummary.current_pending_payment_ids || paymentSummary.pending_payment_ids || [];

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Children" value={children.length} />
        <SummaryCard label="Pending Payments" value={paymentSummary.pending || 0} />
        <SummaryCard label="Amount Paid" value={formatMoney(paymentSummary.completed_amount)} />
        <SummaryCard label="Outstanding Monthly Payment" value={formatMoney(outstandingMonthlyPayment)} />
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
                    <p className="text-sm font-semibold text-slate-500">Programme/course</p>
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
                  <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <p className="font-semibold text-slate-500">Payment status for {child.current_payment_period || currentPeriod}</p>
                    <p className="mt-1 font-bold text-dark">
                      {child.current_payment_status === "pending" ? "Pending" : child.current_payment_status === "paid" ? "Paid" : "No Outstanding Payment"}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/my-progress" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                      View Progress
                    </Link>
                    <Link href="/assignments" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                      View Assignments
                    </Link>
                    {Number(child.outstanding_amount || 0) > 0 ? (
                      <PayNowButton
                        outstandingAmount={child.outstanding_amount}
                        pendingPaymentIds={child.pending_payment_ids || []}
                        className="px-4"
                      />
                    ) : null}
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <h4 className="mb-3 text-sm font-bold text-dark">Certificates</h4>
                    <ChildCertificates childId={child.id} childName={child.full_name} />
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
              <div className="mb-5 grid gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-500">Current Payment Period</p>
                  <p className="mt-1 text-lg font-bold text-dark">{currentPeriod}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-500">Last Payment</p>
                  <p className="mt-1 font-bold text-dark">
                    {lastPayment ? `${formatMoney(lastPayment.amount)} paid for ${lastPayment.payment_period}` : "No payment recorded yet"}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <DashboardPaymentStatusActions
                  outstandingAmount={outstandingMonthlyPayment}
                  pendingPaymentIds={currentPendingPaymentIds}
                  currentPeriod={currentPeriod}
                  amountPaid={currentAmountPaid}
                  showPaymentsWhenSettled={false}
                />
              </div>
              {paymentSummary.total ? null : (
                <p className="mt-4 text-sm text-slate-600">
                  No payment record has been created yet. Once Velttech Academy creates an invoice, it will appear here.
                </p>
              )}
              {paymentSummary.total && !outstandingMonthlyPayment ? (
                <p className="mt-4 text-sm text-slate-600">
                  You have no outstanding payment for the current period.
                </p>
              ) : null}
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
            <EmptyState>No payment record has been created yet. Once Velttech Academy creates an invoice, it will appear here.</EmptyState>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <AcademyCard key={payment.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{payment.course_title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{payment.student_name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{paymentPeriod(payment) || currentPeriod}</p>
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
  const pendingAccounts = dashboard.pending_accounts || [];
  const approvedUnassignedChildren = dashboard.approved_unassigned_children || [];
  const latestActivityLogs = dashboard.latest_activity_logs || [];

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Students" value={summary.total_students || 0} icon={Users} />
        <SummaryCard label="Approved Students" value={summary.approved_students || 0} icon={CheckCircle2} />
        <SummaryCard label="Pending Approvals" value={summary.pending_approvals || 0} icon={Hourglass} />
        <SummaryCard label="Pending Accounts" value={summary.pending_accounts || 0} icon={Clock} />
        <SummaryCard label="Total Courses" value={summary.total_courses || 0} icon={BookOpen} />
        <SummaryCard label="Total Payments" value={summary.total_payments || 0} icon={CreditCard} />
        <SummaryCard label="Amount Paid" value={formatMoney(summary.total_paid_amount)} icon={DollarSign} />
        <SummaryCard label="Current Month Revenue" value={formatMoney(summary.current_month_revenue)} icon={ListChecks} />
        <SummaryCard label="Pending Payments" value={summary.pending_payments || 0} icon={Clock} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section>
          <SectionHeading title="Pending Accounts" />
          {pendingAccounts.length === 0 ? (
            <EmptyState>No accounts are waiting for approval.</EmptyState>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.map((account) => (
                <AcademyCard key={account.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{account.full_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{account.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {account.account_type === "adult_learner" ? "Adult learner" : "Parent"}
                    </span>
                    {account.is_suspicious ? (
                      <span
                        title={account.suspicious_reason || "Suspicious registration"}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800"
                      >
                        Suspicious
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-3 space-y-1 text-sm text-slate-600">
                    <div><dt className="inline font-semibold">Phone:</dt> <dd className="inline">{account.phone_number || "Not provided"}</dd></div>
                    <div><dt className="inline font-semibold">Programme:</dt> <dd className="inline">{account.programme_of_interest || "Not selected"}</dd></div>
                  </dl>
                  <PendingAccountActions accountId={account.id} />
                </AcademyCard>
              ))}
            </div>
          )}
        </section>
        <section>
          <SectionHeading title="Pending Students" />
          {pendingChildren.length === 0 ? (
            <EmptyState>No children are waiting for approval.</EmptyState>
          ) : (
            <div className="space-y-4">
              {pendingChildren.map((child) => (
                <AcademyCard key={child.id}>
                  <h3 className="font-bold text-dark">{child.full_name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-slate-600">
                      {child.learner_type === "adult" ? "Adult learner" : "Child learner"} awaiting admin approval.
                    </p>
                    {child.is_suspicious ? (
                      <span
                        title={child.suspicious_reason || "Suspicious registration"}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800"
                      >
                        Suspicious
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-3 space-y-1 text-sm text-slate-600">
                    <div><dt className="inline font-semibold">Email:</dt> <dd className="inline">{child.email || "Not provided"}</dd></div>
                    <div><dt className="inline font-semibold">Phone:</dt> <dd className="inline">{child.phone_number || "Not provided"}</dd></div>
                    <div><dt className="inline font-semibold">Programme:</dt> <dd className="inline">{child.programme_of_interest || "Not selected"}</dd></div>
                  </dl>
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
                  {child.learner_type === "adult" ? "Adult learner" : "Child learner"} approved and ready for course assignment.
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
