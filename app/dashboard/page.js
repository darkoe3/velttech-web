import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  ListChecks,
  UserRound,
  Users,
} from "lucide-react";
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
  humanize,
} from "@/components/ui/academy";
import PendingStudentActions from "@/components/admin/PendingStudentActions";
import PendingAccountActions from "@/components/admin/PendingAccountActions";
import DashboardPaymentStatusActions from "@/components/payments/DashboardPaymentStatusActions";

const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const roleMessages = {
  admin: "System overview, approvals, and operational shortcuts.",
  parent: "A focused view of your children, payments, results, and resources.",
  student: "Your course progress, payments, assessments, and learning links.",
};

const actionSets = {
  admin: [
    ["Students", "/students", Users],
    ["Enrollments", "/enrollments", ClipboardCheck],
    ["Courses", "/courses", BookOpen],
    ["Payments", "/payments", CreditCard],
    ["Learning Resources", "/instructor/resources", FileText],
    ["Certificates", "/admin/certificates", Award],
    ["Notifications", "/notifications", Bell],
  ],
  parent: [
    ["Learning Resources", "/resources", FileText],
    ["Assessments / Results", "/assignments", ListChecks],
    ["Attendance", "/my-attendance", ClipboardCheck],
    ["Payments / Receipts", "/payments", CreditCard],
    ["Certificates", "/my-certificates", Award],
    ["Child Profiles", "/my-children", Users],
  ],
  student: [
    ["Learning Resources", "/resources", FileText],
    ["Assessments", "/assignments", ListChecks],
    ["Attendance", "/my-attendance", ClipboardCheck],
    ["Payments / Receipts", "/payments", CreditCard],
    ["Certificates", "/my-certificates", Award],
    ["Profile", "/dashboard", UserRound],
  ],
};

function currentPeriodLabel() {
  const now = new Date();
  return `${monthNames[now.getMonth() + 1]} ${now.getFullYear()}`;
}

function paymentPeriod(payment) {
  if (payment?.payment_period) return payment.payment_period;
  if (payment?.month && payment?.year) return `${monthNames[payment.month]} ${payment.year}`;
  return "";
}

function statusPillClass(value) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    certificate_issued: "bg-emerald-100 text-emerald-700",
    submitted: "bg-blue-100 text-blue-700",
    ready_for_review: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    incomplete: "bg-amber-100 text-amber-700",
    absent: "bg-rose-100 text-rose-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return styles[value] || "bg-slate-100 text-slate-700";
}

