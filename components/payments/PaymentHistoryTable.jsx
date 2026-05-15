"use client";

import { useMemo, useState } from "react";
import { formatDate, formatMoney, humanize } from "@/components/ui/academy";
import {
  exportPaymentsToExcel,
  exportPaymentsToPDF,
} from "@/lib/exportPayments";

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
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

  function handlePrintReceipt(row) {
    if (!row.receipt_number) {
      setExportError("A receipt is only available for recorded payments.");
      return;
    }
    setExportError("");
    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${row.receipt_number}</title>
          <style>
            body{font-family:Arial,sans-serif;color:#0f172a;padding:32px}
            h1{margin-bottom:8px}
            .meta{margin-bottom:24px;color:#475569}
            table{width:100%;border-collapse:collapse}
            td{padding:10px;border-bottom:1px solid #e2e8f0}
            td:first-child{font-weight:bold;width:35%}
          </style>
        </head>
        <body>
          <h1>Velttech Coding Academy Payment Receipt</h1>
          <div class="meta">Receipt number: ${row.receipt_number}</div>
          <table>
            <tr><td>${admin ? "Student" : "Child"} name</td><td>${row.student_name}</td></tr>
            <tr><td>Parent name</td><td>${row.parent_name || "Not provided"}</td></tr>
            <tr><td>Course</td><td>${row.course_title}</td></tr>
            <tr><td>Month and year</td><td>${monthNames[row.month]} ${row.year}</td></tr>
            <tr><td>Amount paid</td><td>${formatMoney(row.amount_paid)}</td></tr>
            <tr><td>Payment method</td><td>${humanize(row.payment_method)}</td></tr>
            <tr><td>Payment date</td><td>${formatDate(row.payment_date)}</td></tr>
            <tr><td>Reference</td><td>${row.reference || "Not provided"}</td></tr>
            <tr><td>Balance</td><td>${formatMoney(row.balance)}</td></tr>
            <tr><td>Status</td><td>${humanize(row.payment_status)}</td></tr>
          </table>
        </body>
      </html>
    `);
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
        <input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder={admin?"Search student/course":"Search child/course"} className="rounded-xl border border-slate-300 px-4 py-3 text-sm" />
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
              {admin ? <th className="px-4 py-3">Reference</th> : null}
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Receipt</th>
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
                {admin ? <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.reference || "Not provided"}</td> : null}
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.payment_date)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(row)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-dark"
                  >
                    Print Receipt
                  </button>
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
    </div>
  );
}
