import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { ErrorState, SectionHeading, SummaryCard, formatMoney } from "@/components/ui/academy";
import { fetchInternalJson } from "@/lib/instructor-page-fetch";

export default async function PaymentsPage() {
  try {
    const rows = await fetchInternalJson("/api/my-payments/history", "payments-page");
    const totalPaid = rows.reduce((total, row) => total + Number(row.amount_paid || 0), 0);
    const outstandingMonthlyPayment = rows.reduce((total, row) => total + Number(row.amount_due || 0), 0);
    const paidPayments = rows.filter((row) => row.payment_status === "paid").length;
    const pendingPayments = rows.filter((row) => row.payment_status === "pending").length;

    return (
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Payments" description="Monthly payment history for your children." />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Amount Paid" value={formatMoney(totalPaid)} />
          <SummaryCard label="Outstanding Monthly Payment" value={formatMoney(outstandingMonthlyPayment)} />
          <SummaryCard label="Paid Payments" value={paidPayments} />
          <SummaryCard label="Pending Payments" value={pendingPayments} />
        </div>
        <section className="mt-8">
          <PaymentHistoryTable rows={rows} />
        </section>
      </section>
    );
  } catch (error) {
    return <section className="mx-auto max-w-7xl px-5 py-10"><ErrorState message={error?.message || "We could not load your payments right now."} /></section>;
  }
}
