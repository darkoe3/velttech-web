"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AcademyCard, ErrorState, formatDate, formatMoney, humanize } from "@/components/ui/academy";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [state, setState] = useState({ status: "verifying", data: null, error: "" });

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setState({ status: "failed", data: null, error: "Missing payment reference." });
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Payment verification failed.");
        }
        setState({
          status: data.payment?.status === "paid" ? "success" : "failed",
          data,
          error: data.payment?.status === "paid" ? "" : "Paystack has not confirmed this payment.",
        });
      } catch (error) {
        setState({ status: "failed", data: null, error: error.message || "Payment verification failed." });
      }
    }

    verifyPayment();
  }, [reference]);

  const payment = state.data?.payment;

  return (
    <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
      {state.status === "verifying" ? (
        <AcademyCard className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-dark">Verifying payment</h1>
          <p className="mt-2 text-sm text-slate-600">Please wait while Velttech confirms your Paystack transaction.</p>
        </AcademyCard>
      ) : null}

      {state.status === "success" && payment ? (
        <AcademyCard>
          <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-dark">Payment confirmed</h1>
          <p className="mt-2 text-sm text-slate-600">Your receipt is ready in your payment history.</p>
          <dl className="mt-6 divide-y divide-slate-100 text-sm">
            {[
              ["Receipt number", payment.receipt_number],
              ["Reference", payment.transaction_reference],
              ["Student", payment.student_name],
              ["Course", payment.course_title],
              ["Amount", formatMoney(payment.amount)],
              ["Status", humanize(payment.status)],
              ["Paid at", formatDate(payment.paid_at, { timeStyle: "short" })],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-2 py-3 sm:grid-cols-[160px_1fr]">
                <dt className="font-bold text-slate-600">{label}</dt>
                <dd className="text-dark">{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
          <Link href="/payments" className="mt-6 inline-flex rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white">
            Back to Payments
          </Link>
        </AcademyCard>
      ) : null}

      {state.status === "failed" ? (
        <div>
          <ErrorState title="Payment not confirmed" message={state.error || "We could not verify this transaction."} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/payments" className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white">
              Back to Payments
            </Link>
            {reference ? (
              <Link href={`/payments/verify?reference=${encodeURIComponent(reference)}`} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-dark">
                Retry Verification
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
        <AcademyCard className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-dark">Preparing verification</h1>
        </AcademyCard>
      </section>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
