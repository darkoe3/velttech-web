"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { formatMoney } from "@/components/ui/academy";

export default function DashboardPaymentStatusActions({
  outstandingAmount = 0,
  pendingPaymentIds = [],
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
          <p className="text-2xl font-bold text-dark sm:text-3xl">
            Outstanding Balance: {formatMoney(amount)}
          </p>
        ) : (
          <p className="text-sm font-bold text-dark">No outstanding payments.</p>
        )}
      </div>

      {error ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}

      <div className={`mt-5 grid gap-3 ${hasOutstanding ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {hasOutstanding ? (
          <button
            type="button"
            disabled={busy}
            onClick={handlePayNow}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-dark shadow-sm transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Opening..." : "Pay Now"}
          </button>
        ) : null}
        <Link
          href="/payments"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          View Payments
        </Link>
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
