"use client";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

function formatCurrency(value) {
  return Number(value || 0).toFixed(2);
}

function paymentPeriod(payment) {
  if (payment.payment_period) return payment.payment_period;
  if (payment.month && payment.year) return `${monthNames[payment.month]} ${payment.year}`;
  return payment.year || "";
}

function paymentAmount(payment) {
  return Number(payment.amount ?? payment.amount_paid ?? payment.amount_due ?? 0);
}

function normalizeRows(payments) {
  return payments.map((payment) => ({
    Student: payment.student_name,
    Programme: payment.course_title,
    "Payment Period": paymentPeriod(payment),
    Amount: paymentAmount(payment),
    Status: payment.payment_status,
    "Payment Method": payment.payment_method || "",
    "Receipt Number": payment.receipt_number || "",
  }));
}

export function exportPaymentsToExcel(payments, summary, filename) {
  const workbook = XLSX.utils.book_new();
  const rows = normalizeRows(payments);
  const summaryRows = [
    ["Velttech Coding Academy Payment History"],
    ["Generated Date", new Date().toLocaleString()],
    [],
    ["Amount Paid", Number(summary.totalPaid || 0)],
    ["Paid Records", summary.paidRecords || 0],
    ["Partial Records", summary.partialRecords || 0],
    ["Pending Records", summary.pendingRecords || 0],
    ["Unpaid Records", summary.unpaidRecords || 0],
    [],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.sheet_add_json(worksheet, rows, {
    origin: -1,
  });
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");
  XLSX.writeFile(workbook, filename);
}

async function addLogoHeader(doc) {
  try {
    const response = await fetch("/images/velttech-logo.png");
    if (!response.ok) throw new Error("Logo unavailable");
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    doc.addImage(dataUrl, "PNG", 14, 8, 28, 14);
    doc.setFontSize(16);
    doc.text("Velttech Coding Academy Payment History", 48, 16);
  } catch {
    doc.setFontSize(16);
    doc.text("Velttech Coding Academy Payment History", 14, 16);
  }
}

export async function exportPaymentsToPDF(payments, summary, filename) {
  const doc = new jsPDF({
    orientation: "landscape",
  });
  await addLogoHeader(doc);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

  autoTable(doc, {
    startY: 29,
    head: [["Amount Paid", "Paid Records", "Partial Records", "Pending Records", "Unpaid Records"]],
    body: [[
      formatCurrency(summary.totalPaid),
      summary.paidRecords || 0,
      summary.partialRecords || 0,
      summary.pendingRecords || 0,
      summary.unpaidRecords || 0,
    ]],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [[
      "Student",
      "Programme",
      "Payment Period",
      "Amount",
      "Status",
      "Payment Method",
      "Receipt Number",
    ]],
    body: payments.map((payment) => [
      payment.student_name,
      payment.course_title,
      paymentPeriod(payment),
      formatCurrency(paymentAmount(payment)),
      payment.payment_status,
      payment.payment_method || "",
      payment.receipt_number || "",
    ]),
    theme: "striped",
    styles: { fontSize: 7.5 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
}
