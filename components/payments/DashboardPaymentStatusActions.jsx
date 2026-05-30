"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { formatMoney } from "@/components/ui/academy";

export function PayNowButton({
  outstandingAmount = 0,
  pendingPaymentIds = [],
  children = "Pay Now",
  className = "",
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const amount = Number(outstandingAmount || 0);
  const hasOutstanding = amount > 0;

  async function handlePayNow() {
    if (!hasOutstanding) return;

    if (pendingPaymentIds.length !== 1) {
      router.push("/payments");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ payment_id: pendingPaymentIds[0] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Could not initialize Paystack payment.");
      }
      window.location.assign(data.authorization_url);
    } catch (caughtError) {
      setError(caughtError.message || "Could not initialize Paystack payment.");
      setBusy(false);
    }
  }

  if (!hasOutstanding) return null;

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={handlePayNow}
        className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-dark shadow-sm ring-1 ring-primary/70 transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        {busy ? "Opening..." : children}
      </button>
      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </>
  );
}

export default function DashboardPaymentStatusActions({
  outstandingAmount = 0,
  pendingPaymentIds = [],
  currentPeriod = "",
  amountPaid = 0,
  showPaymentsWhenSettled = true,
}) {
  const amount = Number(outstandingAmount || 0);
  const hasOutstanding = amount > 0;

  return (
    <div>
      <div
        className={`rounded-xl border px-4 py-4 ${
          hasOutstanding
            ? "border-primary/70 bg-primary/15"
            : "border-accent/30 bg-accent/10"
        }`}
      >
        {hasOutstanding ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-600">Current Month</dt>
              <dd className="mt-1 font-bold text-dark">{currentPeriod || "Current period"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Amount Due</dt>
              <dd className="mt-1 text-xl font-extrabold text-dark">{formatMoney(amount)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Status</dt>
              <dd className="mt-1 font-bold text-dark">Pending</dd>
            </div>
          </dl>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-600">Current Month</dt>
              <dd className="mt-1 font-bold text-dark">{currentPeriod || "Current period"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Status</dt>
              <dd className="mt-1 font-bold text-dark">No Outstanding Payment</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600">Amount Paid</dt>
              <dd className="mt-1 text-xl font-extrabold text-dark">{formatMoney(amountPaid)}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className={`mt-5 grid gap-3 ${hasOutstanding ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {hasOutstanding ? (
          <PayNowButton outstandingAmount={outstandingAmount} pendingPaymentIds={pendingPaymentIds} />
        ) : null}
        {hasOutstanding || showPaymentsWhenSettled ? (
          <Link
            href="/payments"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View Payments
          </Link>
        ) : null}
        <Link
          href="/payments"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-dark transition hover:border-slate-300 hover:bg-slate-50"
        >
          View Receipts
        </Link>
      </div>
    </div>
  );
}
