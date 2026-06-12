import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle, XCircle } from "lucide-react";

function formatDate(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function humanize(value) {
  return value ? value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()) : "Not recorded";
}

async function verifyCertificate(certificateNumber) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "http";
  const response = await fetch(
    `${protocol}://${host}/api/certificates/verify/${encodeURIComponent(certificateNumber)}`,
    { cache: "no-store" },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || data?.error || "Certificate not found.");
  }
  return data;
}

export default async function VerifyCertificatePage({ params }) {
  const { certificate_number: certificateNumber } = await params;
  let certificate = null;
  let error = "";

  try {
    certificate = await verifyCertificate(certificateNumber);
  } catch (err) {
    error = err.message;
  }

  return (
    <section className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl">
        {error ? (
          <div className="rounded-lg border border-red-400 bg-red-950/40 p-6">
            <div className="flex items-start gap-3">
              <XCircle className="mt-1 h-6 w-6 shrink-0 text-red-300" />
              <div>
                <h1 className="text-2xl font-bold">Certificate Not Found</h1>
                <p className="mt-2 text-red-100">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white text-slate-900 shadow-xl">
            <div className="bg-emerald-700 px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                {certificate.status_label === "Valid" ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-100" />
                )}
                <div>
                  <h1 className="text-3xl font-bold">Certificate Verification</h1>
                  <p className="mt-1 text-emerald-50">{certificate.certificate_number}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-8">
              {certificate.status_label === "Revoked" && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
                  <p className="text-center text-lg font-bold text-red-700">Certificate Revoked</p>
                </div>
              )}
              
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Certificate Number</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.certificate_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Student Name</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.student_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Course</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.course_title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Certificate Type</dt>
                  <dd className="mt-1 text-lg font-bold">{humanize(certificate.certificate_type)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Issue Date</dt>
                  <dd className="mt-1 text-lg font-bold">{formatDate(certificate.issue_date || certificate.issued_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Completion Date</dt>
                  <dd className="mt-1 text-lg font-bold">{formatDate(certificate.completion_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Final Grade</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.final_grade || "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Final Score</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.final_score !== null && certificate.final_score !== undefined ? `${certificate.final_score}%` : "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Attendance</dt>
                  <dd className="mt-1 text-lg font-bold">{certificate.attendance_percentage !== null && certificate.attendance_percentage !== undefined ? `${certificate.attendance_percentage}%` : "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                      certificate.status_label === "Valid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {certificate.status_label}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-900">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
