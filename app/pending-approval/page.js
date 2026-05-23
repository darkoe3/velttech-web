import Link from "next/link";
import { Clock3, Mail, Phone } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/25 text-dark">
          <Clock3 className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-secondary">
          Application Received
        </p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Awaiting Admin Approval</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Your account has been submitted successfully and is awaiting admin approval.
          You will be notified once approved.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <Mail className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span className="font-semibold">info@velttech.org</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
            <Phone className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span className="font-semibold">+233 55 510 6820</span>
          </div>
        </div>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-lg bg-dark px-4 py-3 text-sm font-bold text-white"
        >
          Back to Login
        </Link>
      </div>
    </section>
  );
}
