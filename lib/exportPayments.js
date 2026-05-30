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

function normalizeRows(payments) {
  return payments.map((payment) => ({
    Student: payment.student_name,
    Parent: payment.parent_name || "",
    Course: payment.course_title,
    "Payment Period": paymentPeriod(payment),
    "Expected Fee": Number(payment.expected_amount || 0),
    "Amount Paid": Number(payment.amount_paid || 0),
    Balance: Number(payment.balance || 0),
    Status: payment.payment_status,
    Method: payment.payment_method || "",
    Reference: payment.reference || "",
    "Payment Date": payment.payment_date || "",
  }));
}

export function exportPaymentsToExcel(payments, summary, filename) {
  const workbook = XLSX.utils.book_new();
  const rows = normalizeRows(payments);
  const summaryRows = [
    ["Velttech Coding Academy Payment History"],
    ["Generated Date", new Date().toLocaleString()],
    [],
    ["Total Expected", Number(summary.totalExpected || 0)],
    ["Amount Paid", Number(summary.totalPaid || 0)],
    ["Total Balance", Number(summary.totalBalance || 0)],
    ["Paid Records", summary.paidRecords || 0],
    ["Partial Records", summary.partialRecords || 0],
    ["Unpaid Records", summary.unpaidRecords || 0],
    [],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.sheet_add_json(worksheet, rows, {
    origin: -1,
  });
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
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
    head: [["Total Expected", "Amount Paid", "Total Balance", "Paid Records", "Partial Records", "Unpaid Records"]],
    body: [[
      formatCurrency(summary.totalExpected),
      formatCurrency(summary.totalPaid),
      formatCurrency(summary.totalBalance),
      summary.paidRecords || 0,
      summary.partialRecords || 0,
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
      "Parent",
      "Course",
      "Payment Period",
      "Expected Fee",
      "Amount Paid",
      "Balance",
      "Status",
      "Method",
      "Reference",
      "Payment Date",
    ]],
    body: payments.map((payment) => [
      payment.student_name,
      payment.parent_name || "",
      payment.course_title,
      paymentPeriod(payment),
      formatCurrency(payment.expected_amount),
      formatCurrency(payment.amount_paid),
      formatCurrency(payment.balance),
      payment.payment_status,
      payment.payment_method || "",
      payment.reference || "",
      payment.payment_date || "",
    ]),
    theme: "striped",
    styles: { fontSize: 7.5 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
}
