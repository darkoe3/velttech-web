import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { EmptyState, ErrorState, SectionHeading, SummaryCard, formatMoney } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";

export default async function AdminPaymentsPage() {
  try {
    const rows = await fetchInternalJson("/api/admin/payments/history", "admin-payments-page");
    const totalExpected = rows.reduce((total, row) => total + Number(row.expected_amount || 0), 0);
    const totalPaid = rows.reduce((total, row) => total + Number(row.amount_paid || 0), 0);
    const totalBalance = rows.reduce((total, row) => total + Number(row.balance || 0), 0);
    const paidRecords = rows.filter((row) => row.payment_status === "paid").length;
    const unpaidRecords = rows.filter((row) => row.payment_status === "unpaid").length;

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Payment History" description="Monthly payment ledger across all enrolled students." />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Total Expected" value={formatMoney(totalExpected)} />
          <SummaryCard label="Amount Paid" value={formatMoney(totalPaid)} />
          <SummaryCard label="Total Balance" value={formatMoney(totalBalance)} />
          <SummaryCard label="Paid Records" value={paidRecords} />
          <SummaryCard label="Unpaid Records" value={unpaidRecords} />
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
