"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Download, Printer, X } from "lucide-react";
import { jsPDF } from "jspdf";
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

const supportDetails = {
  email: "info@velttech.org",
  phone: "0555106820",
  website: "https://velttech.org",
};

function paymentPeriod(row) {
  if (row.payment_period) return row.payment_period;
  if (row.month && row.year) return `${monthNames[row.month]} ${row.year}`;
  return row.year || "Not set";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
      pendingRecords: filteredRows.filter((row) => row.payment_status === "pending").length,
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
    const fields = [
      ["Receipt Number", row.receipt_number],
      ["Date Paid", formatDate(row.paid_at || row.payment_date)],
      ["Student Name", row.student_name],
      ["Parent Name", row.parent_name || "Not applicable"],
      ["Programme", row.course_title],
      ["Payment Period", paymentPeriod(row)],
      ["Amount Paid", formatMoney(row.amount_paid)],
      ["Payment Method", humanize(row.payment_method)],
      ["Transaction Reference", row.reference || "Not provided"],
      ["Payment Status", humanize(row.payment_status)],
    ];
    return `
      <html>
        <head>
          <title>${escapeHtml(row.receipt_number)}</title>
          <style>
            @page{size:A4;margin:18mm}
            *{box-sizing:border-box}
            body{font-family:Arial,sans-serif;color:#0f172a;background:#fff;margin:0}
            .receipt{min-height:260mm;display:flex;flex-direction:column}
            .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #F4C318;padding-bottom:16px;margin-bottom:24px}
            .brand-left{display:flex;align-items:center;gap:16px}
            .brand img{height:58px;width:auto}
            h1{margin:0;font-size:24px;letter-spacing:0}
            .meta{color:#475569;margin-top:6px;font-size:13px}
            .badge{border:1px solid #cbd5e1;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;text-transform:uppercase}
            table{width:100%;border-collapse:collapse;margin-top:10px;border:1px solid #e2e8f0}
            td{padding:13px 14px;border-bottom:1px solid #e2e8f0;vertical-align:top}
            tr:last-child td{border-bottom:0}
            td:first-child{font-weight:bold;width:34%;color:#334155;background:#f8fafc}
            .status{display:inline-block;border-radius:999px;background:#7AC94333;padding:6px 12px;font-weight:bold}
            .support{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:14px;color:#334155;font-size:13px;line-height:1.7}
            .footer{margin-top:auto;color:#475569;font-size:12px;border-top:1px solid #e2e8f0;padding-top:12px}
          </style>
        </head>
        <body>
          <main class="receipt">
            <div class="brand">
              <div class="brand-left">
                <img src="/images/velttech-logo.png" alt="Velttech Academy logo" />
                <div>
                  <h1>Velttech Academy</h1>
                  <div class="meta">Official payment receipt</div>
                </div>
              </div>
              <div class="badge">Receipt</div>
            </div>
            <table>
              ${fields.map(([label, value]) => (
                `<tr><td>${escapeHtml(label)}</td><td>${label === "Payment Status" ? `<span class="status">${escapeHtml(value)}</span>` : escapeHtml(value)}</td></tr>`
              )).join("")}
            </table>
            <div class="support">
              <strong>Support Contact</strong><br />
              ${supportDetails.email}<br />
              ${supportDetails.phone}<br />
              ${supportDetails.website}
            </div>
            <p class="footer">This is a computer-generated receipt and does not require a signature.</p>
          </main>
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

  async function downloadReceiptPDF(row = receipt) {
    if (!row?.receipt_number) {
      setExportError("A receipt is only available for recorded payments.");
      return;
    }
    setExportError("");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    try {
      const response = await fetch("/images/velttech-logo.png");
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "PNG", 18, 16, 36, 18);
      }
    } catch {
      // The receipt still downloads if the logo cannot be embedded.
    }

    doc.setDrawColor(244, 195, 24);
    doc.setLineWidth(1.4);
    doc.line(18, 39, 192, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Velttech Academy", 62, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("Official payment receipt", 62, 31);
    doc.setTextColor(15, 23, 42);

    const fields = [
      ["Receipt Number", row.receipt_number],
      ["Date Paid", formatDate(row.paid_at || row.payment_date)],
      ["Student Name", row.student_name],
      ["Parent Name", row.parent_name || "Not applicable"],
      ["Programme", row.course_title],
      ["Payment Period", paymentPeriod(row)],
      ["Amount Paid", formatMoney(row.amount_paid)],
      ["Payment Method", humanize(row.payment_method)],
      ["Transaction Reference", row.reference || "Not provided"],
      ["Payment Status", humanize(row.payment_status)],
    ];

    let y = 52;
    fields.forEach(([label, value]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, y - 7, 58, 12, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(18, y - 7, 174, 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, 22, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 82, y, { maxWidth: 104 });
      y += 12;
    });

    y += 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(18, y, 192, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Support Contact", 18, y);
    doc.setFont("helvetica", "normal");
    doc.text([supportDetails.email, supportDetails.phone, supportDetails.website], 18, y + 7);
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.line(18, 276, 192, 276);
    doc.text("This is a computer-generated receipt and does not require a signature.", 18, 284);
    doc.save(`${row.receipt_number}.pdf`);
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
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
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
              <th className="px-4 py-3">Payment Period</th>
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
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{paymentPeriod(row)}</td>
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
                  <h2 className="text-2xl font-bold text-dark">Velttech Academy</h2>
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
                ["Date paid", formatDate(receipt.paid_at || receipt.payment_date)],
                ["Student name", receipt.student_name],
                ["Parent name", receipt.parent_name || "Not applicable"],
                ["Programme", receipt.course_title],
                ["Payment period", paymentPeriod(receipt)],
                ["Amount paid", formatMoney(receipt.amount_paid)],
                ["Payment method", humanize(receipt.payment_method)],
                ["Transaction reference", receipt.reference || "Not provided"],
                ["Payment status", humanize(receipt.payment_status)],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="font-bold text-slate-600">{label}</dt>
                  <dd className="text-dark">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-bold text-dark">Support Contact</p>
              <p>{supportDetails.email}</p>
              <p>{supportDetails.phone}</p>
              <p>{supportDetails.website}</p>
            </div>
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
              This is a computer-generated receipt and does not require a signature.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setReceipt(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">Close</button>
              <button type="button" onClick={() => downloadReceiptPDF()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-dark">
                <Download className="h-4 w-4" aria-hidden="true" />
                PDF
              </button>
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
