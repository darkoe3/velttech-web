"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Printer, X } from "lucide-react";
import { formatDate, formatMoney, humanize } from "@/components/ui/academy";
import {
  exportPaymentsToExcel,
  exportPaymentsToPDF,
} from "@/lib/exportPayments";

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-sky-100 text-sky-700",
  failed: "bg-rose-100 text-rose-700",
  unpaid: "bg-rose-100 text-rose-700",
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

export default function PaymentHistoryTable({ rows, admin = false }) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [student, setStudent] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [exportError, setExportError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [busyPayment, setBusyPayment] = useState("");

  const students = [...new Map(rows.map((row) => [row.student_id, row.student_name])).entries()];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => b - a);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!month || String(row.month) === month) &&
          (!year || String(row.year) === year) &&
          (!student || String(row.student_id) === student) &&
          (!status || row.payment_status === status) &&
          (!search ||
            row.student_name.toLowerCase().includes(search.toLowerCase()) ||
            (row.parent_name || "").toLowerCase().includes(search.toLowerCase()) ||
            row.course_title.toLowerCase().includes(search.toLowerCase())),
      ),
    [rows, month, year, student, status, search],
  );

  const summary = useMemo(
    () => ({
      totalExpected: filteredRows.reduce((total, row) => total + Number(row.expected_amount || 0), 0),
      totalPaid: filteredRows.reduce((total, row) => total + Number(row.amount_paid || 0), 0),
      totalBalance: filteredRows.reduce((total, row) => total + Number(row.balance || 0), 0),
      paidRecords: filteredRows.filter((row) => row.payment_status === "paid").length,
      partialRecords: filteredRows.filter((row) => row.payment_status === "partial").length,
      unpaidRecords: filteredRows.filter((row) => row.payment_status === "unpaid").length,
    }),
    [filteredRows],
  );

  async function handleExport(kind) {
    if (filteredRows.length === 0) {
      setExportError("No payment data available to export.");
      return;
    }
    setExportError("");
    const prefix = admin ? "admin-payment-history" : "parent-payment-history";
    if (kind === "excel") {
      exportPaymentsToExcel(filteredRows, summary, `${prefix}.xlsx`);
    } else {
      await exportPaymentsToPDF(filteredRows, summary, `${prefix}.pdf`);
    }
  }

  async function handlePayNow(row) {
    if (!row.id) {
      setExportError("This payment has not been recorded yet. Please contact the academy office.");
      return;
    }

    setBusyPayment(row.id);
    setExportError("");
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ payment_id: row.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Could not initialize Paystack payment.");
      }
      window.location.assign(data.authorization_url);
    } catch (error) {
      setExportError(error.message || "Could not initialize Paystack payment.");
      setBusyPayment("");
    }
  }

  function receiptMarkup(row) {
    const printedDate = new Intl.DateTimeFormat("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
    return `
      <html>
        <head>
          <title>${row.receipt_number}</title>
          <style>
            @page{margin:24mm}
            body{font-family:Arial,sans-serif;color:#0f172a;background:#fff}
            .brand{display:flex;align-items:center;gap:16px;border-bottom:4px solid #F4C318;padding-bottom:18px;margin-bottom:24px}
            .brand img{height:56px;width:auto}
            h1{margin:0;font-size:24px}
            .meta{color:#475569;margin-top:6px}
            table{width:100%;border-collapse:collapse;margin-top:18px}
            td{padding:12px;border-bottom:1px solid #e2e8f0}
            td:first-child{font-weight:bold;width:35%;color:#334155}
            .status{display:inline-block;border-radius:999px;background:#7AC94333;padding:6px 12px;font-weight:bold}
            .footer{margin-top:28px;color:#475569;font-size:13px}
          </style>
        </head>
        <body>
          <div class="brand">
            <img src="/images/velttech-logo.png" alt="Velttech logo" />
            <div>
              <h1>Velttech Coding Academy</h1>
              <div class="meta">Official payment receipt</div>
            </div>
          </div>
          <table>
            <tr><td>Receipt number</td><td>${row.receipt_number}</td></tr>
            <tr><td>${admin ? "Student" : "Child"} name</td><td>${row.student_name}</td></tr>
            <tr><td>Parent name</td><td>${row.parent_name || "Not provided"}</td></tr>
            <tr><td>Course</td><td>${row.course_title}</td></tr>
            <tr><td>Amount</td><td>${formatMoney(row.amount_paid)}</td></tr>
            <tr><td>Payment date</td><td>${formatDate(row.paid_at || row.payment_date)}</td></tr>
            <tr><td>Paystack reference</td><td>${row.reference || "Not provided"}</td></tr>
            <tr><td>Payment status</td><td><span class="status">${humanize(row.payment_status)}</span></td></tr>
            <tr><td>Printed date</td><td>${printedDate}</td></tr>
          </table>
          <p class="footer">Thank you for choosing Velttech Coding Academy.</p>
        </body>
      </html>
    `;
  }

  function printReceipt(row = receipt) {
    if (!row?.receipt_number) {
      setExportError("A receipt is only available for recorded payments.");
      return;
    }
    setExportError("");
    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) return;
    printWindow.document.write(receiptMarkup(row));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleExport("pdf")}
          className="rounded-xl bg-dark px-4 py-3 text-sm font-bold text-white"
        >
          Export PDF
        </button>
        <button
          type="button"
          onClick={() => handleExport("excel")}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-dark"
        >
          Export Excel
        </button>
      </div>

      {exportError ? (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {exportError}
        </p>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder={admin?"Search student, parent, or course":"Search child/course"} className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm">
          <option value="">All months</option>
          {monthNames.slice(1).map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
        </select>
        <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm">
          <option value="">All years</option>
          {years.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={student} onChange={(event) => setStudent(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm">
          <option value="">All {admin ? "students" : "children"}</option>
          {students.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{admin ? "Student" : "Child"}</th>
              {admin ? <th className="px-4 py-3">Parent</th> : null}
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Expected Fee</th>
              <th className="px-4 py-3">Amount Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Paid Date</th>
              <th className="px-4 py-3">Receipt Number</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row, index) => (
              <tr key={`${row.student_id}-${row.course_title}-${row.year}-${row.month}-${index}`}>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-dark">{row.student_name}</td>
                {admin ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    <div>{row.parent_name || "Not provided"}</div>
                    <div className="text-xs text-slate-400">{row.parent_phone || "No phone"}</div>
                  </td>
                ) : null}
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.course_title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{monthNames[row.month]}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.year}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMoney(row.expected_amount)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMoney(row.amount_paid)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMoney(row.balance)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[row.payment_status]}`}>
                    {humanize(row.payment_status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{humanize(row.payment_method)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.reference || "Not provided"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.payment_date)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.paid_at)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-dark">{row.receipt_number || "Not issued"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {row.payment_status === "paid" ? (
                      <button
                        type="button"
                        onClick={() => row.receipt_number ? setReceipt(row) : setExportError("A receipt is only available for recorded payments.")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-dark"
                      >
                        <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                        Print Receipt
                      </button>
                    ) : null}
                    {!admin && ["unpaid", "pending", "failed"].includes(row.payment_status) ? (
                      <button
                        type="button"
                        disabled={busyPayment === row.id}
                        onClick={() => handlePayNow(row)}
                        className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {busyPayment === row.id ? "Opening..." : "Pay Now"}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No payment records match the current filters.
        </p>
      ) : null}

      {receipt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b-4 border-primary pb-5">
              <div className="flex items-center gap-4">
                <Image src="/images/velttech-logo.png" alt="Velttech logo" width={160} height={56} className="h-14 w-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-dark">Velttech Coding Academy</h2>
                  <p className="text-sm text-slate-500">Official payment receipt</p>
                </div>
              </div>
              <button type="button" onClick={() => setReceipt(null)} className="rounded-lg border border-slate-200 p-2 text-slate-500">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              {[
                ["Receipt number", receipt.receipt_number],
                [admin ? "Student name" : "Child name", receipt.student_name],
                ["Parent name", receipt.parent_name || "Not provided"],
                ["Course", receipt.course_title],
                ["Amount", formatMoney(receipt.amount_paid)],
                ["Payment date", formatDate(receipt.paid_at || receipt.payment_date)],
                ["Payment status", humanize(receipt.payment_status)],
                ["Paystack reference", receipt.reference || "Not provided"],
                ["Printed date", formatDate(new Date(), { timeStyle: "short" })],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="font-bold text-slate-600">{label}</dt>
                  <dd className="text-dark">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setReceipt(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">Close</button>
              <button type="button" onClick={() => printReceipt()} className="inline-flex items-center gap-2 rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