function DashboardHeader({ user }) {
  return (
    <header className="mb-8">
      <RoleBadge role={user.role} />
      <h1 className="mt-4 text-3xl font-bold text-dark">Welcome back, {user.first_name || "there"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{roleMessages[user.role] || "Your Velttech Academy dashboard."}</p>
    </header>
  );
}

function QuickActions({ role }) {
  const actions = actionSets[role] || actionSets.student;
  return (
    <section className="mt-8">
      <SectionHeading title="Quick Actions" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(([label, href, Icon]) => (
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

function CompactList({ items = [], empty, render }) {
  if (!items.length) return <EmptyState>{empty}</EmptyState>;
  return <div className="space-y-3">{items.slice(0, 5).map(render)}</div>;
}

function ResultSnapshot({ results = [], role }) {
  return (
    <section>
      <SectionHeading title="Assessment Results" actionHref="/assignments" actionLabel="View results" />
      <CompactList
        items={results.slice(0, 3)}
        empty="No assessment results yet."
        render={(result) => (
          <AcademyCard key={result.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-dark">{result.course_title}</h3>
                {role === "parent" ? <p className="mt-1 text-sm text-slate-600">{result.student_name}</p> : null}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(result.status)}`}>
                {humanize(result.status)}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Overall: <span className="font-bold text-dark">{result.percentage ?? 0}%</span>
              {result.certificate_number ? " - Certificate issued" : ""}
            </p>
          </AcademyCard>
        )}
      />
    </section>
  );
}

function NotificationsPreview({ notifications = [] }) {
  return (
    <section>
      <SectionHeading title="Notifications" actionHref="/notifications" actionLabel="View all" />
      <CompactList
        items={notifications}
        empty="No notifications yet."
        render={(notification) => (
          <AcademyCard key={notification.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-bold text-dark">{notification.title}</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDate(notification.created_at)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{notification.message}</p>
          </AcademyCard>
        )}
      />
    </section>
  );
}

function AdminDashboard({ dashboard }) {
  const summary = dashboard.summary || {};
  const pendingChildren = dashboard.pending_children || [];
  const pendingAccounts = dashboard.pending_accounts || [];
  const approvedUnassignedChildren = dashboard.approved_unassigned_children || [];
  const recentPayments = dashboard.recent_payments || [];
  const attentionCount = pendingChildren.length + pendingAccounts.length + approvedUnassignedChildren.length;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Total Learners" value={summary.total_students || 0} icon={Users} />
        <SummaryCard label="Enrollments" value={summary.total_enrollments || 0} icon={ClipboardCheck} />
        <SummaryCard label="Courses" value={summary.total_courses || 0} icon={BookOpen} />
        <SummaryCard label="Instructors" value={summary.total_instructors || 0} icon={GraduationCap} />
        <SummaryCard label="Approvals" value={(summary.pending_approvals || 0) + (summary.pending_accounts || 0)} icon={Bell} />
        <SummaryCard label="Pending Payments" value={summary.pending_payments || 0} icon={CreditCard} />
      </div>

      <QuickActions role="admin" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <SectionHeading title="Attention Needed" description={`${attentionCount} recent items need review.`} />
          <div className="grid gap-4 lg:grid-cols-2">
            <AcademyCard>
              <SectionHeading title="Pending Accounts" actionHref="/admin/activity-logs" actionLabel="Activity logs" />
              <CompactList
                items={pendingAccounts}
                empty="No accounts waiting for approval."
                render={(account) => (
                  <div key={account.id} className="rounded-lg bg-slate-50 p-4 text-sm">
                    <p className="font-bold text-dark">{account.full_name}</p>
                    <p className="mt-1 text-slate-600">{account.email}</p>
                    <PendingAccountActions accountId={account.id} />
                  </div>
                )}
              />
            </AcademyCard>
            <AcademyCard>
              <SectionHeading title="Pending Learners" actionHref="/students" actionLabel="View students" />
              <CompactList
                items={pendingChildren}
                empty="No learners waiting for approval."
                render={(child) => (
                  <div key={child.id} className="rounded-lg bg-slate-50 p-4 text-sm">
                    <p className="font-bold text-dark">{child.full_name}</p>
                    <p className="mt-1 text-slate-600">{humanize(child.learner_type)} awaiting review.</p>
                    <PendingStudentActions studentId={child.id} />
                  </div>
                )}
              />
            </AcademyCard>
          </div>
          {approvedUnassignedChildren.length ? (
            <AcademyCard className="mt-4">
              <SectionHeading title="Approved but Unassigned" actionHref="/admin/enrollments/new" actionLabel="Create enrollment" />
              <CompactList
                items={approvedUnassignedChildren}
                empty="No approved learners are waiting for enrollment."
                render={(child) => (
                  <div key={child.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4 text-sm">
                    <div>
                      <p className="font-bold text-dark">{child.full_name}</p>
                      <p className="mt-1 text-slate-600">{humanize(child.learner_type)} ready for course assignment.</p>
                    </div>
                    <Link href={`/admin/enrollments/new?student=${child.id}`} className="rounded-lg bg-dark px-3 py-2 text-sm font-bold text-white">Assign Course</Link>
                  </div>
                )}
              />
            </AcademyCard>
          ) : null}
        </section>

        <section>
          <SectionHeading title="Recent Payments" actionHref="/payments" actionLabel="View payments" />
          <CompactList
            items={recentPayments}
            empty="No recent payments."
            render={(payment) => (
              <AcademyCard key={payment.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-dark">{payment.student_name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{payment.course_title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(payment.status)}`}>{humanize(payment.status)}</span>
                </div>
                <p className="mt-3 font-bold text-dark">{formatMoney(payment.amount)}</p>
              </AcademyCard>
            )}
          />
        </section>
      </div>
    </>
  );
}

function ParentDashboard({ dashboard, assessmentResults = [] }) {
  const children = dashboard.children || [];
  const paymentSummary = dashboard.payment_summary || {};
  const recentPayments = dashboard.recent_payments || [];
  const notifications = dashboard.notifications || [];
  const outstandingMonthlyPayment = Number(paymentSummary.outstanding_monthly_payment ?? paymentSummary.outstanding_amount ?? 0);
  const currentAmountPaid = Number(paymentSummary.current_amount_paid ?? paymentSummary.completed_amount ?? 0);
  const currentPeriod = paymentSummary.current_payment_period || currentPeriodLabel();
  const certificateCount = assessmentResults.filter((result) => result.certificate_id).length;
  const totalAttendance = children.reduce((sum, child) => sum + Number(child.attendance_summary?.total || 0), 0);
  const presentAttendance = children.reduce((sum, child) => sum + Number(child.attendance_summary?.present || 0), 0);
  const attendancePercent = totalAttendance ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Children" value={children.length} icon={Users} />
        <SummaryCard label="Attendance" value={`${attendancePercent}%`} detail={`${presentAttendance}/${totalAttendance} present`} icon={ClipboardCheck} />
        <SummaryCard label="Results" value={assessmentResults.length} icon={ListChecks} />
        <SummaryCard label="Payment" value={outstandingMonthlyPayment > 0 ? "Pending" : "Settled"} detail={outstandingMonthlyPayment > 0 ? formatMoney(outstandingMonthlyPayment) : currentPeriod} icon={CreditCard} />
        <SummaryCard label="Certificates" value={certificateCount} icon={Award} />
        <SummaryCard label="Resources" value="Open" detail="Shared links and notes" icon={FileText} />
      </div>

      <QuickActions role="parent" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeading title="Children" actionHref="/my-children" actionLabel="View profiles" />
          <CompactList
            items={children}
            empty="No children are linked to your account yet."
            render={(child) => {
              const courses = child.courses || [];
              const childResults = assessmentResults.filter((result) => result.student_name === child.full_name);
              return (
                <AcademyCard key={child.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-dark">{child.full_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{courses[0]?.title || child.programme_of_interest || "Awaiting course assignment"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(child.approval_status)}`}>{humanize(child.approval_status)}</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Attendance</dt><dd className="mt-1 font-bold text-dark">{child.attendance_summary?.present || 0}/{child.attendance_summary?.total || 0}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Results</dt><dd className="mt-1 font-bold text-dark">{childResults.length}</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Certificate</dt><dd className="mt-1 font-bold text-dark">{childResults.some((result) => result.certificate_id) ? "Issued" : "Not issued"}</dd></div>
                  </dl>
                </AcademyCard>
              );
            }}
          />
        </section>

        <div className="space-y-6">
          <section>
            <SectionHeading title="Payment Snapshot" actionHref="/payments" actionLabel="View payments" />
            <AcademyCard>
              <DashboardPaymentStatusActions
                outstandingAmount={outstandingMonthlyPayment}
                pendingPaymentIds={paymentSummary.current_pending_payment_ids || paymentSummary.pending_payment_ids || []}
                currentPeriod={currentPeriod}
                amountPaid={currentAmountPaid}
                showPaymentsWhenSettled={false}
              />
            </AcademyCard>
          </section>
          <ResultSnapshot results={assessmentResults} role="parent" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <SectionHeading title="Recent Payments" actionHref="/payments" actionLabel="View receipts" />
          <CompactList
            items={recentPayments}
            empty="No payment record has been created yet."
            render={(payment) => (
              <AcademyCard key={payment.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-dark">{payment.course_title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{payment.student_name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{paymentPeriod(payment) || currentPeriod}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(payment.status)}`}>{humanize(payment.status)}</span>
                </div>
                <p className="mt-3 font-bold text-dark">{formatMoney(payment.amount)}</p>
              </AcademyCard>
            )}
          />
        </section>
        <NotificationsPreview notifications={notifications} />
      </div>
    </>
  );
}

function StudentDashboard({ dashboard, assessmentResults = [] }) {
  const courses = dashboard.courses || [];
  const notifications = dashboard.notifications || [];
  const attendanceSummary = dashboard.attendance_summary || {};
  const assignmentSummary = dashboard.assignment_summary || {};
  const assignments = dashboard.assignments || [];
  const paymentSummary = dashboard.payment_summary || {};
  const recentPayments = dashboard.recent_payments || [];
  const currentProgramme = dashboard.current_programme || {};
  const progressTracker = dashboard.progress_tracker || {};
  const selectedProgramme = dashboard.selected_programme || courses[0]?.title || "Pending assignment";
  const enrollmentStatus = dashboard.enrollment_status || "pending";
  const currentPeriod = paymentSummary.current_payment_period || currentPeriodLabel();
  const outstandingMonthlyPayment = Number(paymentSummary.outstanding_monthly_payment ?? paymentSummary.outstanding_amount ?? 0);
  const currentAmountPaid = Number(paymentSummary.current_amount_paid ?? paymentSummary.completed_amount ?? 0);
  const certificateCount = assessmentResults.filter((result) => result.certificate_id).length;
  const progressPercentage = Math.min(Number(progressTracker.progress_percentage || 0), 100);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Current Course" value={selectedProgramme} detail={humanize(enrollmentStatus)} icon={BookOpen} />
        <SummaryCard label="Attendance" value={`${attendanceSummary.percentage || 0}%`} detail={`${attendanceSummary.classes_attended || 0}/${attendanceSummary.total || 0} classes`} icon={ClipboardCheck} />
        <SummaryCard label="Assessments" value={assignmentSummary.total || 0} detail={`${assignmentSummary.pending || 0} pending`} icon={ListChecks} />
        <SummaryCard label="Resources" value="Open" detail="Shared links and notes" icon={FileText} />
        <SummaryCard label="Payment" value={outstandingMonthlyPayment > 0 ? "Pending" : "Settled"} detail={outstandingMonthlyPayment > 0 ? formatMoney(outstandingMonthlyPayment) : currentPeriod} icon={CreditCard} />
        <SummaryCard label="Certificates" value={certificateCount} icon={Award} />
      </div>

      <QuickActions role="student" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeading title="Current Course" actionHref="/my-courses" actionLabel="View courses" />
          <AcademyCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-dark">{currentProgramme.name || selectedProgramme}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">Instructor: {currentProgramme.instructor || "Awaiting assignment"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(enrollmentStatus)}`}>{humanize(enrollmentStatus)}</span>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 px-4 py-3"><dt className="font-semibold text-slate-500">Start</dt><dd className="mt-1 font-bold text-dark">{formatDate(currentProgramme.start_date)}</dd></div>
              <div className="rounded-lg bg-slate-50 px-4 py-3"><dt className="font-semibold text-slate-500">End</dt><dd className="mt-1 font-bold text-dark">{formatDate(currentProgramme.end_date)}</dd></div>
              <div className="rounded-lg bg-slate-50 px-4 py-3"><dt className="font-semibold text-slate-500">Progress</dt><dd className="mt-1 font-bold text-dark">{progressPercentage}%</dd></div>
            </dl>
          </AcademyCard>
        </section>

        <section>
          <SectionHeading title="Payment Snapshot" actionHref="/payments" actionLabel="View payments" />
          <AcademyCard>
            <DashboardPaymentStatusActions
              outstandingAmount={outstandingMonthlyPayment}
              pendingPaymentIds={paymentSummary.pending_payment_ids || []}
              currentPeriod={currentPeriod}
              amountPaid={currentAmountPaid}
              showPaymentsWhenSettled={false}
            />
          </AcademyCard>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section>
          <SectionHeading title="Assessments" actionHref="/assignments" actionLabel="View all" />
          <CompactList
            items={assignments}
            empty="No assessments available yet."
            render={(assignment) => (
              <AcademyCard key={assignment.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-dark">{assignment.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{assignment.course_title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusPillClass(assignment.status)}`}>{humanize(assignment.status)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">Due {formatDate(assignment.due_date)}</p>
              </AcademyCard>
            )}
          />
        </section>
        <ResultSnapshot results={assessmentResults} role="student" />
        <section>
          <SectionHeading title="Recent Payments" actionHref="/payments" actionLabel="View receipts" />
          <CompactList
            items={recentPayments}
            empty="No recent payments."
            render={(payment) => (
              <AcademyCard key={payment.id} className="p-4">
                <h3 className="font-bold text-dark">{paymentPeriod(payment) || currentPeriod}</h3>
                <p className="mt-1 text-sm text-slate-600">{payment.course_title}</p>
                <p className="mt-3 font-bold text-dark">{formatMoney(payment.amount)}</p>
              </AcademyCard>
            )}
          />
        </section>
      </div>

      <div className="mt-8">
        <NotificationsPreview notifications={notifications} />
      </div>
    </>
  );
}

export default async function DashboardPage() {
  let user;
  let dashboard;
  let assessmentResults = [];

  try {
    [user, dashboard] = await Promise.all([getCurrentUser(), djangoApiFetch("dashboard")]);
    if (user.role === "student" || user.role === "parent") {
      assessmentResults = await djangoApiFetch("my-assessment-results");
    }
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

  if (user.role === "instructor") {
    redirect("/instructor/dashboard");
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <DashboardHeader user={user} />
      {user.role === "student" ? <StudentDashboard dashboard={dashboard} assessmentResults={assessmentResults} /> : null}
      {user.role === "parent" ? <ParentDashboard dashboard={dashboard} assessmentResults={assessmentResults} /> : null}
      {user.role === "admin" ? <AdminDashboard dashboard={dashboard} /> : null}
    </section>
  );
}
