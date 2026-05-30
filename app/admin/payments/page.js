import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { EmptyState, ErrorState, SectionHeading, SummaryCard, formatMoney } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";

export default async function AdminPaymentsPage() {
  try {
    const rows = await fetchInternalJson("/api/admin/payments/history", "admin-payments-page");
    const totalPaid = rows.reduce((total, row) => total + Number(row.amount_paid || 0), 0);
    const outstandingMonthlyPayment = rows.reduce((total, row) => total + Number(row.amount_due || 0), 0);
    const paidRecords = rows.filter((row) => row.payment_status === "paid").length;
    const pendingRecords = rows.filter((row) => row.payment_status === "pending").length;

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Payment History" description="Monthly payment ledger across all enrolled students." />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Amount Paid" value={formatMoney(totalPaid)} />
          <SummaryCard label="Outstanding Monthly Payment" value={formatMoney(outstandingMonthlyPayment)} />
          <SummaryCard label="Paid Records" value={paidRecords} />
          <SummaryCard label="Pending Records" value={pendingRecords} />
        </div>
        <section className="mt-8">
          {rows.length === 0 ? <EmptyState>No payment records exist yet.</EmptyState> : <PaymentHistoryTable rows={rows} admin />}
        </section>
      </section>
    );
  } catch (error) {
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load payment history."} /></section>;
  }
}
